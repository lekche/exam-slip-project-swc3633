const express = require('express');
const router = express.Router();
const db = require('../db');

// API Dapatkan Semua Kursus
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM courses');
        res.json(rows);
    } catch (error) {
        console.error('Ralat MySQL Courses:', error);
        res.status(500).json({ message: 'Gagal mengambil senarai kursus.' });
    }
});

module.exports = router;