import pg from 'pg';
import { db } from './db.js';

const { Pool } = pg;

export async function initSupabaseDb() {
  const connectionString = process.env.POSTGRES_URL || process.env.STORAGE_POSTGRES_URL;
  if (!connectionString) {
    console.log('No POSTGRES_URL found. Using in-memory mock database.');
    return;
  }

  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    const client = await pool.connect();
    
    // Create tables
    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL NOT NULL,
        stock INTEGER NOT NULL,
        category VARCHAR(100),
        "imageUrl" TEXT,
        "salesCount" INTEGER DEFAULT 0,
        rating DECIMAL DEFAULT 0
      );
    `);

    // Check if products table is empty
    const res = await client.query('SELECT COUNT(*) FROM products');
    if (parseInt(res.rows[0].count) === 0) {
      console.log('Seeding products...');
      const products = await db.getProducts();
      for (const p of products) {
        await client.query(`
          INSERT INTO products (id, name, description, price, stock, category, "imageUrl", "salesCount", rating)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        `, [p.id, p.name, p.description, p.price, p.stock, p.category, p.imageUrl, p.salesCount, p.rating]);
      }
    }
    
    // Create orders table
    await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id VARCHAR(50) PRIMARY KEY,
        "customerId" VARCHAR(50),
        "customerName" VARCHAR(255),
        "customerEmail" VARCHAR(255),
        items JSONB,
        total DECIMAL NOT NULL,
        "paymentGateway" VARCHAR(50),
        "paymentStatus" VARCHAR(50),
        "shippingStatus" VARCHAR(50),
        "shippingAddress" TEXT,
        "shippingPhone" VARCHAR(50),
        "createdAt" TIMESTAMP,
        "trackingNumber" VARCHAR(100),
        notifications JSONB
      );
    `);

    const resOrders = await client.query('SELECT COUNT(*) FROM orders');
    if (parseInt(resOrders.rows[0].count) === 0) {
      console.log('Seeding orders...');
      const orders = await db.getOrders();
      for (const o of orders) {
        await client.query(`
          INSERT INTO orders (id, "customerId", "customerName", "customerEmail", items, total, "paymentGateway", "paymentStatus", "shippingStatus", "shippingAddress", "shippingPhone", "createdAt", "trackingNumber", notifications)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        `, [o.id, o.customerId, o.customerName, o.customerEmail, JSON.stringify(o.items), o.total, o.paymentGateway, o.paymentStatus, o.shippingStatus, o.shippingAddress, o.shippingPhone, o.createdAt, o.trackingNumber, JSON.stringify(o.notifications)]);
      }
    }

    // Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(50) PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(50),
        address TEXT,
        role VARCHAR(50) DEFAULT 'customer',
        permissions JSONB
      );
    `);

    const resUsers = await client.query('SELECT COUNT(*) FROM users');
    if (parseInt(resUsers.rows[0].count) === 0) {
      console.log('Seeding users...');
      const users = await db.getUsers();
      for (const u of users) {
        await client.query(`
          INSERT INTO users (id, email, name, phone, address, role, permissions)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
        `, [u.id, u.email, u.name, u.phone, u.address, u.role, JSON.stringify(u.permissions)]);
      }
    }

    // Create campaigns table
    await client.query(`
      CREATE TABLE IF NOT EXISTS campaigns (
        id VARCHAR(50) PRIMARY KEY,
        platform VARCHAR(100) NOT NULL,
        name VARCHAR(255) NOT NULL,
        budget DECIMAL NOT NULL,
        status VARCHAR(50) DEFAULT 'active',
        spent DECIMAL DEFAULT 0,
        clicks INTEGER DEFAULT 0,
        conversions INTEGER DEFAULT 0,
        "createdAt" TIMESTAMP
      );
    `);

    const resCampaigns = await client.query('SELECT COUNT(*) FROM campaigns');
    if (parseInt(resCampaigns.rows[0].count) === 0) {
      console.log('Seeding campaigns...');
      const campaigns = await db.getCampaigns();
      for (const c of campaigns) {
        await client.query(`
          INSERT INTO campaigns (id, platform, name, budget, status, spent, clicks, conversions, "createdAt")
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        `, [c.id, c.platform, c.name, c.budget, c.status, c.spent, c.clicks, c.conversions, c.createdAt]);
      }
    }

    client.release();
    console.log('Supabase Postgres database initialized and verified!');
  } catch (error) {
    console.error('Error initializing Supabase Postgres database:', error);
  }
}
