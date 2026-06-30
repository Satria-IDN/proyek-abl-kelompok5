const express = require('express');
const mysql = require('mysql2/promise');
const app = express();
const PORT = 3001;

app.use(express.json());

// 1. Konfigurasi Koneksi ke Database MySQL Docker
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

// 2. Endpoint: GET /api/status/{nim}
app.get('/api/status/:nim', async (req, res) => {
    const { nim } = req.params;

    try {
        // 🔥 PERBAIKAN: Mengubah dbPool.query menjadi pool.execute sesuai nama variabel di atas
        const [rows] = await pool.execute('SELECT nim, nama, status FROM mahasiswa WHERE nim = ?', [nim]);

        // Jika data tidak ditemukan di database
        if (rows.length === 0) {
            return res.status(404).json({ 
                status: 'Not Found', 
                message: `Mahasiswa dengan NIM ${nim} tidak ditemukan.` 
            });
        }

        // Kembalikan response JSON sesuai spesifikasi laporan
        res.json(rows[0]);

    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            status: 'Error', 
            message: 'Gagal melakukan query ke database MySQL' 
        });
    }
});

// 3. Endpoint: POST /api/status/tambah
app.post('/api/status/tambah', async (req, res) => {
    // Membaca data yang dikirim oleh Frontend dari req.body
    const { nim, nama, status } = req.body || {};

    // Validasi dasar agar database tidak menyimpan data kosong
    if (!nim || !nama || !status) {
        return res.status(400).json({ 
            success: false, 
            message: 'Gagal! Kolom NIM, Nama, dan Status wajib diisi semuanya.' 
        });
    }

    try {
        // Query SQL untuk menyuntikkan data ke tabel mahasiswa
        const query = 'INSERT INTO mahasiswa (nim, nama, status) VALUES (?, ?, ?)';
        await pool.execute(query, [nim, nama, status]);

        // Berikan respon sukses balik ke Frontend
        return res.status(201).json({ 
            success: true, 
            message: `Sukses! Mahasiswa bernama ${nama} berhasil disimpan ke database.` 
        });
    } catch (error) {
        console.error(error);
        // Antisipasi jika ada NIM kembar (Duplicate Entry)
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ success: false, message: `Gagal! NIM ${nim} sudah terdaftar di sistem.` });
        }
        return res.status(500).json({ success: false, message: 'Database Error', error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Student Status Service aktif di http://localhost:${PORT}`);
});