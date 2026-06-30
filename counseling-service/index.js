const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const app = express();
const PORT = 3006;

app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
    host: 'localhost', user: 'root', password: 'rootpassword', database: 'db_layanan_mahasiswa'
});

app.get('/api/konseling/:nim', async (req, res) => {
    try {
        const { nim } = req.params;
        const [rows] = await pool.query(
            `SELECT keluhan, DATE_FORMAT(tanggal_konseling, "%Y-%m-%d") as tanggal, status_solusi FROM konseling WHERE nim = ?`, [nim]
        );
        res.json({ success: true, service: 'Counseling Microservice Mandiri', data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Database error di Konseling Service' });
    }
});

// Endpoint Baru: Booking Jadwal Konseling Baru (POST)
app.post('/api/konseling/booking', async (req, res) => {
    try {
        const { nim, keluhan, tanggal_konseling } = req.body;

        if (!nim || !keluhan || !tanggal_konseling) {
            return res.status(400).json({ success: false, message: 'Semua data form wajib diisi!' });
        }

        await pool.query(
            'INSERT INTO konseling (nim, keluhan, tanggal_konseling, status_solusi) VALUES (?, ?, ?, ?)',
            [nim, keluhan, tanggal_konseling, 'Diproses']
        );

        res.json({ success: true, message: 'Sukses! Jadwal bimbingan konseling berhasil dipesan.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Database error saat membuat jadwal konseling.' });
    }
});

app.listen(PORT, () => console.log(`🚀 Counseling Service aktif di port ${PORT}`));