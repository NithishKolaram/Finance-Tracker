import pkg from 'pg';
const { Pool } = pkg;

let pool;

function getPool() {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    
    if (!connectionString) {
      console.error('DATABASE_URL is not set!');
      throw new Error('DATABASE_URL environment variable is not configured');
    }
    
    console.log('Initializing database pool...');
    
    pool = new Pool({
      connectionString,
      ssl: {
        rejectUnauthorized: false
      }
    });
    
    pool.on('error', (err) => {
      console.error('Unexpected database error:', err);
    });
  }
  return pool;
}

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        const currentPool = getPool();

        if (req.method === "GET") {
        console.log('Fetching users...');
        
        const { rows } = await currentPool.query(
            "SELECT $1 FROM users"
        );

        console.log(`Found user`);
        return res.status(200).json(rows);
        }

        if (req.method === "POST") {
        console.log('Creating user...');
        const { users } = req.body;

        await currentPool.query(
            `INSERT INTO users
            (users)
            VALUES ($1)`,
            [users]
        );

        console.log('User created successfully');
        return res.status(201).json({ success: true });
        }

        if (req.method === "PATCH") {
        console.log('Updating user status...');
        const { id } = req.body;
        
        await currentPool.query(
            "UPDATE users SET status='resolved' WHERE id=$1",
            [id]
        );

        console.log('User status updated successfully');
        return res.status(200).json({ success: true });
        }

        if (req.method === "DELETE") {
        const { id } = req.query;
        console.log(`Deleting user with id: ${id}`);
        
        await currentPool.query("DELETE FROM users WHERE id=$1", [id]);
        
        console.log('User deleted successfully');
        return res.status(200).json({ success: true });
        }

        res.status(405).json({ error: "Method not allowed" });
    } catch (err) {
        console.error("Database error details:", err);
        
        return res.status(500).json({ 
        error: "Database error", 
        message: err.message,
        code: err.code,
        hint: err.hint,
        detail: err.detail,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    }
}