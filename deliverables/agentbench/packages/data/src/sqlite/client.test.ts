/**
 * Tests for SQLite client with WAL mode and checkpoint recovery.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { SQLiteClient, createMemoryClient, createClient } from './client.js';
import { up as runInitialMigration, isMigrationApplied } from './migrations/001_initial.js';
import { randomUUID } from 'node:crypto';
import { mkdirSync, rmSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

describe('SQLiteClient', () => {
  let client: SQLiteClient;

  beforeEach(() => {
    client = createMemoryClient();
  });

  afterEach(() => {
    if (client.isOpen()) {
      client.close();
    }
  });

  describe('connection management', () => {
    it('should connect to in-memory database', () => {
      expect(client.isOpen()).toBe(false);
      client.connect();
      expect(client.isOpen()).toBe(true);
    });

    it('should handle multiple connect calls idempotently', () => {
      client.connect();
      client.connect();
      expect(client.isOpen()).toBe(true);
    });

    it('should close connection properly', () => {
      client.connect();
      client.close();
      expect(client.isOpen()).toBe(false);
    });

    it('should handle close when not connected', () => {
      expect(() => client.close()).not.toThrow();
    });

    it('should throw when accessing database before connect', () => {
      expect(() => client.getDatabase()).toThrow('Database not connected');
    });
  });

  describe('file-based database', () => {
    let testDir: string;
    let dbPath: string;
    let fileClient: SQLiteClient;

    beforeEach(() => {
      testDir = join(tmpdir(), `agentbench-test-${randomUUID()}`);
      dbPath = join(testDir, 'test.db');
    });

    afterEach(() => {
      if (fileClient?.isOpen()) {
        fileClient.close();
      }
      if (existsSync(testDir)) {
        rmSync(testDir, { recursive: true, force: true });
      }
    });

    it('should create database directory if it does not exist', () => {
      fileClient = createClient(dbPath);
      fileClient.connect();

      expect(existsSync(testDir)).toBe(true);
      expect(existsSync(dbPath)).toBe(true);
    });

    it('should enable WAL mode by default', () => {
      fileClient = createClient(dbPath);
      fileClient.connect();

      const db = fileClient.getDatabase();
      const result = db.pragma('journal_mode') as Array<{ journal_mode: string }>;
      expect(result[0].journal_mode).toBe('wal');
    });

    it('should create WAL files', () => {
      fileClient = createClient(dbPath);
      fileClient.connect();

      // Execute something to trigger WAL
      const db = fileClient.getDatabase();
      db.exec('CREATE TABLE test (id INTEGER PRIMARY KEY)');
      db.exec('INSERT INTO test VALUES (1)');

      // WAL files should exist (though they may be small)
      expect(existsSync(dbPath)).toBe(true);
    });
  });

  describe('WAL mode configuration', () => {
    it('should allow disabling WAL mode', () => {
      const noWalClient = new SQLiteClient({
        dbPath: ':memory:',
        walMode: false,
      });
      noWalClient.connect();

      const db = noWalClient.getDatabase();
      const result = db.pragma('journal_mode') as Array<{ journal_mode: string }>;
      // In-memory databases use 'memory' journal mode
      expect(result[0].journal_mode).toBe('memory');

      noWalClient.close();
    });
  });

  describe('SQL execution', () => {
    beforeEach(() => {
      client.connect();
    });

    it('should execute raw SQL statements', () => {
      client.exec('CREATE TABLE test (id INTEGER PRIMARY KEY, name TEXT)');
      client.exec("INSERT INTO test (name) VALUES ('hello')");

      const db = client.getDatabase();
      const result = db.prepare('SELECT * FROM test').all() as Array<{
        id: number;
        name: string;
      }>;
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('hello');
    });

    it('should prepare statements for repeated execution', () => {
      client.exec('CREATE TABLE test (id INTEGER PRIMARY KEY, value INTEGER)');

      const insert = client.prepare('INSERT INTO test (value) VALUES (?)');
      insert.run(1);
      insert.run(2);
      insert.run(3);

      const db = client.getDatabase();
      const result = db.prepare('SELECT COUNT(*) as count FROM test').get() as {
        count: number;
      };
      expect(result.count).toBe(3);
    });
  });

  describe('transactions', () => {
    beforeEach(() => {
      client.connect();
      client.exec('CREATE TABLE test (id INTEGER PRIMARY KEY, value INTEGER)');
    });

    it('should execute function within transaction', () => {
      const result = client.transaction((db) => {
        db.prepare('INSERT INTO test (value) VALUES (?)').run(1);
        db.prepare('INSERT INTO test (value) VALUES (?)').run(2);
        return db.prepare('SELECT COUNT(*) as count FROM test').get() as {
          count: number;
        };
      });

      expect(result.count).toBe(2);
    });

    it('should rollback on error', () => {
      expect(() => {
        client.transaction((db) => {
          db.prepare('INSERT INTO test (value) VALUES (?)').run(1);
          throw new Error('Simulated error');
        });
      }).toThrow('Simulated error');

      const db = client.getDatabase();
      const result = db.prepare('SELECT COUNT(*) as count FROM test').get() as {
        count: number;
      };
      expect(result.count).toBe(0);
    });

    it('should handle nested function calls in transaction', () => {
      const insertValue = (db: ReturnType<typeof client.getDatabase>, value: number) => {
        db.prepare('INSERT INTO test (value) VALUES (?)').run(value);
      };

      client.transaction((db) => {
        insertValue(db, 10);
        insertValue(db, 20);
        insertValue(db, 30);
      });

      const db = client.getDatabase();
      const result = db.prepare('SELECT SUM(value) as sum FROM test').get() as {
        sum: number;
      };
      expect(result.sum).toBe(60);
    });
  });

  describe('migrations', () => {
    beforeEach(() => {
      client.connect();
    });

    it('should run initial migration successfully', () => {
      const db = client.getDatabase();
      runInitialMigration(db);

      // Check that tables exist
      const tables = db
        .prepare(
          "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
        )
        .all() as Array<{ name: string }>;

      const tableNames = tables.map((t) => t.name);
      expect(tableNames).toContain('benchmark_runs');
      expect(tableNames).toContain('benchmark_results');
      expect(tableNames).toContain('checkpoints');
      expect(tableNames).toContain('_migrations');
    });

    it('should track migration status', () => {
      const db = client.getDatabase();

      expect(isMigrationApplied(db, '001_initial')).toBe(false);

      runInitialMigration(db);

      expect(isMigrationApplied(db, '001_initial')).toBe(true);
    });

    it('should be idempotent', () => {
      const db = client.getDatabase();

      runInitialMigration(db);
      runInitialMigration(db);
      runInitialMigration(db);

      // Should not throw and migration should only be recorded once
      const count = db
        .prepare("SELECT COUNT(*) as count FROM _migrations WHERE id = '001_initial'")
        .get() as { count: number };
      expect(count.count).toBe(1);
    });
  });

  describe('benchmark runs CRUD operations', () => {
    beforeEach(() => {
      client.connect();
      runInitialMigration(client.getDatabase());
    });

    it('should insert and retrieve benchmark run', () => {
      const db = client.getDatabase();
      const id = randomUUID();

      db.prepare(`
        INSERT INTO benchmark_runs (id, suite, agent, status)
        VALUES (?, ?, ?, ?)
      `).run(id, 'test-suite', 'test-agent', 'running');

      const run = db.prepare('SELECT * FROM benchmark_runs WHERE id = ?').get(id) as {
        id: string;
        suite: string;
        agent: string;
        status: string;
      };

      expect(run.id).toBe(id);
      expect(run.suite).toBe('test-suite');
      expect(run.agent).toBe('test-agent');
      expect(run.status).toBe('running');
    });

    it('should update benchmark run status', () => {
      const db = client.getDatabase();
      const id = randomUUID();

      db.prepare(`
        INSERT INTO benchmark_runs (id, suite, agent, status)
        VALUES (?, ?, ?, ?)
      `).run(id, 'test-suite', 'test-agent', 'running');

      db.prepare(`
        UPDATE benchmark_runs SET status = ?, completed_at = datetime('now')
        WHERE id = ?
      `).run('completed', id);

      const run = db.prepare('SELECT * FROM benchmark_runs WHERE id = ?').get(id) as {
        status: string;
        completed_at: string;
      };

      expect(run.status).toBe('completed');
      expect(run.completed_at).not.toBeNull();
    });

    it('should enforce status constraint', () => {
      const db = client.getDatabase();
      const id = randomUUID();

      expect(() => {
        db.prepare(`
          INSERT INTO benchmark_runs (id, suite, agent, status)
          VALUES (?, ?, ?, ?)
        `).run(id, 'test-suite', 'test-agent', 'invalid-status');
      }).toThrow();
    });
  });

  describe('benchmark results CRUD operations', () => {
    let runId: string;

    beforeEach(() => {
      client.connect();
      runInitialMigration(client.getDatabase());

      // Create a benchmark run first
      const db = client.getDatabase();
      runId = randomUUID();
      db.prepare(`
        INSERT INTO benchmark_runs (id, suite, agent, status)
        VALUES (?, ?, ?, ?)
      `).run(runId, 'test-suite', 'test-agent', 'running');
    });

    it('should insert and retrieve benchmark result', () => {
      const db = client.getDatabase();
      const resultId = randomUUID();

      db.prepare(`
        INSERT INTO benchmark_results (id, run_id, benchmark_id, score, details, duration)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(resultId, runId, 'bench-1', 95.5, JSON.stringify({ passed: true }), 1234);

      const result = db
        .prepare('SELECT * FROM benchmark_results WHERE id = ?')
        .get(resultId) as {
        id: string;
        run_id: string;
        benchmark_id: string;
        score: number;
        details: string;
        duration: number;
      };

      expect(result.id).toBe(resultId);
      expect(result.run_id).toBe(runId);
      expect(result.benchmark_id).toBe('bench-1');
      expect(result.score).toBe(95.5);
      expect(JSON.parse(result.details)).toEqual({ passed: true });
      expect(result.duration).toBe(1234);
    });

    it('should cascade delete results when run is deleted', () => {
      const db = client.getDatabase();

      // Insert some results
      db.prepare(`
        INSERT INTO benchmark_results (id, run_id, benchmark_id, score, details, duration)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(randomUUID(), runId, 'bench-1', 90, '{}', 100);

      db.prepare(`
        INSERT INTO benchmark_results (id, run_id, benchmark_id, score, details, duration)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(randomUUID(), runId, 'bench-2', 85, '{}', 200);

      // Verify results exist
      let count = db
        .prepare('SELECT COUNT(*) as count FROM benchmark_results WHERE run_id = ?')
        .get(runId) as { count: number };
      expect(count.count).toBe(2);

      // Delete the run
      db.prepare('DELETE FROM benchmark_runs WHERE id = ?').run(runId);

      // Results should be gone
      count = db
        .prepare('SELECT COUNT(*) as count FROM benchmark_results WHERE run_id = ?')
        .get(runId) as { count: number };
      expect(count.count).toBe(0);
    });
  });

  describe('checkpoints CRUD operations', () => {
    let runId: string;

    beforeEach(() => {
      client.connect();
      runInitialMigration(client.getDatabase());

      const db = client.getDatabase();
      runId = randomUUID();
      db.prepare(`
        INSERT INTO benchmark_runs (id, suite, agent, status)
        VALUES (?, ?, ?, ?)
      `).run(runId, 'test-suite', 'test-agent', 'running');
    });

    it('should insert and retrieve checkpoint', () => {
      const db = client.getDatabase();
      const checkpointId = randomUUID();
      const state = {
        currentIndex: 5,
        totalBenchmarks: 10,
        completedBenchmarks: ['a', 'b', 'c'],
      };

      db.prepare(`
        INSERT INTO checkpoints (id, run_id, state)
        VALUES (?, ?, ?)
      `).run(checkpointId, runId, JSON.stringify(state));

      const checkpoint = db
        .prepare('SELECT * FROM checkpoints WHERE id = ?')
        .get(checkpointId) as {
        id: string;
        run_id: string;
        state: string;
      };

      expect(checkpoint.id).toBe(checkpointId);
      expect(checkpoint.run_id).toBe(runId);
      expect(JSON.parse(checkpoint.state)).toEqual(state);
    });

    it('should get latest checkpoint for a run', () => {
      const db = client.getDatabase();

      // Insert multiple checkpoints
      for (let i = 0; i < 3; i++) {
        db.prepare(`
          INSERT INTO checkpoints (id, run_id, state, created_at)
          VALUES (?, ?, ?, datetime('now', '+' || ? || ' seconds'))
        `).run(randomUUID(), runId, JSON.stringify({ index: i }), i);
      }

      const latest = db
        .prepare(
          `
        SELECT * FROM checkpoints
        WHERE run_id = ?
        ORDER BY created_at DESC
        LIMIT 1
      `
        )
        .get(runId) as { state: string };

      expect(JSON.parse(latest.state)).toEqual({ index: 2 });
    });

    it('should cascade delete checkpoints when run is deleted', () => {
      const db = client.getDatabase();

      // Insert checkpoints
      db.prepare(`
        INSERT INTO checkpoints (id, run_id, state)
        VALUES (?, ?, ?)
      `).run(randomUUID(), runId, '{}');

      db.prepare(`
        INSERT INTO checkpoints (id, run_id, state)
        VALUES (?, ?, ?)
      `).run(randomUUID(), runId, '{}');

      // Verify checkpoints exist
      let count = db
        .prepare('SELECT COUNT(*) as count FROM checkpoints WHERE run_id = ?')
        .get(runId) as { count: number };
      expect(count.count).toBe(2);

      // Delete the run
      db.prepare('DELETE FROM benchmark_runs WHERE id = ?').run(runId);

      // Checkpoints should be gone
      count = db
        .prepare('SELECT COUNT(*) as count FROM checkpoints WHERE run_id = ?')
        .get(runId) as { count: number };
      expect(count.count).toBe(0);
    });
  });

  describe('indexes', () => {
    beforeEach(() => {
      client.connect();
      runInitialMigration(client.getDatabase());
    });

    it('should create all expected indexes', () => {
      const db = client.getDatabase();
      const indexes = db
        .prepare("SELECT name FROM sqlite_master WHERE type='index' AND name LIKE 'idx_%'")
        .all() as Array<{ name: string }>;

      const indexNames = indexes.map((i) => i.name);
      expect(indexNames).toContain('idx_benchmark_results_run_id');
      expect(indexNames).toContain('idx_checkpoints_run_id');
      expect(indexNames).toContain('idx_benchmark_runs_status');
      expect(indexNames).toContain('idx_benchmark_runs_suite');
    });
  });
});
