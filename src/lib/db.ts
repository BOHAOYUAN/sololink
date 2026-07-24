import fs from 'fs';
import path from 'path';

export interface Product {
  id: string;
  creatorEmail: string;
  title: string;
  description: string;
  price: number;
  qrCodeUrl: string; // Base64 or Image URL
  deliveryType: 'netdisk' | 'code' | 'file' | 'contact';
  deliveryContent: string; // e.g. Netdisk link & extraction code
  manageToken: string; // Token used by creator to manage/verify orders
  createdAt: string;
}

export interface Order {
  id: string;
  productId: string;
  buyerNote: string; // Transaction reference or buyer remark
  paymentProofUrl?: string; // Image base64 or text
  status: 'pending' | 'verified' | 'rejected';
  createdAt: string;
  verifiedAt?: string;
}

interface DBData {
  products: Product[];
  orders: Order[];
}

const isVercel = process.env.VERCEL || process.env.NODE_ENV === 'production';
const DB_FILE_PATH = isVercel
  ? path.join('/tmp', 'data_db.json')
  : path.join(process.cwd(), 'data_db.json');


function readDB(): DBData {
  try {
    if (!fs.existsSync(DB_FILE_PATH)) {
      const initial: DBData = { products: [], orders: [] };
      fs.writeFileSync(DB_FILE_PATH, JSON.stringify(initial, null, 2), 'utf-8');
      return initial;
    }
    const content = fs.readFileSync(DB_FILE_PATH, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error('Failed to read DB:', error);
    return { products: [], orders: [] };
  }
}

function writeDB(data: DBData): void {
  try {
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error('Failed to write DB:', error);
  }
}

export const db = {
  // Products
  createProduct(data: Omit<Product, 'id' | 'createdAt' | 'manageToken'>): Product {
    const current = readDB();
    const id = 'p_' + Math.random().toString(36).substring(2, 9);
    const manageToken = 'm_' + Math.random().toString(36).substring(2, 12);
    const newProduct: Product = {
      ...data,
      id,
      manageToken,
      createdAt: new Date().toISOString(),
    };
    current.products.push(newProduct);
    writeDB(current);
    return newProduct;
  },

  getProductById(id: string): Product | undefined {
    const current = readDB();
    return current.products.find((p) => p.id === id);
  },

  getProductByManageToken(token: string): Product | undefined {
    const current = readDB();
    return current.products.find((p) => p.manageToken === token);
  },

  // Orders
  createOrder(data: Omit<Order, 'id' | 'createdAt' | 'status'>): Order {
    const current = readDB();
    const id = 'ord_' + Math.random().toString(36).substring(2, 10);
    const newOrder: Order = {
      ...data,
      id,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    current.orders.push(newOrder);
    writeDB(current);
    return newOrder;
  },

  getOrderById(id: string): Order | undefined {
    const current = readDB();
    return current.orders.find((o) => o.id === id);
  },

  getOrdersByProductId(productId: string): Order[] {
    const current = readDB();
    return current.orders
      .filter((o) => o.productId === productId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  verifyOrder(orderId: string, status: 'verified' | 'rejected'): Order | undefined {
    const current = readDB();
    const orderIndex = current.orders.findIndex((o) => o.id === orderId);
    if (orderIndex === -1) return undefined;

    current.orders[orderIndex].status = status;
    current.orders[orderIndex].verifiedAt = new Date().toISOString();
    writeDB(current);
    return current.orders[orderIndex];
  },
};
