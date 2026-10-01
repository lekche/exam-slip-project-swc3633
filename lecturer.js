const express = require('express');
const router = express.Router();
const db = require('../db');

// Ambil senarai pelajar yang berdaftar untuk dashboard pensyarah
router.get('/students-list', async (req, res) => {
    try {
        const query = `
            SELECT DISTINCT u.user_id, u.full_name, u.username
            FROM users u
            JOIN student_subjects ss ON u.user_id = ss.student_id
            WHERE u.role = 'Student'
        `;
        const [rows] = await db.query(query);
        res.json(rows);
    } catch (err) {
        console.error("Ralat /students-list:", err.message);
        res.status(500).json({ error: err.message });
    }
});

// Ambil subjek yang diambil oleh pelajar tertentu
router.get('/student-subjects/:student_id', async (req, res) => {
    const studentId = req.params.student_id;
    try {
        const query = `
            SELECT s.subject_id, s.subject_code, s.subject_name, ss.session_name
            FROM student_subjects ss
            JOIN subjects s ON ss.subject_id = s.subject_id
            WHERE ss.student_id = ?
        `;
        const [rows] = await db.query(query, [studentId]);
        res.json(rows);
    } catch (err) {
        console.error("Ralat /student-subjects:", err.message);
        res.status(500).json({ error: err.message });
    }
});

// Simpan atau kemaskini markah pelajar oleh pensyarah (POST)
router.post('/save-mark', async (req, res) => {
    console.log("--- Data Save Mark Diterima ---", req.body);
    const { student_id, subject_id, score, grade, lecturer_id } = req.body;

    // Validasi asas
    if (!student_id || !subject_id || score === undefined || !grade) {
        return res.status(400).json({ status: 'error', message: 'Sila lengkapkan semua maklumat markah!' });
    }

    try {
        const finalLecturerId = lecturer_id || 1;

        // Semak sama ada markah wujud
        const [existing] = await db.query(
            "SELECT * FROM marks WHERE student_id = ? AND subject_id = ?",
            [student_id, subject_id]
        );

        if (existing.length > 0) {
            // Kemaskini rekod sedia ada
            await db.query(
                "UPDATE marks SET score = ?, grade = ?, lecturer_id = ? WHERE student_id = ? AND subject_id = ?",
                [score, grade, finalLecturerId, student_id, subject_id]
            );
        } else {
            // Masukkan rekod baharu
            await db.query(
                "INSERT INTO marks (student_id, subject_id, lecturer_id, score, grade) VALUES (?, ?, ?, ?, ?)",
                [student_id, subject_id, finalLecturerId, score, grade]
            );
        }

        res.json({ status: 'success', message: 'Markah berjaya disimpan!' });
    } catch (err) {
        console.error("Ralat SQL /save-mark:", err.message);
        res.status(500).json({ status: 'error', message: err.message });
    }
});

// Kemaskini markah pelajar menggunakan kaedah PUT (untuk keperluan dokumentasi API)
router.put('/update-mark', async (req, res) => {
    const { student_id, subject_id, score, grade } = req.body;
    
    if (!student_id || !subject_id || score === undefined || !grade) {
        return res.status(400).json({ status: 'error', message: 'Sila lengkapkan maklumat untuk kemaskini!' });
    }

    try {
        await db.query(
            "UPDATE marks SET score = ?, grade = ? WHERE student_id = ? AND subject_id = ?",
            [score, grade, student_id, subject_id]
        );
        res.json({ status: 'success', message: 'Markah berjaya dikemaskini menggunakan PUT!' });
    } catch (err) {
        console.error("Ralat SQL PUT /update-mark:", err.message);
        res.status(500).json({ status: 'error', message: err.message });
    }
});

module.exports = router;