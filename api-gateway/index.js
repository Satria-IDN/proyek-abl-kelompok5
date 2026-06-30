const express = require('express');
const proxy = require('express-http-proxy');
const cors = require('cors'); 
const app = express();
const PORT = 3000; 

// 1. Aktifkan CORS
app.use(cors()); 

// 2. Middleware Logger
app.use((req, res, next) => {
    console.log(`[GATEWAY LOG] ${new Date().toISOString()} | ${req.method} ke jalur: ${req.url}`);
    next();
});

// 3. 🔒 KODE SECURITY DENGAN AUTHENTICATION SERVICE MANDIRI (PORT 3007)
app.use(async (req, res, next) => {
    // Kita proteksi seluruh rute non-GET (POST & PUT)
    if (req.method !== 'GET') {
        const apiKey = req.headers['x-api-key'];
        
        try {
            // Gateway mendelegasikan tugas validasi ke Authentication Service
            const authResponse = await fetch('http://localhost:3007/api/auth/validate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ apiKey })
            });

            const authResult = await authResponse.json();

            // Jika Authentication Service menyatakan tidak valid, blokir request!
            if (!authResponse.ok || !authResult.valid) {
                return res.status(401).json({
                    success: false,
                    message: `Security Alert: Akses ditolak! ${authResult.message || 'Kredensial salah.'}`
                });
            }
            
            console.log(`[AUTH LOG] Request berhasil divalidasi oleh Authentication Service.`);
        } catch (error) {
            // Antisipasi jika server auth-service posisinya mati
            return res.status(500).json({
                success: false,
                message: 'Security Error: Gagal terhubung ke Authentication Service internal.'
            });
        }
    }
    next();
});

// 4. Jalur Forwarding Proxy ke Microservices
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

app.use('/api/ukm', proxy('http://localhost:3005', {
    proxyReqPathResolver: (req) => `/api/ukm${req.url}`
}));

app.use('/api/konseling', proxy('http://localhost:3006', {
    proxyReqPathResolver: (req) => `/api/konseling${req.url}`
}));

// 5. Jalankan Server API Gateway
app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`  API Gateway Kelompok 5 Siap Menangani Port ${PORT} `);
    console.log(`=======================================================`);
});