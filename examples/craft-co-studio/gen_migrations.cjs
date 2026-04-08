// Generate SQL to bring a remote D1 up to date from data.db schema
const Database = require('better-sqlite3');
const fs = require('fs');
const dbPath = process.argv[2];
const outPath = process.argv[3];
const db = new Database(dbPath, { readonly: true });

let sql = '';

// Get all CREATE TABLE statements
const tables = db.prepare("SELECT name, sql FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name != '_cf_KV' AND sql IS NOT NULL ORDER BY name").all();

for (const table of tables) {
  // Use CREATE TABLE IF NOT EXISTS
  const createSql = table.sql.replace(/^CREATE TABLE /, 'CREATE TABLE IF NOT EXISTS ');
  sql += createSql + ';\n';
}

// Get all CREATE INDEX statements
const indexes = db.prepare("SELECT sql FROM sqlite_master WHERE type='index' AND sql IS NOT NULL").all();
for (const idx of indexes) {
  let idxSql = idx.sql;
  idxSql = idxSql.replace(/^CREATE INDEX /, 'CREATE INDEX IF NOT EXISTS ');
  idxSql = idxSql.replace(/^CREATE UNIQUE INDEX /, 'CREATE UNIQUE INDEX IF NOT EXISTS ');
  sql += idxSql + ';\n';
}

// Now handle migrations table - insert missing migration records
const migrations = db.prepare('SELECT * FROM "_emdash_migrations"').all();
for (const m of migrations) {
  sql += "INSERT OR IGNORE INTO \"_emdash_migrations\" (\"name\",\"timestamp\") VALUES ('" + m.name + "','" + m.timestamp + "');\n";
}

// Insert migrations_lock if not present
sql += "INSERT OR IGNORE INTO \"_emdash_migrations_lock\" (\"id\",\"is_locked\") VALUES ('migration_lock',0);\n";

fs.writeFileSync(outPath, sql);
console.log('Generated migration SQL: ' + outPath);
db.close();
