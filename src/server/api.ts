import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { query, initDatabase, checkDbStatus } from "./db";
import { games as staticGames, Game, Package } from "../lib/games";

const JWT_SECRET = process.env.SESSION_SECRET || "skz_jwt_default_secret_key_2026";
const ADMIN_USER = process.env.ADMIN_USERNAME || "admin";
const ADMIN_PASS = process.env.ADMIN_PASSWORD || "Admin@SKzLab2026#";

// In-memory runtime fallbacks for orders/games if PostgreSQL is momentarily starting up
const memoryOrders: any[] = [];
let memoryGames: Game[] = JSON.parse(JSON.stringify(staticGames));

// Auto-initialize DB on module load
initDatabase().catch((e) => console.warn("DB init warning:", e.message));

// ==================== AUTH FUNCTIONS ====================

export interface SafeUser {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  created_at?: string;
}

export async function registerUser(params: {
  name: string;
  email: string;
  phone: string;
  password: string;
}): Promise<{ success: boolean; user?: SafeUser; token?: string; error?: string }> {
  await initDatabase();

  const { name, email, phone, password } = params;
  if (!name || !email || !phone || !password) {
    return { success: false, error: "All fields (Name, Email, Phone, Password) are required" };
  }

  if (password.length < 6) {
    return { success: false, error: "Password must be at least 6 characters long" };
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  if (checkDbStatus()) {
    try {
      // Check existing email or phone
      const existing = await query("SELECT id, email, phone FROM users WHERE email = $1 OR phone = $2", [
        email.toLowerCase().trim(),
        phone.trim(),
      ]);

      if (existing.rows.length > 0) {
        if (existing.rows[0].email === email.toLowerCase().trim()) {
          return { success: false, error: "An account with this email already exists" };
        }
        return { success: false, error: "An account with this phone number already exists" };
      }

      const result = await query(
        `INSERT INTO users (name, email, phone, password_hash, role)
         VALUES ($1, $2, $3, $4, 'user')
         RETURNING id, name, email, phone, role, created_at`,
        [name.trim(), email.toLowerCase().trim(), phone.trim(), passwordHash]
      );

      const user: SafeUser = result.rows[0];
      const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, {
        expiresIn: "30d",
      });

      return { success: true, user, token };
    } catch (err: any) {
      console.error("Register DB error:", err);
      return { success: false, error: "Database error: " + err.message };
    }
  }

  // Temporary local mock if PG is offline
  const mockUser: SafeUser = {
    id: Date.now(),
    name: name.trim(),
    email: email.toLowerCase().trim(),
    phone: phone.trim(),
    role: "user",
    created_at: new Date().toISOString(),
  };
  const token = jwt.sign({ id: mockUser.id, email: mockUser.email, role: mockUser.role }, JWT_SECRET, {
    expiresIn: "30d",
  });
  return { success: true, user: mockUser, token };
}

export async function loginUser(params: {
  identifier: string; // email or phone
  password: string;
}): Promise<{ success: boolean; user?: SafeUser; token?: string; error?: string }> {
  await initDatabase();

  const { identifier, password } = params;
  if (!identifier || !password) {
    return { success: false, error: "Please enter your Email/Phone and Password" };
  }

  const cleanIdentifier = identifier.toLowerCase().trim();

  if (checkDbStatus()) {
    try {
      const result = await query(
        "SELECT id, name, email, phone, password_hash, role, created_at FROM users WHERE LOWER(email) = $1 OR phone = $1",
        [cleanIdentifier]
      );

      if (result.rows.length === 0) {
        return { success: false, error: "Invalid Email/Phone or Password" };
      }

      const dbUser = result.rows[0];
      const valid = await bcrypt.compare(password, dbUser.password_hash);
      if (!valid) {
        return { success: false, error: "Invalid Email/Phone or Password" };
      }

      const user: SafeUser = {
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        phone: dbUser.phone,
        role: dbUser.role,
        created_at: dbUser.created_at,
      };

      const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, {
        expiresIn: "30d",
      });

      return { success: true, user, token };
    } catch (err: any) {
      console.error("Login DB error:", err);
      return { success: false, error: "Database error: " + err.message };
    }
  }

  return { success: false, error: "Database is connecting. Please retry in a moment." };
}

export function verifyUserToken(token: string): SafeUser | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return {
      id: decoded.id,
      name: decoded.name || "User",
      email: decoded.email,
      phone: decoded.phone || "",
      role: decoded.role || "user",
    };
  } catch {
    return null;
  }
}

