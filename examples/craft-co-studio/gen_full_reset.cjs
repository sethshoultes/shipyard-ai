// Generate SQL to fully reset remote D1 from local data.db
// Drops all tables (except _cf_KV), recreates them with data
const Database = require('better-sqlite3');
const fs = require('fs');
const dbPath = process.argv[2];
const outPath = process.argv[3];
const db = new Database(dbPath, { readonly: true });

const skipTables = new Set(['_cf_KV']);

// Skip FTS virtual tables and their shadow tables (D1 reserves these names)
function shouldSkip(name) {
  if (skipTables.has(name)) return true;
  if (name.includes('_fts_')) return true;
  if (name.startsWith('fts_')) return true;
  return false;
}

// Get all tables
const tables = db.prepare("SELECT name, sql FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND sql IS NOT NULL ORDER BY name").all();

let sql = 'PRAGMA foreign_keys=OFF;\n';

// Phase 1: Drop all tables (reverse order for FK safety, though FK is off)
for (let i = tables.length - 1; i >= 0; i--) {
  if (shouldSkip(tables[i].name)) continue;
  sql += 'DROP TABLE IF EXISTS "' + tables[i].name + '";\n';
}

// Phase 2: Create all tables
for (const table of tables) {
  if (shouldSkip(table.name)) continue;
  sql += table.sql + ';\n';
}

// Phase 3: Insert all data
for (const table of tables) {
  if (shouldSkip(table.name)) continue;
  const rows = db.prepare('SELECT * FROM "' + table.name + '"').all();
  for (const row of rows) {
    const cols = Object.keys(row);
    const vals = cols.map(c => {
      if (row[c] === null) return 'NULL';
      if (typeof row[c] === 'number') return row[c];
      if (row[c] instanceof Buffer) return "X'" + row[c].toString('hex') + "'";
      return "'" + String(row[c]).replace(/'/g, "''") + "'";
    });
    sql += 'INSERT INTO "' + table.name + '" (' + cols.map(c => '"' + c + '"').join(',') + ') VALUES (' + vals.join(',') + ');\n';
  }
}

// Phase 4: Recreate indexes
const indexes = db.prepare("SELECT sql FROM sqlite_master WHERE type='index' AND sql IS NOT NULL").all();
for (const idx of indexes) {
  if (idx.sql && !idx.sql.includes('_fts_')) {
    sql += idx.sql + ';\n';
  }
}

sql += 'PRAGMA foreign_keys=ON;\n';

fs.writeFileSync(outPath, sql);
const lineCount = sql.split('\n').length;
console.log('Generated full reset SQL: ' + outPath + ' (' + lineCount + ' lines)');
db.close();
