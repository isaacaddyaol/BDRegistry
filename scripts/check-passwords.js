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

async function checkPasswords() {
  try {
    const result = await pool.query('SELECT email, password FROM users;');
    console.log('\nCurrent users in database:');
    result.rows.forEach(user => {
      console.log(`Email: ${user.email}`);
      console.log(`Password: ${user.password}`);
      console.log('---');
    });
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

checkPasswords(); 