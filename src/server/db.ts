import pg from "pg";
import { games as initialGames } from "../lib/games";

const { Pool } = pg;

const NEON_DEFAULT_URL = "postgresql://neondb_owner:npg_SRgK3HV8UfrM@ep-misty-sun-b3b8of53-pooler.c-4.ap-southeast-1.aws.neon.tech/neondb?sslmode=require";

const rawConnectionString =
  process.env.DATABASE_URL ||
  process.env["DATABASE URL"] ||
  process.env.POSTGRES_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  NEON_DEFAULT_URL;
let connectionString = rawConnectionString.trim().replace(/^["']|["']$/g, "");
// Strip channel_binding if present since node-postgres doesn't support SCRAM channel binding
connectionString = connectionString.replace(/([?&])channel_binding=[^&]*(&|$)/, "$1").replace(/[?&]$/, "");
const isCloudPostgres = connectionString.includes("sslmode=require") || connectionString.includes("neon.tech") || connectionString.includes("supabase.co");

let pool: pg.Pool | null = null;
let isDbConnected = false;
let initPromise: Promise<void> | null = null;

export function getPool(): pg.Pool {
  if (!pool) {
    pool = new Pool({
      connectionString,
      ssl: isCloudPostgres ? { rejectUnauthorized: false } : false,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });

    pool.on("error", (err) => {
      console.error("[PostgreSQL Pool Error]:", err.message);
    });
  }
  return pool;
}

export async function query<T extends pg.QueryResultRow = any>(text: string, params?: any[]): Promise<pg.QueryResult<T>> {
  const p = getPool();
  return p.query<T>(text, params);
}

export async function initDatabase(): Promise<boolean> {
  if (initPromise && isDbConnected) {
    return isDbConnected;
  }

  initPromise = (async () => {
    try {
      const p = getPool();
      // Test connection
      const client = await p.connect();
      client.release();
      isDbConnected = true;
      console.log("✅ [PostgreSQL] Connected successfully to:", connectionString.replace(/:[^:@]+@/, ":****@"));

      // Run Schema migration
      await createTables();
      await seedDefaultGames();
      await seedDefaultSettings();
    } catch (error: any) {
      isDbConnected = false;
      console.warn("⚠️ [PostgreSQL Connection Warning]:", error.message);
      console.warn("💡 Tip: Verify your DATABASE_URL in .env if you are using local PostgreSQL or Neon.tech.");
    }
  })();

  await initPromise;
  return isDbConnected;
}

async function createTables() {
  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      phone VARCHAR(50) UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role VARCHAR(50) DEFAULT 'user',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS games (
      id SERIAL PRIMARY KEY,
      slug VARCHAR(100) UNIQUE NOT NULL,
      name VARCHAR(255) NOT NULL,
      tagline VARCHAR(255),
      image TEXT NOT NULL,
      badge VARCHAR(50),
      category VARCHAR(100) NOT NULL,
      order_time VARCHAR(255),
      description TEXT,
      needs JSONB NOT NULL DEFAULT '[]',
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS game_packages (
      id SERIAL PRIMARY KEY,
      game_id INTEGER REFERENCES games(id) ON DELETE CASCADE,
      package_id VARCHAR(100) NOT NULL,
      name VARCHAR(255) NOT NULL,
      price NUMERIC(10, 2) NOT NULL,
      popular BOOLEAN DEFAULT FALSE,
      sort_order INTEGER DEFAULT 0,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS orders (
      id VARCHAR(50) PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      game_id INTEGER REFERENCES games(id) ON DELETE SET NULL,
      game_name VARCHAR(255) NOT NULL,
      package_name VARCHAR(255) NOT NULL,
      amount NUMERIC(10, 2) NOT NULL,
      customer_name VARCHAR(255) NOT NULL,
      customer_email VARCHAR(255) NOT NULL,
      customer_phone VARCHAR(50) NOT NULL,
      player_credentials JSONB NOT NULL DEFAULT '{}',
      payment_method VARCHAR(50) NOT NULL,
      payment_sender_number VARCHAR(50) NOT NULL,
      transaction_id VARCHAR(100) NOT NULL,
      order_status VARCHAR(50) DEFAULT 'pending',
      admin_notes TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS settings (
      key VARCHAR(100) PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `);
}

async function seedDefaultGames() {
  const { rows } = await query("SELECT COUNT(*) as count FROM games");
  if (parseInt(rows[0].count, 10) === 0) {
    console.log("🌱 [PostgreSQL] Seeding 12 initial games & coin packages...");
    for (const game of initialGames) {
      const res = await query(
        `INSERT INTO games (slug, name, tagline, image, badge, category, order_time, description, needs, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, true)
         RETURNING id`,
        [
          game.slug,
          game.name,
          game.tagline,
          game.image,
          game.badge || null,
          game.category,
          game.orderTime || null,
          game.description,
          JSON.stringify(game.needs || []),
        ]
      );
      const gameId = res.rows[0].id;

      for (let i = 0; i < game.packages.length; i++) {
        const pkg = game.packages[i];
        await query(
          `INSERT INTO game_packages (game_id, package_id, name, price, popular, sort_order)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [gameId, pkg.id, pkg.name, pkg.price, pkg.popular || false, i]
        );
      }
    }
    console.log("✅ [PostgreSQL] Initial games & coin packages seeded successfully.");
  }
}

async function seedDefaultSettings() {
  const defaults = [
    { key: "bkash_number", value: process.env.BKASH_NUMBER || "01700000000" },
    { key: "nagad_number", value: process.env.NAGAD_NUMBER || "01800000000" },
    { key: "rocket_number", value: process.env.ROCKET_NUMBER || "01900000000" },
    { key: "support_whatsapp", value: process.env.SUPPORT_WHATSAPP || "8801700000000" },
    { key: "notice", value: "Send Money to our official personal/merchant numbers. Put the last 4 digits of sender number and exact TrxID below." },
  ];

  for (const item of defaults) {
    await query(
      `INSERT INTO settings (key, value, updated_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (key) DO NOTHING`,
      [item.key, item.value]
    );
  }
}

export function checkDbStatus() {
  return isDbConnected;
}
