import { getDatabase } from '../config/database.js';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

export async function createTables() {
  const db = await getDatabase();

  const tables = [
    // Users Table
    `CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      fullName TEXT NOT NULL,
      role TEXT CHECK(role IN ('admin', 'manager', 'technician', 'billing_staff')) DEFAULT 'billing_staff',
      phone TEXT,
      status TEXT CHECK(status IN ('active', 'inactive')) DEFAULT 'active',
      lastLogin DATETIME,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,

    // Customers Table
    `CREATE TABLE IF NOT EXISTS customers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      phone TEXT UNIQUE NOT NULL,
      email TEXT,
      alternatePhone TEXT,
      address TEXT,
      city TEXT,
      state TEXT,
      pincode TEXT,
      gstin TEXT,
      outstandingBalance REAL DEFAULT 0,
      status TEXT CHECK(status IN ('active', 'inactive')) DEFAULT 'active',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,

    // Categories Table
    `CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      description TEXT,
      status TEXT CHECK(status IN ('active', 'inactive')) DEFAULT 'active',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,

    // Products Table
    `CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      categoryId TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      sku TEXT UNIQUE,
      barcode TEXT,
      purchasePrice REAL NOT NULL,
      sellingPrice REAL NOT NULL,
      quantity INTEGER DEFAULT 0,
      reorderLevel INTEGER DEFAULT 10,
      unit TEXT DEFAULT 'pcs',
      hsn TEXT,
      gstApplicable INTEGER DEFAULT 1,
      status TEXT CHECK(status IN ('active', 'inactive')) DEFAULT 'active',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (categoryId) REFERENCES categories(id)
    )`,

    // Suppliers Table
    `CREATE TABLE IF NOT EXISTS suppliers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      contactPerson TEXT,
      phone TEXT,
      email TEXT,
      address TEXT,
      city TEXT,
      state TEXT,
      pincode TEXT,
      gstin TEXT,
      bankAccount TEXT,
      ifsc TEXT,
      status TEXT CHECK(status IN ('active', 'inactive')) DEFAULT 'active',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,

    // Inventory Table
    `CREATE TABLE IF NOT EXISTS inventory (
      id TEXT PRIMARY KEY,
      productId TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      type TEXT CHECK(type IN ('in', 'out')) NOT NULL,
      reference TEXT,
      notes TEXT,
      createdBy TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (productId) REFERENCES products(id),
      FOREIGN KEY (createdBy) REFERENCES users(id)
    )`,

    // Bills Table
    `CREATE TABLE IF NOT EXISTS bills (
      id TEXT PRIMARY KEY,
      invoiceNumber TEXT UNIQUE NOT NULL,
      customerId TEXT NOT NULL,
      billDate DATETIME DEFAULT CURRENT_TIMESTAMP,
      dueDate DATETIME,
      subtotal REAL NOT NULL DEFAULT 0,
      discountAmount REAL DEFAULT 0,
      discountPercentage REAL DEFAULT 0,
      taxAmount REAL DEFAULT 0,
      totalAmount REAL NOT NULL DEFAULT 0,
      paidAmount REAL DEFAULT 0,
      paymentMethod TEXT CHECK(paymentMethod IN ('cash', 'cheque', 'card', 'online', 'upi')) DEFAULT 'cash',
      paymentStatus TEXT CHECK(paymentStatus IN ('paid', 'pending', 'partial')) DEFAULT 'pending',
      notes TEXT,
      createdBy TEXT NOT NULL,
      status TEXT CHECK(status IN ('draft', 'confirmed', 'printed', 'cancelled')) DEFAULT 'draft',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (customerId) REFERENCES customers(id),
      FOREIGN KEY (createdBy) REFERENCES users(id)
    )`,

    // Bill Items Table
    `CREATE TABLE IF NOT EXISTS billItems (
      id TEXT PRIMARY KEY,
      billId TEXT NOT NULL,
      productId TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      unitPrice REAL NOT NULL,
      discount REAL DEFAULT 0,
      tax REAL DEFAULT 0,
      total REAL NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (billId) REFERENCES bills(id) ON DELETE CASCADE,
      FOREIGN KEY (productId) REFERENCES products(id)
    )`,

    // Services Table
    `CREATE TABLE IF NOT EXISTS services (
      id TEXT PRIMARY KEY,
      serviceId TEXT UNIQUE NOT NULL,
      customerId TEXT NOT NULL,
      deviceType TEXT CHECK(deviceType IN ('laptop', 'desktop', 'printer', 'monitor', 'ups', 'router', 'switch', 'networking_device')) NOT NULL,
      serialNumber TEXT,
      deviceModel TEXT,
      problemDescription TEXT NOT NULL,
      estimatedCost REAL,
      finalCost REAL,
      technicianId TEXT,
      status TEXT CHECK(status IN ('received', 'diagnosing', 'waiting_parts', 'in_progress', 'completed', 'delivered')) DEFAULT 'received',
      createdBy TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (customerId) REFERENCES customers(id),
      FOREIGN KEY (technicianId) REFERENCES users(id),
      FOREIGN KEY (createdBy) REFERENCES users(id)
    )`,

    // Service Timeline Table
    `CREATE TABLE IF NOT EXISTS serviceTimeline (
      id TEXT PRIMARY KEY,
      serviceId TEXT NOT NULL,
      status TEXT NOT NULL,
      description TEXT,
      notes TEXT,
      technicianId TEXT,
      createdBy TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (serviceId) REFERENCES services(id) ON DELETE CASCADE,
      FOREIGN KEY (technicianId) REFERENCES users(id),
      FOREIGN KEY (createdBy) REFERENCES users(id)
    )`,

    // Technicians Table
    `CREATE TABLE IF NOT EXISTS technicians (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL UNIQUE,
      specialization TEXT,
      experience INTEGER,
      phone TEXT,
      status TEXT CHECK(status IN ('available', 'busy', 'on_leave')) DEFAULT 'available',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id)
    )`,

    // Expenses Table
    `CREATE TABLE IF NOT EXISTS expenses (
      id TEXT PRIMARY KEY,
      category TEXT CHECK(category IN ('rent', 'electricity', 'salary', 'internet', 'supplies', 'maintenance', 'other')) NOT NULL,
      description TEXT NOT NULL,
      amount REAL NOT NULL,
      paymentMethod TEXT CHECK(paymentMethod IN ('cash', 'cheque', 'card', 'online')) DEFAULT 'cash',
      reference TEXT,
      createdBy TEXT NOT NULL,
      expenseDate DATETIME DEFAULT CURRENT_TIMESTAMP,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (createdBy) REFERENCES users(id)
    )`,

    // Settings Table
    `CREATE TABLE IF NOT EXISTS settings (
      id TEXT PRIMARY KEY,
      key TEXT UNIQUE NOT NULL,
      value TEXT,
      type TEXT CHECK(type IN ('string', 'number', 'boolean', 'json')) DEFAULT 'string',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,

    // Backups Table
    `CREATE TABLE IF NOT EXISTS backups (
      id TEXT PRIMARY KEY,
      filename TEXT NOT NULL,
      backupDate DATETIME DEFAULT CURRENT_TIMESTAMP,
      size INTEGER,
      status TEXT CHECK(status IN ('success', 'failed')) DEFAULT 'success',
      createdBy TEXT,
      notes TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (createdBy) REFERENCES users(id)
    )`
  ];

  for (const sql of tables) {
    try {
      await db.exec(sql);
    } catch (error) {
      console.error('Error creating table:', error);
    }
  }

  console.log('✅ All tables created successfully');
}

export async function seedDefaultData() {
  const db = await getDatabase();

  try {
    // Check if admin user exists
    const admin = await db.get('SELECT id FROM users WHERE username = ?', ['admin']);
    
    if (!admin) {
      const adminId = uuidv4();
      const hashedPassword = await bcrypt.hash('admin123', 10);

      await db.run(
        `INSERT INTO users (id, username, email, password, fullName, role, status) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [adminId, 'admin', 'admin@servicecenter.local', hashedPassword, 'Administrator', 'admin', 'active']
      );

      console.log('✅ Default admin user created');
      console.log('   Username: admin');
      console.log('   Password: admin123');
    }

    // Seed default categories
    const categories = await db.all('SELECT id FROM categories');
    if (categories.length === 0) {
      const defaultCategories = [
        'Hardware',
        'Software',
        'Services',
        'Accessories',
        'Networking'
      ];

      for (const category of defaultCategories) {
        await db.run(
          `INSERT INTO categories (id, name, description, status) 
           VALUES (?, ?, ?, ?)`,
          [uuidv4(), category, `${category} products`, 'active']
        );
      }

      console.log('✅ Default categories created');
    }

    // Seed default settings
    const settings = await db.all('SELECT id FROM settings');
    if (settings.length === 0) {
      const defaultSettings = [
        { key: 'gst_rate', value: '18', type: 'number' },
        { key: 'currency', value: 'INR', type: 'string' },
        { key: 'timezone', value: 'Asia/Kolkata', type: 'string' },
        { key: 'app_name', value: 'Service Center Management', type: 'string' },
        { key: 'auto_backup_enabled', value: 'true', type: 'boolean' },
        { key: 'backup_time', value: '02:00', type: 'string' }
      ];

      for (const setting of defaultSettings) {
        await db.run(
          `INSERT INTO settings (id, key, value, type) 
           VALUES (?, ?, ?, ?)`,
          [uuidv4(), setting.key, setting.value, setting.type]
        );
      }

      console.log('✅ Default settings created');
    }

  } catch (error) {
    console.error('Error seeding data:', error);
  }
}

export default {
  createTables,
  seedDefaultData
};
