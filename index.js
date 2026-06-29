const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.json());

// Endpoint dasar untuk cek status server
app.get('/', (req, res) => {
    res.json({ 
        status: "Success",
        message: "Server backend proyek SMT 4 berhasil berjalan!" 
    });
});

app.listen(PORT, () => {
    console.log(`Server aktif dan berjalan di http://localhost:${PORT}`);
});