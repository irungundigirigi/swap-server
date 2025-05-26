import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken'
import pool from '../db.js';

class AuthController {
  static async login(req, res) {
    const { email, password } = req.body;
    try {
      const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
      if (result.rows.length === 0)
        return res.status(401).json({ message: 'User not found' });

      const user = result.rows[0];
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

      const token = jwt.sign({ id: user.user_id }, process.env.JWT_SECRET, {
        expiresIn: '4h',
      });
      res.json({ token });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error });
    }
  }

  static async validateToken(req, res) {
    const client = await pool.connect();
    try {
      const result = await client.query('SELECT * FROM users WHERE user_id = $1', [req.user.id]);
      res.json({ isValid: true, user: result.rows[0] });
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    } finally {
      client.release();
    }
  }
}

export default AuthController;
