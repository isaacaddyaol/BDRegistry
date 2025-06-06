import pg from 'pg';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';

dotenv.config();

const SALT_ROUNDS = 10;

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function hashPasswords() {
  try {
    // Get all users
    const users = await pool.query('SELECT id, email, password FROM users;');
    
    console.log('\nUpdating passwords...');
    
    // Update each user's password with hashed version
    for (const user of users.rows) {
      const hashedPassword = await bcrypt.hash(user.password, SALT_ROUNDS);
      await pool.query(
        'UPDATE users SET password = $1 WHERE id = $2',
        [hashedPassword, user.id]
      );
      console.log(`Updated password for ${user.email}`);
    }
    
    console.log('\nAll passwords have been hashed successfully!');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

hashPasswords(); 