const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const app = express();
const PORT = 3004;

app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
    host: 'localhost', user: 'root', password: 'rootpassword', database: 'db_layanan_mahasiswa'
});

app.get('/api/beasiswa/:nim', async (req, res) => {
    try {
        const { nim } = req.params;
        const [rows] = await pool.query(
            `SELECT b.nama_beasiswa, b.deskripsi, mb.status_seleksi 
             FROM mahasiswa_beasiswa mb JOIN beasiswa b ON mb.id_beasiswa = b.id_beasiswa WHERE mb.nim = ?`, [nim]
        );
        res.json({ success: true, service: 'Scholarship Microservice Mandiri', data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Database error di Beasiswa Service' });
    }
});

app.listen(PORT, () => console.log(`🚀 Scholarship Service aktif di port ${PORT}`));    