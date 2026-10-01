const express = require('express');
const router = express.Router();
const db = require('../db');

// Ambil Jadual Peperiksaan Pelajar
router.get('/timetable/:student_id', async (req, res) => {
    const studentId = req.params.student_id;
    try {
        const query = `
            SELECT s.subject_code, s.subject_name, ss.session_name,
                   '2026-11-10' AS exam_date, '09:00:00' AS exam_time, 'Dewan Utama' AS venue
            FROM student_subjects ss
            JOIN subjects s ON ss.subject_id = s.subject_id
            WHERE ss.student_id = ?
        `;
        const [rows] = await db.query(query, [studentId]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Ambil Keputusan Markah Pelajar
router.get('/results/:student_id', async (req, res) => {
    const studentId = req.params.student_id;
    try {
        const query = `
            SELECT s.subject_code, s.subject_name, m.score, m.grade, u.full_name AS lecturer_name
            FROM student_subjects ss
            JOIN subjects s ON ss.subject_id = s.subject_id
            LEFT JOIN marks m ON ss.student_id = m.student_id AND ss.subject_id = m.subject_id
            LEFT JOIN users u ON m.lecturer_id = u.user_id
            WHERE ss.student_id = ?
        `;
        const [rows] = await db.query(query, [studentId]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;