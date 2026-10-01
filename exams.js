const express = require('express');
const router = express.Router();
const db = require('../db');

// 1. Ambil Semua Jadual Ujian (GET)
router.get('/', async (req, res) => {
    try {
        const query = `
            SELECT exams.id, courses.course_code, courses.course_name, 
                   exams.exam_date, exams.start_time, exams.end_time, exams.venue
            FROM exams
            JOIN courses ON exams.course_id = courses.id
        `;
        const [exams] = await db.query(query);
        res.json(exams);
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengambil data ujian', error: error.message });
    }
});

// 2. Tambah Jadual Ujian Baru (POST)
router.post('/', async (req, res) => {
    const { course_id, exam_date, start_time, end_time, venue } = req.body;

    if (!course_id || !exam_date || !start_time || !end_time || !venue) {
        return res.status(400).json({ message: 'Semua ruangan wajib diisi!' });
    }

    try {
        const [result] = await db.query(
            'INSERT INTO exams (course_id, exam_date, start_time, end_time, venue) VALUES (?, ?, ?, ?, ?)',
            [course_id, exam_date, start_time, end_time, venue]
        );
        res.status(201).json({
            message: 'Jadual ujian berjaya ditambahkan!',
            examId: result.insertId
        });
    } catch (error) {
        res.status(500).json({ message: 'Gagal menambahkan ujian', error: error.message });
    }
});

// 3. Hapus Jadual Ujian (DELETE)
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const [result] = await db.query('DELETE FROM exams WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Jadual ujian tidak dijumpai' });
        }

        res.json({ message: 'Jadual ujian berjaya dihapus!' });
    } catch (error) {
        res.status(500).json({ message: 'Gagal menghapus ujian', error: error.message });
    }
});

module.exports = router;