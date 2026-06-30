module.exports = {
  apps: [
    { name: '0-auth-service', script: 'index.js', cwd: './auth-service', watch: true }, // 👈 TAMBAHKAN BARIS INI
    { name: '1-api-gateway', script: 'index.js', cwd: './api-gateway', watch: true },
    { name: '2-student-service', script: 'index.js', cwd: './student-service', watch: true },
    { name: '3-fine-service', script: 'index.js', cwd: './fine-service', watch: true },
    { name: '4-xml-service', script: 'index.js', cwd: './xml-service', watch: true },
    { name: '5-scholarship-service', script: 'index.js', cwd: './scholarship-service', watch: true },
    { name: '6-ukm-service', script: 'index.js', cwd: './ukm-service', watch: true },
    { name: '7-counseling-service', script: 'index.js', cwd: './counseling-service', watch: true }
  ]
};