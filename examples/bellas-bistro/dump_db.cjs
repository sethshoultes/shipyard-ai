const Database = require('better-sqlite3');
const fs = require('fs');
const dbPath = process.argv[2];
const outPath = process.argv[3];
const db = new Database(dbPath, { readonly: true });

// Skip these Cloudflare-internal tables
const skipTables = new Set(['_cf_KV']);

const tables = db.prepare("SELECT name, sql FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND sql IS NOT NULL ORDER BY name").all();

// Just INSERT OR REPLACE - tables should already exist from migrations
let sql = 'PRAGMA foreign_keys=OFF;\n';

for (const table of tables) {
  if (skipTables.has(table.name)) continue;
  
  const rows = db.prepare('SELECT * FROM "' + table.name + '"').all();
  if (rows.length === 0) continue;
  
  // Delete existing content first
  sql += 'DELETE FROM "' + table.name + '";\n';
  
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

sql += 'PRAGMA foreign_keys=ON;\n';

fs.writeFileSync(outPath, sql);
console.log('Exported ' + outPath + ' (' + tables.length + ' tables)');
db.close();
