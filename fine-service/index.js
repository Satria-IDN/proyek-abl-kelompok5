const express = require('express');
const mysql = require('mysql2/promise');
require('dotenv').config();

const app = express();
app.use(express.json());

// Database Connection Pool
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

// Endpoint: PUT /api/denda/update 
// Endpoint: PUT /api/denda/update 
app.put('/api/denda/update', async (req, res) => {
    // Tambahkan || {} agar tidak crash jika req.body kosong
    const { nim, nominal } = req.body || {}; 

    if (!nim || nominal === undefined) {
        return res.status(400).json({ 
            success: false, 
            message: 'Format salah. Pastikan data dikirim via BODY sebagai JSON, serta NIM dan Nominal telah diisi.' 
        });
    }   

    try {
        // Cek apakah data denda untuk NIM tersebut sudah ada [cite: 104]
        const [rows] = await pool.execute('SELECT * FROM denda WHERE nim = ?', [nim]);

        if (rows.length > 0) {
            // Update nominal denda jika sudah ada [cite: 117]
            await pool.execute('UPDATE denda SET nominal = ? WHERE nim = ?', [nominal, nim]);
            return res.json({ success: true, message: `Denda untuk NIM ${nim} berhasil diperbarui menjadi ${nominal}.` });
        } else {
            // Tambah record denda baru jika belum ada [cite: 104]
            await pool.execute('INSERT INTO denda (nim, nominal) VALUES (?, ?)', [nim, nominal]);
            return res.status(201).json({ success: true, message: `Denda baru untuk NIM ${nim} berhasil ditambahkan.` });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Database error.', error: error.message });
    }
});

const PORT = 3002;
app.listen(PORT, () => {
    console.log(`Fine Service berjalan di port ${PORT}`);
});