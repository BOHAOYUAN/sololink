import { createClient } from '@libsql/client';
import fs from 'fs';
import path from 'path';

export interface Product {
  id: string;
  creatorEmail: string;
  title: string;
  description: string;
  price: number;
  qrCodeUrl: string;
  deliveryType: 'netdisk' | 'code' | 'file' | 'contact';
  deliveryContent: string;
  manageToken: string;
  createdAt: string;
}

export interface Order {
  id: string;
  productId: string;
  buyerNote: string;
  paymentProofUrl?: string;
  status: 'pending' | 'verified' | 'rejected';
  createdAt: string;
  verifiedAt?: string;
}

// Turso Cloud Config
const TURSO_URL = process.env.TURSO_DATABASE_URL || 'libsql://sololink-bohaoyuan.aws-ap-northeast-1.turso.io';
const TURSO_TOKEN = process.env.TURSO_AUTH_TOKEN || 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODQ5MTk5NzcsImlkIjoiMDE5Zjk1ODAtZmYwMS03ZDAzLWE5NDgtY2YzMDcwOGQ0NjI5Iiwia2lkIjoiazZBck0xQVFmWkZoT0Q3TlhxejFZaGJyUERrSzhIcVVQZEVVWDN5a3ZfRSIsInJpZCI6IjU4ODc1YWFmLWRhNDEtNDYwMS05ODM5LTJiMDkxMGRhN2MyNyJ9.OM-DSPFPsb7YxHMXArniEHKL-uFXaTLzRSOY_dTNpoQEbAlEhpBRAwYnsaZ682Yuqw9DxbCWdMoH8KBKdvycDA';

const tursoClient = createClient({
  url: TURSO_URL,
  authToken: TURSO_TOKEN,
});

let tablesInitialized = false;

async function initTables() {
  if (tablesInitialized) return;
  try {
    await tursoClient.execute(`
      CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        creatorEmail TEXT,
        title TEXT,
        description TEXT,
        price REAL,
        qrCodeUrl TEXT,
        deliveryType TEXT,
        deliveryContent TEXT,
        manageToken TEXT,
        createdAt TEXT
      )
    `);
    await tursoClient.execute(`
      CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY,
        productId TEXT,
        buyerNote TEXT,
        paymentProofUrl TEXT,
        status TEXT,
        createdAt TEXT,
        verifiedAt TEXT
      )
    `);
    tablesInitialized = true;
  } catch (err) {
    console.error('Failed to init Turso tables:', err);
  }
}

export const db = {
  // Products
  async createProduct(data: Omit<Product, 'id' | 'createdAt' | 'manageToken'>): Promise<Product> {
    await initTables();
    const id = 'p_' + Math.random().toString(36).substring(2, 9);
    const manageToken = 'm_' + Math.random().toString(36).substring(2, 12);
    const createdAt = new Date().toISOString();

    const newProduct: Product = {
      ...data,
      id,
      manageToken,
      createdAt,
    };

    await tursoClient.execute({
      sql: `INSERT INTO products (id, creatorEmail, title, description, price, qrCodeUrl, deliveryType, deliveryContent, manageToken, createdAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        id,
        data.creatorEmail,
        data.title,
        data.description || '',
        data.price,
        data.qrCodeUrl,
        data.deliveryType,
        data.deliveryContent,
        manageToken,
        createdAt,
      ],
    });

    return newProduct;
  },

  async getProductById(id: string): Promise<Product | undefined> {
    await initTables();
    const res = await tursoClient.execute({
      sql: `SELECT * FROM products WHERE id = ?`,
      args: [id],
    });
    if (res.rows.length === 0) return undefined;
    const r = res.rows[0];
    return {
      id: String(r.id),
      creatorEmail: String(r.creatorEmail),
      title: String(r.title),
      description: String(r.description),
      price: Number(r.price),
      qrCodeUrl: String(r.qrCodeUrl),
      deliveryType: r.deliveryType as any,
      deliveryContent: String(r.deliveryContent),
      manageToken: String(r.manageToken),
      createdAt: String(r.createdAt),
    };
  },

  async getProductByManageToken(token: string): Promise<Product | undefined> {
    await initTables();
    const res = await tursoClient.execute({
      sql: `SELECT * FROM products WHERE manageToken = ?`,
      args: [token],
    });
    if (res.rows.length === 0) return undefined;
    const r = res.rows[0];
    return {
      id: String(r.id),
      creatorEmail: String(r.creatorEmail),
      title: String(r.title),
      description: String(r.description),
      price: Number(r.price),
      qrCodeUrl: String(r.qrCodeUrl),
      deliveryType: r.deliveryType as any,
      deliveryContent: String(r.deliveryContent),
      manageToken: String(r.manageToken),
      createdAt: String(r.createdAt),
    };
  },

  // Orders
  async createOrder(data: Omit<Order, 'id' | 'createdAt' | 'status'>): Promise<Order> {
    await initTables();
    const id = 'ord_' + Math.random().toString(36).substring(2, 10);
    const createdAt = new Date().toISOString();

    const newOrder: Order = {
      ...data,
      id,
      status: 'pending',
      createdAt,
    };

    await tursoClient.execute({
      sql: `INSERT INTO orders (id, productId, buyerNote, paymentProofUrl, status, createdAt)
            VALUES (?, ?, ?, ?, ?, ?)`,
      args: [id, data.productId, data.buyerNote, data.paymentProofUrl || '', 'pending', createdAt],
    });

    return newOrder;
  },

  async getOrderById(id: string): Promise<Order | undefined> {
    await initTables();
    const res = await tursoClient.execute({
      sql: `SELECT * FROM orders WHERE id = ?`,
      args: [id],
    });
    if (res.rows.length === 0) return undefined;
    const r = res.rows[0];
    return {
      id: String(r.id),
      productId: String(r.productId),
      buyerNote: String(r.buyerNote),
      paymentProofUrl: r.paymentProofUrl ? String(r.paymentProofUrl) : undefined,
      status: r.status as any,
      createdAt: String(r.createdAt),
      verifiedAt: r.verifiedAt ? String(r.verifiedAt) : undefined,
    };
  },

  async getOrdersByProductId(productId: string): Promise<Order[]> {
    await initTables();
    const res = await tursoClient.execute({
      sql: `SELECT * FROM orders WHERE productId = ? ORDER BY createdAt DESC`,
      args: [productId],
    });
    return res.rows.map((r) => ({
      id: String(r.id),
      productId: String(r.productId),
      buyerNote: String(r.buyerNote),
      paymentProofUrl: r.paymentProofUrl ? String(r.paymentProofUrl) : undefined,
      status: r.status as any,
      createdAt: String(r.createdAt),
      verifiedAt: r.verifiedAt ? String(r.verifiedAt) : undefined,
    }));
  },

  async verifyOrder(orderId: string, status: 'verified' | 'rejected'): Promise<Order | undefined> {
    await initTables();
    const verifiedAt = new Date().toISOString();
    await tursoClient.execute({
      sql: `UPDATE orders SET status = ?, verifiedAt = ? WHERE id = ?`,
      args: [status, verifiedAt, orderId],
    });
    return this.getOrderById(orderId);
  },
};
