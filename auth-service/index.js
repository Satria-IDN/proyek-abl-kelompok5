const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3007; // 👈 Khusus Port Authentication Service Mandiri

app.use(cors());
app.use(express.json());

// Endpoint khusus untuk memvalidasi kredensial / API Key dari Gateway
app.post('/api/auth/validate', (req, res) => {
    const { apiKey } = req.body;

    // Di sini sistem melakukan pengecekan keamanan terpusat
    if (apiKey === 'kelompok5_super_secret_key') {
        return res.json({ 
            valid: true, 
            message: 'Verifikasi Sukses: Kredensial dikenali oleh Authentication Service.' 
        });
    }

    return res.status(401).json({ 
        valid: false, 
        message: 'Verifikasi Gagal: API Key tidak sah atau kadaluwarsa.' 
    });
});

app.listen(PORT, () => {
    console.log(`🔒 Authentication Service Mandiri aktif di port ${PORT}`);
});