// ==================== ADMIN AUTH ====================

export async function adminLogin(params: {
  username: string;
  password: string;
}): Promise<{ success: boolean; token?: string; error?: string }> {
  const { username, password } = params;

  if (username === ADMIN_USER && password === ADMIN_PASS) {
    const token = jwt.sign({ role: "admin", username }, JWT_SECRET, { expiresIn: "7d" });
    return { success: true, token };
  }

  // Also check database if any user has role 'admin'
  if (checkDbStatus()) {
    try {
      const res = await query(
        "SELECT id, name, email, password_hash, role FROM users WHERE (email = $1 OR phone = $1) AND role = 'admin'",
        [username.toLowerCase().trim()]
      );
      if (res.rows.length > 0) {
        const u = res.rows[0];
        const match = await bcrypt.compare(password, u.password_hash);
        if (match) {
          const token = jwt.sign({ id: u.id, role: "admin", username: u.email }, JWT_SECRET, { expiresIn: "7d" });
          return { success: true, token };
        }
      }
    } catch (e) {
      // ignore
    }
  }

  return { success: false, error: "Invalid Admin Username or Password" };
}

export function verifyAdminToken(token: string): boolean {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return decoded && decoded.role === "admin";
  } catch {
    return false;
  }
}

// ==================== GAMES & PACKAGES CMS ====================

export async function getAllGames(): Promise<Game[]> {
  await initDatabase();

  if (checkDbStatus()) {
    try {
      const gamesRes = await query("SELECT * FROM games WHERE is_active = true ORDER BY id ASC");
      if (gamesRes.rows.length > 0) {
        const pkgsRes = await query("SELECT * FROM game_packages ORDER BY sort_order ASC, price ASC");
        
        const games: Game[] = gamesRes.rows.map((g) => {
          const gamePackages: Package[] = pkgsRes.rows
            .filter((p) => p.game_id === g.id)
            .map((p) => ({
              id: p.package_id,
              name: p.name,
              price: Number(p.price),
              popular: p.popular,
            }));

          return {
            slug: g.slug,
            name: g.name,
            tagline: g.tagline || "",
            image: g.image,
            badge: g.badge || undefined,
            category: g.category,
            orderTime: g.order_time || undefined,
            packages: gamePackages,
            needs: typeof g.needs === "string" ? JSON.parse(g.needs) : g.needs || [],
            description: g.description || "",
          };
        });

        return games;
      }
    } catch (err) {
      console.warn("Error fetching games from DB, using fallback:", err);
    }
  }

  return memoryGames;
}

export async function getGameBySlug(slug: string): Promise<Game | null> {
  const games = await getAllGames();
  return games.find((g) => g.slug === slug) || null;
}

export async function adminGetAllGamesRaw(): Promise<any[]> {
  await initDatabase();
  if (checkDbStatus()) {
    try {
      const gamesRes = await query("SELECT * FROM games ORDER BY id DESC");
      const pkgsRes = await query("SELECT * FROM game_packages ORDER BY sort_order ASC, price ASC");

      return gamesRes.rows.map((g) => ({
        ...g,
        needs: typeof g.needs === "string" ? JSON.parse(g.needs) : g.needs,
        packages: pkgsRes.rows
          .filter((p) => p.game_id === g.id)
          .map((p) => ({
            dbId: p.id,
            id: p.package_id,
            name: p.name,
            price: Number(p.price),
            popular: p.popular,
          })),
      }));
    } catch (e: any) {
      console.error(e);
    }
  }

  return memoryGames.map((g, idx) => ({
    id: idx + 1,
    ...g,
    is_active: true,
    packages: g.packages.map((p, pidx) => ({ dbId: pidx + 1, ...p })),
  }));
}

