const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../../data', 'knowledge_base.db');
const fs = require('fs');

const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('数据库连接失败:', err.message);
  } else {
    console.log('数据库连接成功');
    initDatabase();
  }
});

function initDatabase() {
  db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS channels (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      code TEXT,
      description TEXT,
      status INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS price_sheets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      channel_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      destination_country TEXT,
      weight_unit TEXT DEFAULT 'kg',
      volume_unit TEXT DEFAULT 'cm',
      volume_weight_factor REAL DEFAULT 5000,
      status INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (channel_id) REFERENCES channels(id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS price_tiers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      price_sheet_id INTEGER NOT NULL,
      min_weight REAL NOT NULL,
      max_weight REAL,
      base_price REAL NOT NULL,
      price_per_kg REAL,
      fuel_surcharge REAL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (price_sheet_id) REFERENCES price_sheets(id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS additional_fees (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      price_sheet_id INTEGER,
      channel_id INTEGER,
      name TEXT NOT NULL,
      fee_type TEXT NOT NULL,
      amount REAL,
      percentage REAL,
      condition TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (price_sheet_id) REFERENCES price_sheets(id),
      FOREIGN KEY (channel_id) REFERENCES channels(id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      company TEXT,
      customer_type TEXT,
      contact_person TEXT,
      contact_phone TEXT,
      contact_email TEXT,
      status INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS customer_channel_mapping (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_id INTEGER NOT NULL,
      channel_id INTEGER NOT NULL,
      priority INTEGER DEFAULT 0,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (customer_id) REFERENCES customers(id),
      FOREIGN KEY (channel_id) REFERENCES channels(id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS operation_guides (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      channel_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      step_order INTEGER NOT NULL,
      content TEXT NOT NULL,
      contact_person TEXT,
      contact_info TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (channel_id) REFERENCES channels(id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS faq (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      question TEXT NOT NULL,
      answer TEXT NOT NULL,
      category TEXT,
      keywords TEXT,
      status INTEGER DEFAULT 1,
      is_archived INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    console.log('数据库表初始化完成');
  });
}

module.exports = db;