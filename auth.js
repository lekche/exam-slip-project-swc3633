const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcrypt');

router.post('/login', async (req, res) => {
    console.log('--- Request Login Diterima ---');
    console.log('Data Body:', req.body);

    const { username, password } = req.body;

    try {
        const [users] = await db.query('SELECT * FROM users WHERE username = ?', [username]);

        if (users.length === 0) {
            console.log('Login Gagal: Pengguna tidak dijumpai.');
            return res.status(401).json({ status: 'error', message: 'Username atau password salah' });
        }

        const user = users[0];
        let isMatch = false;

        if (user.password.startsWith('$2b$') || user.password.startsWith('$2a$')) {
            isMatch = await bcrypt.compare(password, user.password);
        } else {
            isMatch = (password === user.password);
        }

        if (!isMatch) {
            console.log('Login Gagal: Kata laluan tidak padan.');
            return res.status(401).json({ status: 'error', message: 'Username atau password salah' });
        }

        console.log('Login Berjaya:', user);
        return res.json({ 
            status: 'success', 
            user: {
                user_id: user.user_id,
                username: user.username,
                full_name: user.full_name,
                role: user.role,
                email: user.email
            } 
        });

    } catch (error) {
        console.error('Ralat Database semasa Login:', error.message);
        return res.status(500).json({ status: 'error', message: 'Ralat server', error: error.message });
    }
});

module.exports = router;