const express = require('express');
const mysql = require('mysql2/promise');
require('dotenv').config();

const app = express();
app.use(express.json());

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'rootpassword',
    password: 'rootpassword',
    database: 'db_layanan_mahasiswa', 
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// ================= 1. SCHOLARSHIP SUB-SERVICE [cite: 89, 125] =================
// Endpoint Baru: GET /api/beasiswa/:nim (Spesifik per Mahasiswa)
app.get('/api/beasiswa/:nim', async (req, res) => {
    const { nim } = req.params; // Mengambil parameter NIM dari URL Target

    try {
        // Query SQL JOIN untuk menggabungkan info beasiswa dan status seleksi mahasiswa
        const query = `
            SELECT b.nama_beasiswa, b.deskripsi, mb.status_seleksi 
            FROM mahasiswa_beasiswa mb
            JOIN beasiswa b ON mb.id_beasiswa = b.id_beasiswa
            WHERE mb.nim = ?
        `;
        
        const [rows] = await pool.execute(query, [nim]);
        
        // Kirim hasilnya dalam bentuk array data JSON
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ================= 2. UKM SUB-SERVICE [cite: 90, 130] =================
app.post('/api/ukm/daftar', async (req, res) => {
    const { nim, id_ukm } = req.body; // [cite: 76, 133]
    if (!nim || !id_ukm) return res.status(400).json({ success: false, message: 'Missing fields' });

    try {
        // Logika pendaftaran anggota UKM
        res.json({ success: true, message: `NIM ${nim} sukses mendaftar ke UKM ID ${id_ukm}.` });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ================= 3. COUNSELING SUB-SERVICE [cite: 91, 135] =================
app.post('/api/konseling/booking', async (req, res) => {
    const { nim, tanggal, keluhan } = req.body; // [cite: 137]
    try {
        // Implementasi booking jadwal konselor akademik
        res.json({ success: true, message: `Sesi konseling berhasil dijadwalkan untuk NIM ${nim} pada tanggal ${tanggal}.` });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

const PORT = 3004;
app.listen(PORT, () => {
    console.log(`Advanced Campus Service (Beasiswa, UKM, Konseling) aktif di port ${PORT}`);
});