const express = require('express');
const mysql = require('mysql2/promise');
const { toXML } = require('jstoxml');
require('dotenv').config();

const app = express();

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

// Endpoint: GET /api/xml/mahasiswa/:nim 
app.get('/api/xml/mahasiswa/:nim', async (req, res) => {
    const { nim } = req.params;

    try {
        const [rows] = await pool.execute(
            `SELECT m.nim, m.nama, m.status, COALESCE(d.nominal, 0) AS denda 
             FROM mahasiswa m 
             LEFT JOIN denda d ON m.nim = d.nim 
             WHERE m.nim = ?`, [nim]
        );

        if (rows.length === 0) {
            res.header('Content-Type', 'application/xml');
            return res.status(404).send(toXML({ error: { message: 'Mahasiswa tidak ditemukan' } }));
        }

        const studentData = rows[0];

        // Formatter struktur XML sesuai standar Bab 2.3 & 4.2 [cite: 65, 124]
        const xmlOutput = toXML({
            mahasiswa: {
                nim: studentData.nim,
                nama: studentData.nama,
                status: studentData.status,
                denda_akademik: studentData.denda
            }
        });

        // Mengatur Header HTTP agar dibaca sebagai berkas XML asli
        res.header('Content-Type', 'application/xml');
        return res.send(`<?xml version="1.0" encoding="UTF-8"?>\n${xmlOutput}`);

    } catch (error) {
        res.header('Content-Type', 'application/xml');
        return res.status(500).send(toXML({ error: { message: 'Internal Server Error' } }));
    }
});

const PORT = 3003;
app.listen(PORT, () => {
    console.log(`XML Service berjalan di port ${PORT}`);
});