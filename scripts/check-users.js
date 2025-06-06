import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function checkUsers() {
  try {
    // Check table structure
    console.log('Checking users table structure:');
    const tableInfo = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'users';
    `);
    console.log(tableInfo.rows);

    // Check existing users
    console.log('\nChecking existing users:');
    const users = await pool.query('SELECT * FROM users;');
    console.log(users.rows);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

checkUsers(); 