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

async function updateCredentials() {
  try {
    // Read the SQL file
    const sqlPath = path.join(__dirname, '..', 'migrations', 'update_credentials.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    // Execute the SQL
    await pool.query(sql);
    console.log('Credentials updated successfully!');
    
    // Verify the updates
    const users = await pool.query('SELECT id, email, first_name, last_name, role FROM users ORDER BY role;');
    console.log('\nUpdated users:');
    users.rows.forEach(user => {
      console.log(`- ${user.role}: ${user.email} (${user.first_name} ${user.last_name})`);
    });
  } catch (error) {
    console.error('Error updating credentials:', error);
  } finally {
    await pool.end();
  }
}

updateCredentials(); 