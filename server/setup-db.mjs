import 'dotenv/config';
import mysql from 'mysql2/promise';
import { readFile, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const schemaPath = resolve(dirname(fileURLToPath(import.meta.url)), 'schema.sql');
const schema = await readFile(schemaPath, 'utf8');
const migrationsDirectory = resolve(dirname(fileURLToPath(import.meta.url)), 'migrations');
const migrationFiles = (await readdir(migrationsDirectory))
  .filter(file => file.endsWith('.sql'))
  .sort();
const sqlFiles = [
  ['schema.sql', schema],
  ...await Promise.all(migrationFiles.map(async file => [
    file,
    await readFile(resolve(migrationsDirectory, file), 'utf8'),
  ])),
];

const statements = sqlFiles.flatMap(([file, contents]) => contents
  .split(/;\s*(?:\r?\n|$)/)
  .map(statement => ({ file, sql: statement.trim() }))
).filter(statement => statement.sql);

if (process.env.MYSQL_PASSWORD === undefined) {
  throw new Error('Set MYSQL_PASSWORD in .env. Leave it blank only if your local MySQL account has no password.');
}

const connection = await mysql.createConnection({
  host: process.env.MYSQL_HOST || '127.0.0.1',
  port: Number(process.env.MYSQL_PORT || 3306),
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD,
  ssl: process.env.MYSQL_SSL === 'true' ? { rejectUnauthorized: true } : undefined,
});

try {
  for (const statement of statements) {
    await connection.query(statement.sql);
  }
  console.log('InterviewAI MySQL database and tables are ready.');
} finally {
  await connection.end();
}
