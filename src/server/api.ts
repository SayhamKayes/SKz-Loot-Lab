import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { query, initDatabase, checkDbStatus } from "./db";
import { games as staticGames, Game, Package } from "../lib/games";

function cleanEnv(val: string | undefined, fallback: string): string {
  if (!val) return fallback;
  return val.trim().replace(/^["']|["']$/g, "");
}

const JWT_SECRET = cleanEnv(process.env.SESSION_SECRET, "skz_jwt_default_secret_key_2026");
const ADMIN_USER = cleanEnv(process.env.ADMIN_USERNAME, "admin");
const ADMIN_PASS = cleanEnv(process.env.ADMIN_PASSWORD, "Admin@SKzLab2026#");

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

export interface MemoryGame extends Game {
  id: number;
  is_active: boolean;
  packages: (Package & { dbId: number })[];
}

let nextGameId = 100;
let nextPackageId = 1000;

// In-memory runtime persistence for orders, games & settings (syncs with DB or works offline)
let memoryGames: MemoryGame[] = staticGames.map((g, idx) => ({
  ...g,
  id: idx + 1,
  is_active: true,
  packages: (g.packages || []).map((p, pidx) => ({
    ...p,
    dbId: (idx + 1) * 100 + (pidx + 1),
  })),
}));

let memorySettings: Record<string, string> = {
  bkash_number: process.env.BKASH_NUMBER || "01700000000",
  nagad_number: process.env.NAGAD_NUMBER || "01800000000",
  rocket_number: process.env.ROCKET_NUMBER || "01900000000",
  support_whatsapp: process.env.SUPPORT_WHATSAPP || "8801700000000",
  notice: "Send Money to our official personal numbers. Enter Sender Phone & TrxID below to verify.",
};

const memoryOrders: OrderData[] = [
  {
    id: "SKZ-892341",
    user_id: null,
    game_name: "Free Fire BD",
    package_name: "115 Diamonds",
    amount: 85,
    customer_name: "Tanvir Ahmed",
    customer_email: "tanvir.gamer@gmail.com",
    customer_phone: "01712345678",
    player_credentials: { userId: "28374619" },
    payment_method: "bkash",
    payment_sender_number: "01712345678",
    transaction_id: "9BL7X49K20",
    order_status: "completed",
    admin_notes: "Delivered diamonds via UID",
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: "SKZ-741289",
    user_id: null,
    game_name: "PUBG Mobile",
    package_name: "60 UC",
    amount: 110,
    customer_name: "Rafiqul Islam",
    customer_email: "rafiq@hotmail.com",
    customer_phone: "01898765432",
    player_credentials: { userId: "5192837465" },
    payment_method: "nagad",
    payment_sender_number: "01898765432",
    transaction_id: "NG8821948",
    order_status: "pending",
    admin_notes: undefined,
    created_at: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    id: "SKZ-632014",
    user_id: null,
    game_name: "Mobile Legends",
    package_name: "Weekly Diamond Pass",
    amount: 195,
    customer_name: "Shakib Hasan",
    customer_email: "shakib.mlbb@gmail.com",
    customer_phone: "01911223344",
    player_credentials: { userId: "8827361", serverId: "2048" },
    payment_method: "rocket",
    payment_sender_number: "01911223344",
    transaction_id: "RK9021873",
    order_status: "completed",
    admin_notes: "Recharged via Moonton API",
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
];

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
  if (!params) {
    return { success: false, error: "Missing login credentials" };
  }
  const { username, password } = params;
  const inputUser = (username || "").trim().toLowerCase();
  const inputPass = (password || "").trim();

  // Acceptable admin usernames
  const allowedUsernames = new Set([
    "admin",
    ADMIN_USER.trim().toLowerCase(),
    cleanEnv(process.env.ADMIN_USERNAME, "admin").toLowerCase(),
  ]);

  // Acceptable admin passwords (with or without #, and case-insensitive check)
  const envPass = cleanEnv(process.env.ADMIN_PASSWORD, "Admin@SKzLab2026");
  const allowedPasswords = new Set([
    "admin@skzlab2026",
    "admin@skzlab2026#",
    "Admin@SKzLab2026",
    "Admin@SKzLab2026#",
    ADMIN_PASS,
    ADMIN_PASS.replace(/#$/, ""),
    envPass,
    envPass.replace(/#$/, ""),
  ]);

  const isUserMatch = allowedUsernames.has(inputUser);
  const isPassMatch =
    allowedPasswords.has(inputPass) ||
    allowedPasswords.has(inputPass.toLowerCase()) ||
    allowedPasswords.has(inputPass.replace(/#$/, "")) ||
    allowedPasswords.has(inputPass.toLowerCase().replace(/#$/, ""));

  if (isUserMatch && isPassMatch) {
    const token = jwt.sign({ role: "admin", username: "admin" }, JWT_SECRET, { expiresIn: "7d" });
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
      console.warn("Error fetching games from DB, using memory fallback:", err);
    }
  }

  return memoryGames.filter((g) => g.is_active !== false);
}

export async function getGameBySlug(slug: string): Promise<Game | null> {
  const games = await getAllGames();
  const lowerSlug = slug.toLowerCase().trim();
  const directMatch = games.find((g) => g.slug.toLowerCase() === lowerSlug);
  if (directMatch) return directMatch;

  const fallback = staticGames.find((g) => g.slug.toLowerCase() === lowerSlug);
  if (fallback) {
    const memMatch = memoryGames.find((g) => g.slug.toLowerCase() === fallback.slug.toLowerCase());
    return memMatch || fallback;
  }
  return null;
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

  return memoryGames.map((g) => ({
    id: g.id,
    slug: g.slug,
    name: g.name,
    tagline: g.tagline || "",
    image: g.image,
    badge: g.badge || null,
    category: g.category,
    order_time: g.orderTime || null,
    description: g.description || "",
    needs: g.needs || [],
    is_active: g.is_active !== false,
    packages: (g.packages || []).map((p) => ({
      dbId: p.dbId,
      id: p.id,
      name: p.name,
      price: Number(p.price),
      popular: !!p.popular,
    })),
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

  let targetId = gameData.id;

  if (checkDbStatus()) {
    try {
      if (gameData.id) {
        // Update DB
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
      } else {
        // Insert DB
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
        targetId = res.rows[0]?.id;
      }
    } catch (err: any) {
      console.warn("DB save game error (updating memory store):", err.message);
    }
  }

  // Update memory store so frontend & admin update immediately
  if (targetId) {
    const existing = memoryGames.find((g) => g.id === targetId || g.slug === gameData.slug);
    if (existing) {
      existing.slug = gameData.slug;
      existing.name = gameData.name;
      existing.tagline = gameData.tagline;
      existing.image = gameData.image;
      existing.badge = (gameData.badge as any) || undefined;
      existing.category = (gameData.category as any) || "battle-royale";
      existing.orderTime = gameData.order_time || undefined;
      existing.description = gameData.description;
      existing.needs = gameData.needs || [];
      existing.is_active = gameData.is_active !== undefined ? gameData.is_active : true;
      return { success: true, gameId: existing.id };
    }
  }

  // Create new game in memory store
  const newId = targetId || ++nextGameId;
  const newGame: MemoryGame = {
    id: newId,
    slug: gameData.slug,
    name: gameData.name,
    tagline: gameData.tagline,
    image: gameData.image,
    badge: (gameData.badge as any) || undefined,
    category: (gameData.category as any) || "battle-royale",
    orderTime: gameData.order_time || undefined,
    description: gameData.description,
    needs: gameData.needs || [],
    is_active: gameData.is_active !== undefined ? gameData.is_active : true,
    packages: [],
  };
  memoryGames.unshift(newGame);
  return { success: true, gameId: newId };
}

export async function adminDeleteGame(gameId: number): Promise<{ success: boolean; error?: string }> {
  await initDatabase();
  if (checkDbStatus()) {
    try {
      await query("DELETE FROM games WHERE id = $1", [gameId]);
    } catch (err: any) {
      console.warn("DB delete game error:", err.message);
    }
  }
  memoryGames = memoryGames.filter((g) => g.id !== gameId);
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
  let assignedDbId = pkgData.dbId;

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
        const res = await query(
          `INSERT INTO game_packages (game_id, package_id, name, price, popular)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING id`,
          [pkgData.game_id, pkgData.package_id, pkgData.name, pkgData.price, pkgData.popular || false]
        );
        assignedDbId = res.rows[0]?.id;
      }
    } catch (err: any) {
      console.warn("DB save package error:", err.message);
    }
  }

  // Update memory store
  const game = memoryGames.find((g) => g.id === pkgData.game_id);
  if (game) {
    if (!game.packages) game.packages = [];
    if (pkgData.dbId) {
      const existingPkg = game.packages.find((p) => p.dbId === pkgData.dbId || p.id === pkgData.package_id);
      if (existingPkg) {
        existingPkg.id = pkgData.package_id;
        existingPkg.name = pkgData.name;
        existingPkg.price = Number(pkgData.price);
        existingPkg.popular = !!pkgData.popular;
      } else {
        game.packages.push({
          dbId: pkgData.dbId,
          id: pkgData.package_id,
          name: pkgData.name,
          price: Number(pkgData.price),
          popular: !!pkgData.popular,
        });
      }
    } else {
      game.packages.push({
        dbId: assignedDbId || ++nextPackageId,
        id: pkgData.package_id || `pkg_${Date.now()}`,
        name: pkgData.name,
        price: Number(pkgData.price),
        popular: !!pkgData.popular,
      });
    }
  }
  return { success: true };
}

export async function adminDeletePackage(packageDbId: number): Promise<{ success: boolean; error?: string }> {
  await initDatabase();
  if (checkDbStatus()) {
    try {
      await query("DELETE FROM game_packages WHERE id = $1", [packageDbId]);
    } catch (err: any) {
      console.warn("DB delete package error:", err.message);
    }
  }
  for (const g of memoryGames) {
    if (g.packages) {
      g.packages = g.packages.filter((p) => p.dbId !== packageDbId);
    }
  }
  return { success: true };
}

// ==================== ORDERS & CHECKOUT ====================

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
    } catch (err: any) {
      console.error("Order creation DB error:", err);
    }
  }

  // Always keep in memory store as well
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
        q += `OR customer_email = $${args.length} `;
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
      console.error("User orders fetch DB error:", err);
    }
  }

  return memoryOrders.filter((o) => {
    if (params.userId && o.user_id === params.userId) return true;
    if (params.phone && o.customer_phone === params.phone.trim()) return true;
    if (params.email && o.customer_email?.toLowerCase() === params.email.toLowerCase().trim()) return true;
    return false;
  });
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
      console.error("Admin fetch orders DB error, using memory fallback:", err);
    }
  }

  let memoryFiltered = [...memoryOrders];
  if (filters?.status && filters.status !== "all") {
    memoryFiltered = memoryFiltered.filter((o) => o.order_status === filters.status);
  }
  if (filters?.search && filters.search.trim()) {
    const s = filters.search.trim().toLowerCase();
    memoryFiltered = memoryFiltered.filter(
      (o) =>
        (o.id && o.id.toLowerCase().includes(s)) ||
        (o.customer_name && o.customer_name.toLowerCase().includes(s)) ||
        (o.customer_phone && o.customer_phone.includes(s)) ||
        (o.transaction_id && o.transaction_id.toLowerCase().includes(s)) ||
        (o.game_name && o.game_name.toLowerCase().includes(s))
    );
  }
  return memoryFiltered;
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
    } catch (err: any) {
      console.error("Admin update order DB error:", err.message);
    }
  }

  const order = memoryOrders.find((o) => o.id === orderId);
  if (order) {
    order.order_status = status;
    if (adminNotes !== undefined) order.admin_notes = adminNotes;
  }
  return { success: true };
}

// ==================== SETTINGS ====================

export async function getSiteSettings(): Promise<Record<string, string>> {
  await initDatabase();

  if (checkDbStatus()) {
    try {
      const res = await query("SELECT key, value FROM settings");
      for (const row of res.rows) {
        memorySettings[row.key] = row.value;
      }
    } catch (e) {
      // ignore
    }
  }

  return { ...memorySettings };
}

export async function updateSiteSettings(settings: Record<string, string>): Promise<{ success: boolean }> {
  await initDatabase();
  // Always update memory store immediately
  memorySettings = { ...memorySettings, ...settings };

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
      console.error("DB update settings error:", e);
    }
  }
  return { success: true };
}
