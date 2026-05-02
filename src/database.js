const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'data', 'nutribot.db');

let db;

async function initDB() {
  const SQL = await initSqlJs();

  if (fs.existsSync(DB_PATH)) {
    const buffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(buffer);
  } else {
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
    db = new SQL.Database();
  }

  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      telegram_id INTEGER PRIMARY KEY,
      name TEXT,
      gender TEXT,
      age INTEGER,
      weight REAL,
      height REAL,
      goal TEXT,
      calorie_norm REAL,
      protein_norm REAL,
      fat_norm REAL,
      carb_norm REAL,
      language TEXT DEFAULT 'ru',
      is_premium INTEGER DEFAULT 0,
      daily_uses INTEGER DEFAULT 0,
      last_use_date TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS food_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      telegram_id INTEGER,
      food_name TEXT,
      weight_g REAL,
      calories REAL,
      protein REAL,
      fat REAL,
      carbs REAL,
      logged_at TEXT DEFAULT (datetime('now'))
    )
  `);

  saveDB();
  console.log('Database initialized');
}

function saveDB() {
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(DB_PATH, buffer);
}

// Exported as objects with .run()/.get()/.all() to match index.js usage

const getUser = {
  get(telegramId) {
    const stmt = db.prepare('SELECT * FROM users WHERE telegram_id = ?');
    stmt.bind([telegramId]);
    if (stmt.step()) {
      const row = stmt.getAsObject();
      stmt.free();
      return row;
    }
    stmt.free();
    return null;
  }
};

const createUser = {
  run(telegramId, name) {
    db.run(
      `INSERT INTO users (telegram_id, name) VALUES (?, ?)
       ON CONFLICT(telegram_id) DO UPDATE SET name = excluded.name`,
      [telegramId, name]
    );
    saveDB();
  }
};

// index.js calls: updateUserProfile.run(gender, age, weight, height, goal, calories, protein, fat, carbs, chatId)
const updateUserProfile = {
  run(gender, age, weight, height, goal, calorieNorm, proteinNorm, fatNorm, carbNorm, telegramId) {
    db.run(
      `UPDATE users SET gender=?, age=?, weight=?, height=?, goal=?,
       calorie_norm=?, protein_norm=?, fat_norm=?, carb_norm=?
       WHERE telegram_id=?`,
      [gender, age, weight, height, goal, calorieNorm, proteinNorm, fatNorm, carbNorm, telegramId]
    );
    saveDB();
  }
};

const addFoodLog = {
  run(telegramId, foodName, weightG, calories, protein, fat, carbs) {
    db.run(
      `INSERT INTO food_log (telegram_id, food_name, weight_g, calories, protein, fat, carbs)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [telegramId, foodName, weightG, calories, protein, fat, carbs]
    );
    saveDB();
  }
};

const getTodayLog = {
  all(telegramId) {
    const stmt = db.prepare(
      `SELECT * FROM food_log WHERE telegram_id = ? AND date(logged_at) = date('now') ORDER BY logged_at ASC`
    );
    stmt.bind([telegramId]);
    const rows = [];
    while (stmt.step()) {
      rows.push(stmt.getAsObject());
    }
    stmt.free();
    return rows;
  }
};

const getTodayTotals = {
  get(telegramId) {
    const stmt = db.prepare(
      `SELECT COUNT(*) as meals,
       COALESCE(SUM(calories), 0) as total_calories,
       COALESCE(SUM(protein), 0) as total_protein,
       COALESCE(SUM(fat), 0) as total_fat,
       COALESCE(SUM(carbs), 0) as total_carbs
       FROM food_log WHERE telegram_id = ? AND date(logged_at) = date('now')`
    );
    stmt.bind([telegramId]);
    stmt.step();
    const row = stmt.getAsObject();
    stmt.free();
    return row;
  }
};

function checkAndUpdateUsage(telegramId) {
  const today = new Date().toISOString().split('T')[0];
  const user = getUser.get(telegramId);
  if (!user) return { allowed: false, remaining: 0 };

  if (user.last_use_date !== today) {
    db.run('UPDATE users SET daily_uses = 0, last_use_date = ? WHERE telegram_id = ?', [today, telegramId]);
    saveDB();
    return { allowed: true, remaining: 3 };
  }

  if (user.is_premium) return { allowed: true, remaining: 999 };

  const FREE_LIMIT = 3;
  if (user.daily_uses >= FREE_LIMIT) return { allowed: false, remaining: 0 };

  return { allowed: true, remaining: FREE_LIMIT - user.daily_uses };
}

function incrementUsage(telegramId) {
  const today = new Date().toISOString().split('T')[0];
  const user = getUser.get(telegramId);
  db.run('UPDATE users SET daily_uses = ?, last_use_date = ? WHERE telegram_id = ?',
    [(user?.daily_uses || 0) + 1, today, telegramId]);
  saveDB();
}

module.exports = {
  initDB,
  getUser,
  createUser,
  updateUserProfile,
  addFoodLog,
  getTodayLog,
  getTodayTotals,
  checkAndUpdateUsage,
  incrementUsage
};
