import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function runMigration() {
  try {
    // Read the SQL file
    const sqlPath = path.join(__dirname, '..', 'migrations', 'recreate_all_tables.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    // Execute the SQL
    await pool.query(sql);
    console.log('Migration completed successfully!');
    
    // Verify the tables were created
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    console.log('\nCreated tables:');
    tables.rows.forEach(table => console.log(`- ${table.table_name}`));
  } catch (error) {
    console.error('Error running migration:', error);
  } finally {
    await pool.end();
  }
}

runMigration(); 