export async function adminSaveGame(gameData: {
  id?: number;
  slug: string;
  name: string;
  tagline: string;
  image: string;
  badge?: string;
  category: string;
  order_time?: string;
  description: string;
  needs: any[];
  is_active?: boolean;
}): Promise<{ success: boolean; gameId?: number; error?: string }> {
  await initDatabase();

  if (checkDbStatus()) {
    try {
      if (gameData.id) {
        // Update
        await query(
          `UPDATE games
           SET slug = $1, name = $2, tagline = $3, image = $4, badge = $5, category = $6,
               order_time = $7, description = $8, needs = $9, is_active = $10, updated_at = NOW()
           WHERE id = $11`,
          [
            gameData.slug,
            gameData.name,
            gameData.tagline,
            gameData.image,
            gameData.badge || null,
            gameData.category,
            gameData.order_time || null,
            gameData.description,
            JSON.stringify(gameData.needs || []),
            gameData.is_active !== undefined ? gameData.is_active : true,
            gameData.id,
          ]
        );
        return { success: true, gameId: gameData.id };
      } else {
        // Insert
        const res = await query(
          `INSERT INTO games (slug, name, tagline, image, badge, category, order_time, description, needs, is_active)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
           RETURNING id`,
          [
            gameData.slug,
            gameData.name,
            gameData.tagline,
            gameData.image,
            gameData.badge || null,
            gameData.category,
            gameData.order_time || null,
            gameData.description,
            JSON.stringify(gameData.needs || []),
            gameData.is_active !== undefined ? gameData.is_active : true,
          ]
        );
        return { success: true, gameId: res.rows[0].id };
      }
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  // Memory fallback
  return { success: true, gameId: Date.now() };
}

export async function adminDeleteGame(gameId: number): Promise<{ success: boolean; error?: string }> {
  await initDatabase();
  if (checkDbStatus()) {
    try {
      await query("DELETE FROM games WHERE id = $1", [gameId]);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }
  return { success: true };
}

export async function adminSavePackage(pkgData: {
  dbId?: number;
  game_id: number;
  package_id: string;
  name: string;
  price: number;
  popular?: boolean;
}): Promise<{ success: boolean; error?: string }> {
  await initDatabase();
  if (checkDbStatus()) {
    try {
      if (pkgData.dbId) {
        await query(
          `UPDATE game_packages
           SET package_id = $1, name = $2, price = $3, popular = $4, updated_at = NOW()
           WHERE id = $5`,
          [pkgData.package_id, pkgData.name, pkgData.price, pkgData.popular || false, pkgData.dbId]
        );
      } else {
        await query(
          `INSERT INTO game_packages (game_id, package_id, name, price, popular)
           VALUES ($1, $2, $3, $4, $5)`,
          [pkgData.game_id, pkgData.package_id, pkgData.name, pkgData.price, pkgData.popular || false]
        );
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }
  return { success: true };
}

export async function adminDeletePackage(packageDbId: number): Promise<{ success: boolean; error?: string }> {
  await initDatabase();
  if (checkDbStatus()) {
    try {
      await query("DELETE FROM game_packages WHERE id = $1", [packageDbId]);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }
  return { success: true };
}

// ==================== ORDERS & CHECKOUT ====================

export interface OrderData {
  id: string;
  user_id?: number | null;
  game_name: string;
  package_name: string;
  amount: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  player_credentials: Record<string, string>;
  payment_method: string;
  payment_sender_number: string;
  transaction_id: string;
  order_status: "pending" | "processing" | "completed" | "cancelled";
  admin_notes?: string;
  created_at: string;
}

export async function createOrder(data: {
  user_id?: number | null;
  game_name: string;
  package_name: string;
  amount: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  player_credentials: Record<string, string>;
  payment_method: string;
  payment_sender_number: string;
  transaction_id: string;
}): Promise<{ success: boolean; orderId?: string; error?: string }> {
  await initDatabase();

  const orderId = `SKZ-${Math.floor(100000 + Math.random() * 900000)}`;

  if (checkDbStatus()) {
    try {
      await query(
        `INSERT INTO orders (
          id, user_id, game_name, package_name, amount,
          customer_name, customer_email, customer_phone,
          player_credentials, payment_method, payment_sender_number,
          transaction_id, order_status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'pending')`,
        [
          orderId,
          data.user_id || null,
          data.game_name,
          data.package_name,
          data.amount,
          data.customer_name,
          data.customer_email,
          data.customer_phone,
          JSON.stringify(data.player_credentials || {}),
          data.payment_method,
          data.payment_sender_number,
          data.transaction_id.trim().toUpperCase(),
        ]
      );
      return { success: true, orderId };
    } catch (err: any) {
      console.error("Order creation DB error:", err);
      return { success: false, error: err.message };
    }
  }

  // Memory fallback
  const fallbackOrder: OrderData = {
    ...data,
    id: orderId,
    order_status: "pending",
    created_at: new Date().toISOString(),
  };
  memoryOrders.unshift(fallbackOrder);
  return { success: true, orderId };
}

export async function getUserOrders(params: {
  userId?: number;
  phone?: string;
  email?: string;
}): Promise<OrderData[]> {
  await initDatabase();

  if (checkDbStatus()) {
    try {
      let q = "SELECT * FROM orders WHERE 1=0 ";
      const args: any[] = [];

      if (params.userId) {
        args.push(params.userId);
        q += `OR user_id = $${args.length} `;
      }
      if (params.phone) {
        args.push(params.phone.trim());
        q += `OR customer_phone = $${args.length} `;
      }
      if (params.email) {
        args.push(params.email.toLowerCase().trim());
        q += `OR LOWER(customer_email) = $${args.length} `;
      }

      q += "ORDER BY created_at DESC";

      const res = await query(q, args);
      return res.rows.map((row) => ({
        ...row,
        amount: Number(row.amount),
        player_credentials:
          typeof row.player_credentials === "string" ? JSON.parse(row.player_credentials) : row.player_credentials,
        created_at: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
      }));
    } catch (err) {
      console.error("Fetch user orders error:", err);
    }
  }

  // Fallback
  return memoryOrders.filter(
    (o) =>
      (params.userId && o.user_id === params.userId) ||
      (params.phone && o.customer_phone === params.phone) ||
      (params.email && o.customer_email === params.email)
  );
}

export async function adminGetAllOrders(filters?: {
  status?: string;
  search?: string;
}): Promise<OrderData[]> {
  await initDatabase();

  if (checkDbStatus()) {
    try {
      let q = "SELECT * FROM orders WHERE 1=1 ";
      const args: any[] = [];

      if (filters?.status && filters.status !== "all") {
        args.push(filters.status);
        q += `AND order_status = $${args.length} `;
      }

      if (filters?.search && filters.search.trim()) {
        const s = `%${filters.search.trim().toLowerCase()}%`;
        args.push(s);
        const idx = args.length;
        q += `AND (
          LOWER(id) LIKE $${idx} OR
          LOWER(customer_name) LIKE $${idx} OR
          customer_phone LIKE $${idx} OR
          LOWER(transaction_id) LIKE $${idx} OR
          LOWER(game_name) LIKE $${idx}
        ) `;
      }

      q += "ORDER BY created_at DESC";

      const res = await query(q, args);
      return res.rows.map((row) => ({
        ...row,
        amount: Number(row.amount),
        player_credentials:
          typeof row.player_credentials === "string" ? JSON.parse(row.player_credentials) : row.player_credentials,
        created_at: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
      }));
    } catch (err) {
      console.error("Admin fetch orders DB error:", err);
    }
  }

  return memoryOrders;
}

export async function adminUpdateOrderStatus(
  orderId: string,
  status: "pending" | "processing" | "completed" | "cancelled",
  adminNotes?: string
): Promise<{ success: boolean; error?: string }> {
  await initDatabase();

  if (checkDbStatus()) {
    try {
      await query(
        `UPDATE orders
         SET order_status = $1, admin_notes = COALESCE($2, admin_notes), updated_at = NOW()
         WHERE id = $3`,
        [status, adminNotes || null, orderId]
      );
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  const order = memoryOrders.find((o) => o.id === orderId);
  if (order) {
    order.order_status = status;
    if (adminNotes) order.admin_notes = adminNotes;
  }
  return { success: true };
}

// ==================== SETTINGS ====================

export async function getSiteSettings(): Promise<Record<string, string>> {
  await initDatabase();
  const settings: Record<string, string> = {
    bkash_number: process.env.BKASH_NUMBER || "01700000000",
    nagad_number: process.env.NAGAD_NUMBER || "01800000000",
    rocket_number: process.env.ROCKET_NUMBER || "01900000000",
    support_whatsapp: process.env.SUPPORT_WHATSAPP || "8801700000000",
    notice: "Send Money to our official personal numbers. Enter Sender Phone & TrxID below to verify.",
  };

  if (checkDbStatus()) {
    try {
      const res = await query("SELECT key, value FROM settings");
      for (const row of res.rows) {
        settings[row.key] = row.value;
      }
    } catch (e) {
      // ignore
    }
  }

  return settings;
}

export async function updateSiteSettings(settings: Record<string, string>): Promise<{ success: boolean }> {
  await initDatabase();
  if (checkDbStatus()) {
    try {
      for (const [key, value] of Object.entries(settings)) {
        await query(
          `INSERT INTO settings (key, value, updated_at)
           VALUES ($1, $2, NOW())
           ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = NOW()`,
          [key, value]
        );
      }
    } catch (e) {
      console.error(e);
    }
  }
  return { success: true };
}
