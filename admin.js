const express = require('express');
const router = express.Router();
const db = require('../db');

// Ambil Senarai Pensyarah
router.get('/lecturers', async (req, res) => {
    try {
        const [rows] = await db.query("SELECT user_id, full_name, email, username FROM users WHERE role = 'Lecturer'");
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Ambil Senarai Pelajar bersama Subjek & Sesi
router.get('/students', async (req, res) => {
    try {
        const query = `
            SELECT u.user_id, u.full_name, u.email, u.username, 
                   GROUP_CONCAT(CONCAT(s.subject_code, ' (', ss.session_name, ')') SEPARATOR ', ') AS enrolled_courses
            FROM users u
            LEFT JOIN student_subjects ss ON u.user_id = ss.student_id
            LEFT JOIN subjects s ON ss.subject_id = s.subject_id
            WHERE u.role = 'Student'
            GROUP BY u.user_id
        `;
        const [rows] = await db.query(query);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Ambil Senarai Subjek
router.get('/subjects-list', async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM subjects");
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Tambah Pensyarah
router.post('/add-lecturer', async (req, res) => {
    const { username, password, full_name, email } = req.body;
    try {
        await db.query(
            "INSERT INTO users (username, password, full_name, email, role) VALUES (?, ?, ?, ?, 'Lecturer')",
            [username, password, full_name, email]
        );
        res.json({ status: 'success', message: 'Pensyarah berjaya ditambah!' });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
});

// Tambah Pelajar + Subjek + Sesi
router.post('/add-student', async (req, res) => {
    const { username, password, full_name, email, subject_ids, session_name } = req.body;
    try {
        const [result] = await db.query(
            "INSERT INTO users (username, password, full_name, email, role) VALUES (?, ?, ?, ?, 'Student')",
            [username, password, full_name, email]
        );
        const newStudentId = result.insertId;

        if (subject_ids && subject_ids.length > 0) {
            for (let subId of subject_ids) {
                await db.query(
                    "INSERT INTO student_subjects (student_id, subject_id, session_name) VALUES (?, ?, ?)",
                    [newStudentId, subId, session_name]
                );
            }
        }
        res.json({ status: 'success', message: 'Pelajar berjaya ditambah!' });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
});

// Padam Pengguna
router.delete('/delete-user/:id', async (req, res) => {
    try {
        await db.query("DELETE FROM users WHERE user_id = ?", [req.params.id]);
        res.json({ status: 'success', message: 'Pengguna dipadam!' });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
});

module.exports = router;