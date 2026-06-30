const express = require('express');
const proxy = require('express-http-proxy');
const cors = require('cors'); 
const app = express();


const express = require('express');
const proxy = require('express-http-proxy');
const app = express();
const PORT = 3000;

// =================================
// 🔒 KODE SECURITY GEMBOK API KEY 
// =================================
app.use((req, res, next) => {
    // Kita proteksi rute non-GET (POST tambah data dan PUT update denda)
    if (req.method !== 'GET') {
        const apiKey = req.headers['x-api-key'];
        
        if (apiKey !== 'kelompok5_super_secret_key') {
            return res.status(401).json({
                success: false,
                message: 'Security Alert: Akses ditolak! Request tidak menyertakan API Key Kelompok 5 yang valid.'
            });
        }
    }
    next();
});

// Jalur Forwarding Proxy ke Microservices di bawahnya
app.use('/api/status', proxy('http://localhost:3001', {
    proxyReqPathResolver: (req) => `/api/status${req.url}`
}));

app.use('/api/denda', proxy('http://localhost:3002', {
    proxyReqPathResolver: (req) => `/api/denda${req.url}`
}));

app.use('/api/xml', proxy('http://localhost:3003', {
    proxyReqPathResolver: (req) => `/api/xml${req.url}`
}));

app.use('/api/beasiswa', proxy('http://localhost:3004', {
    proxyReqPathResolver: (req) => `/api/beasiswa${req.url}`
}));

app.listen(PORT, () => {
    console.log(`API Gateway Kelompok 5 stanby di port ${PORT}`);
});

app.use(cors()); // Pastikan CORS sudah aktif jika ingin dipakai ke Web UI nanti

// Middleware Logger
app.use((req, res, next) => {
    console.log(`[GATEWAY LOG] ${new Date().toISOString()} | ${req.method} ke jalur: ${req.url}`);
    next();
});

// Perbaikan Routing dengan proxyReqPathResolver agar prefix jalur tidak hilang
app.use('/api/status', proxy('http://localhost:3001', {
    proxyReqPathResolver: (req) => `/api/status${req.url}`
}));

app.use('/api/denda', proxy('http://localhost:3002', {
    proxyReqPathResolver: (req) => `/api/denda${req.url}`
}));

app.use('/api/xml', proxy('http://localhost:3003', {
    proxyReqPathResolver: (req) => `/api/xml${req.url}`
}));

app.use('/api/beasiswa', proxy('http://localhost:3004', {
    proxyReqPathResolver: (req) => `/api/beasiswa${req.url}`
}));

app.use('/api/ukm', proxy('http://localhost:3004', {
    proxyReqPathResolver: (req) => `/api/ukm${req.url}`
}));

app.use('/api/konseling', proxy('http://localhost:3004', {
    proxyReqPathResolver: (req) => `/api/konseling${req.url}`
}));

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`  API Gateway Kelompok 5 Siap Menangani Port ${PORT} `);
    console.log(`=======================================================`);
});