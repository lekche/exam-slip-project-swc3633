const express = require('express');
const router = express.Router();
const db = require('../db');

// 1. Simpan / Tambah Markah Pelajar
router.post('/add-grade', async (req, res) => {
    const { student_id, exam_id, score, grade } = req.body;

    if (!student_id || !exam_id || !score || !grade) {
        return res.status(400).json({ message: 'Sila lengkapkan semua ruangan markah!' });
    }

    try {
        const [result] = await db.query(
            'INSERT INTO results (student_id, exam_id, score, grade) VALUES (?, ?, ?, ?)',
            [student_id, exam_id, score, grade]
        );

        res.status(201).json({ 
            message: 'Markah berjaya disimpan!', 
            resultId: result.insertId 
        });
    } catch (error) {
        console.error('Ralat MySQL add-grade:', error);
        res.status(500).json({ 
            message: 'Gagal menyimpan markah dalam database.', 
            error: error.message 
        });
    }
});

// 2. Dapatkan Keputusan Bagi Pelajar Tertentu (Berdasarkan student_id)
router.get('/my-results/:studentId', async (req, res) => {
    const studentId = req.params.studentId;

    try {
        const [rows] = await db.query(`
            SELECT 
                c.course_code, 
                c.course_name, 
                r.score, 
                r.grade
            FROM results r
            JOIN examinations e ON r.exam_id = e.exam_id
            JOIN courses c ON e.course_id = c.course_id
            WHERE r.student_id = ?
        `, [studentId]);

        res.json(rows);
    } catch (error) {
        console.error('Ralat MySQL fetch my-results:', error);
        res.status(500).json({ message: 'Gagal mengambil keputusan pelajar.', error: error.message });
    }
});

module.exports = router;