const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const app = express();
const PORT = 3005;

app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
    host: 'localhost', user: 'root', password: 'rootpassword', database: 'db_layanan_mahasiswa'
});

app.get('/api/ukm/:nim', async (req, res) => {
    try {
        const { nim } = req.params;
        const [rows] = await pool.query(
            `SELECT u.nama_ukm, u.deskripsi, mu.jabatan 
             FROM mahasiswa_ukm mu JOIN ukm u ON mu.id_ukm = u.id_ukm WHERE mu.nim = ?`, [nim]
        );
        res.json({ success: true, service: 'UKM Microservice Mandiri', data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Database error di UKM Service' });
    }
});

// Endpoint Baru: Pendaftaran Anggota UKM Baru (POST)
app.post('/api/ukm/daftar', async (req, res) => {
    try {
        const { nim, id_ukm, jabatan } = req.body;
        
        if (!nim || !id_ukm) {
            return res.status(400).json({ success: false, message: 'NIM dan ID UKM wajib diisi!' });
        }

        // Ambil nilai jabatan, jika kosong set default sebagai 'Anggota'
        const jabatanFinal = jabatan || 'Anggota';

        await pool.query(
            'INSERT INTO mahasiswa_ukm (nim, id_ukm, jabatan) VALUES (?, ?, ?)',
            [nim, id_ukm, jabatanFinal]
        );

        res.json({ success: true, message: 'Sukses! Mahasiswa berhasil didaftarkan ke UKM baru.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Database error saat mendaftar UKM.' });
    }
});

app.listen(PORT, () => console.log(`🚀 UKM Service aktif di port ${PORT}`));