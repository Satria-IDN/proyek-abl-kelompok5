import React, { useState, useEffect } from 'react';
import { User, CreditCard, Code, GraduationCap, ShieldCheck } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState('status');
  const [nim, setNim] = useState('20240801048'); // Default NIM kamu untuk mempermudah demo
  
  // States untuk menyimpan data API
  const [studentData, setStudentData] = useState(null);
  const [dendaNominal, setDendaNominal] = useState('');
  const [xmlData, setXmlData] = useState('');
  const [beasiswaList, setBeasiswaList] = useState([]);
  
  // States Untuk Form Tambah Mahasiswa Baru
  const [newNim, setNewNim] = useState('');
  const [newNama, setNewNama] = useState('');
  const [newStatus, setNewStatus] = useState('Aktif');
  
  // States untuk feedback UI
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });

  const BASE_URL = 'http://localhost:3000'; // Menembak langsung ke API Gateway

  // Fungsi utilitas untuk menampilkan alert message sementara
  const showAlert = (type, text) => {
    setStatusMsg({ type, text });
    setTimeout(() => setStatusMsg({ type: '', text: '' }), 5000);
  };

  // 1. Core Service: Cek Status Mahasiswa
  const handleCheckStatus = async () => {
    if (!nim) return showAlert('error', 'Masukkan NIM terlebih dahulu!');
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/status/${nim}`);
      
      if (res.status === 404) {
        throw new Error('NIM Mahasiswa tidak ditemukan di database.');
      } else if (!res.ok) {
        throw new Error(`Server Error (${res.status}). Cek terminal student-service atau koneksi Docker kamu!`);
      }

      const data = await res.json();
      setStudentData(data);
      showAlert('success', 'Data status mahasiswa berhasil ditarik dari database.');
    } catch (err) {
      setStudentData(null);
      showAlert('error', err.message);
    } finally { setLoading(false); }
  };

  // Fungsi Handler POST Tambah Mahasiswa ke API Gateway
  const handleTambahMahasiswa = async (e) => {
    e.preventDefault(); 
    
    if (!newNim || !newNama) {
      showAlert('error', 'NIM dan Nama tidak boleh kosong!');
      return;
    }

    setLoading(true);
    try {
          const response = await fetch(`${BASE_URL}/api/status/tambah`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'x-api-key': 'kelompok5_super_secret_key' // 🔑 Kirim kunci rahasia ke gateway
            },
            body: JSON.stringify({
              nim: newNim,
              nama: newNama,
              status: newStatus
            })
          });
      const data = await response.json();

      if (data.success) {
        showAlert('success', data.message);
        setNewNim('');  
        setNewNama(''); 
        setNewStatus('Aktif');
      } else {
        showAlert('error', data.message);
      }
    } catch (error) {
      showAlert('error', 'Gagal terhubung ke API Gateway.');
    } finally {
      setLoading(false);
    }
  };

  // 2. Core Service: Update Denda
  const handleUpdateDenda = async (e) => {
    e.preventDefault();
    if (!nim || !dendaNominal) return showAlert('error', 'NIM dan Nominal Denda wajib diisi!');
    setLoading(true);
    try {
          const res = await fetch(`${BASE_URL}/api/denda/update`, {
            method: 'PUT',
            headers: { 
              'Content-Type': 'application/json',
              'x-api-key': 'kelompok5_super_secret_key' // 🔑 Kirim kunci rahasia ke gateway
            },
            body: JSON.stringify({ nim, nominal: parseInt(dendaNominal) })
          });
      const data = await res.json();
      if (data.success) {
        showAlert('success', data.message);
        setDendaNominal('');
      } else {
        throw new Error(data.message);
      }
    } catch (err) { showAlert('error', err.message); }
    finally { setLoading(false); }
  };

  // 3. Core Service: Ambil Dokumen XML
  const handleFetchXML = async () => {
    if (!nim) return showAlert('error', 'Masukkan NIM terlebih dahulu!');
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/xml/mahasiswa/${nim}`);
      const text = await res.text();
      setXmlData(text);
      showAlert('success', 'Dokumen XML berhasil di-generate oleh XML Service.');
    } catch (err) { showAlert('error', 'Gagal memuat data XML'); }
    finally { setLoading(false); }
  };

  // 4. Campus Service: Ambil Daftar Beasiswa Spesifik per NIM
  const handleFetchBeasiswa = async () => {
    if (!nim) return;
    try {
      const res = await fetch(`${BASE_URL}/api/beasiswa/${nim}`);
      const data = await res.json();
      if (data.success) setBeasiswaList(data.data);
    } catch (err) { console.error('Gagal mengambil data beasiswa', err); }
  };

  // Memicu pencarian ulang otomatis saat tab berpindah ATAU isi NIM diubah
  useEffect(() => {
    if (activeTab === 'beasiswa') handleFetchBeasiswa();
  }, [activeTab, nim]);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Segoe UI, sans-serif', backgroundColor: '#f3f4f6', color: '#1f2937' }}>
      
      {/* SIDEBAR NAVIGATION (Tetap di Samping Kiri) */}
      <div style={{ width: '280px', backgroundColor: '#1e3a8a', color: '#ffffff', padding: '24px', display: 'flex', flexDirection: 'column', gap: '8px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px', paddingBottom: '16px', borderBottom: '1px solid #3b82f6' }}>
          <ShieldCheck size={32} color="#60a5fa" />
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>Kelompok 5</h2>
            <p style={{ fontSize: '12px', color: '#93c5fd', margin: 0 }}>SOA & Microservices UI</p>
          </div>
        </div>

        <button onClick={() => setActiveTab('status')} style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '12px', borderRadius: '8px', border: 'none', background: activeTab === 'status' ? '#3b82f6' : 'transparent', color: '#fff', cursor: 'pointer', textAlign: 'left', fontWeight: '500' }}>
          <User size={20} /> Cek Status Mahasiswa
        </button>
        <button onClick={() => setActiveTab('denda')} style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '12px', borderRadius: '8px', border: 'none', background: activeTab === 'denda' ? '#3b82f6' : 'transparent', color: '#fff', cursor: 'pointer', textAlign: 'left', fontWeight: '500' }}>
          <CreditCard size={20} /> Kelola Denda (Fine)
        </button>
        <button onClick={() => setActiveTab('xml')} style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '12px', borderRadius: '8px', border: 'none', background: activeTab === 'xml' ? '#3b82f6' : 'transparent', color: '#fff', cursor: 'pointer', textAlign: 'left', fontWeight: '500' }}>
          <Code size={20} /> XML Service Viewer
        </button>
        <button onClick={() => setActiveTab('beasiswa')} style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '12px', borderRadius: '8px', border: 'none', background: activeTab === 'beasiswa' ? '#3b82f6' : 'transparent', color: '#fff', cursor: 'pointer', textAlign: 'left', fontWeight: '500' }}>
          <GraduationCap size={20} /> Info Beasiswa
        </button>
      </div>

      {/* MAIN CONTENT AREA (DI-SET RATA TENGAH SECARA MAKSIMAL) */}
      <div style={{ flex: 1, padding: '40px', overflowY: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        
        {/* CONTAINER PEMBATAS LEBAR (Agar UI proporsional di monitor lebar) */}
        <div style={{ width: '100%', maxWidth: '800px' }}>

          {/* GLOBAL NIM INPUT BAR */}
          <div style={{ background: '#ffffff', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
            <label style={{ fontWeight: '600', color: '#4b5563' }}>NIM Target Operasi:</label>
            <input type="text" value={nim} onChange={(e) => setNim(e.target.value)} style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #d1d5db', width: '250px', fontSize: '15px', fontWeight: '600', color: '#1f2937', backgroundColor: '#fff' }} placeholder="Masukkan NIM..." />
            {loading && <span style={{ color: '#3b82f6', fontWeight: '500' }}>Memproses jaringan...</span>}
          </div>

          {/* NOTIFICATION TOAST */}
          {statusMsg.text && (
            <div style={{ padding: '16px', borderRadius: '8px', marginBottom: '24px', backgroundColor: statusMsg.type === 'success' ? '#d1fae5' : '#fee2e2', color: statusMsg.type === 'success' ? '#065f46' : '#991b1b', fontWeight: '500', textAlign: 'center' }}>
              {statusMsg.text}
            </div>
          )}

          {/* TAB 1: STUDENT STATUS */}
          {activeTab === 'status' && (
            <div style={{ background: '#ffffff', padding: '32px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', textAlign: 'center' }}>
              <h3 style={{ fontSize: '22px', marginTop: 0, marginBottom: '8px' }}>Layanan Cek Status Mahasiswa</h3>
              <p style={{ color: '#6b7280', marginBottom: '24px' }}>Mendapatkan data status langsung dari Database MySQL terisolasi lewat port gateway.</p>
              <button onClick={handleCheckStatus} style={{ padding: '12px 24px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>Jalankan Query Status</button>

              {studentData && (
                <div style={{ marginTop: '32px', padding: '24px', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                  <h4 style={{ margin: '0 0 16px 0', color: '#111827', fontSize: '18px' }}>Hasil Response JSON Asli:</h4>
                  <p><strong>NIM:</strong> {studentData.nim}</p>
                  <p><strong>Nama Lengkap:</strong> {studentData.nama}</p>
                  <p><strong>Status Akademik:</strong> <span style={{ padding: '4px 8px', borderRadius: '4px', backgroundColor: '#d1fae5', color: '#065f46', fontWeight: 'bold' }}>{studentData.status}</span></p>
                </div>
              )}

              {/* FORM TAMBAH MAHASISWA BARU */}
              <div style={{ marginTop: '40px', paddingTop: '32px', borderTop: '2px dashed #e5e7eb', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <h4 style={{ fontSize: '18px', margin: '0 0 8px 0', color: '#1e3a8a' }}>Tambah Data Mahasiswa Baru</h4>
                <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '20px' }}>Fitur input ini akan mengirimkan data via API Gateway menuju repositori basis data utama.</p>
                
                <form onSubmit={handleTambahMahasiswa} style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', maxWidth: '400px', textAlign: 'left' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>Nomor Induk Mahasiswa (NIM):</label>
                    <input type="text" value={newNim} onChange={(e) => setNewNim(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', color: '#1f2937', backgroundColor: '#fff' }} placeholder="Contoh: 20240801223" />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>Nama Lengkap:</label>
                    <input type="text" value={newNama} onChange={(e) => setNewNama(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', color: '#1f2937', backgroundColor: '#fff' }} placeholder="Contoh: Achmad Fachry Arrafy" />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>Status Akademik:</label>
                    <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', backgroundColor: '#fff', color: '#1f2937' }}>
                      <option value="Aktif">Aktif</option>
                      <option value="Cuti">Cuti</option>
                      <option value="Non-Aktif">Non-Aktif</option>
                    </select>
                  </div>

                  <button type="submit" style={{ padding: '12px', backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', marginTop: '8px' }}>
                    Simpan Anggota Kelompok
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TAB 2: FINE MANAGEMENT */}
          {activeTab === 'denda' && (
            <div style={{ background: '#ffffff', padding: '32px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <h3 style={{ fontSize: '22px', marginTop: 0, marginBottom: '8px' }}>Manajemen Sistem Denda Kampus</h3>
              <p style={{ color: '#6b7280', marginBottom: '24px' }}>Melakukan mutasi atau penambahan nilai saldo denda mahasiswa berbasis metode HTTP PUT.</p>
              
              <form onSubmit={handleUpdateDenda} style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', maxWidth: '400px', textAlign: 'left' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Nominal Denda Baru (Rupiah):</label>
                  <input type="number" value={dendaNominal} onChange={(e) => setDendaNominal(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', color: '#1f2937', backgroundColor: '#fff' }} placeholder="Contoh: 50000" />
                </div>
                <button type="submit" style={{ padding: '12px', backgroundColor: '#dc2626', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>Eksekusi Update Data</button>
              </form>
            </div>
          )}

          {/* TAB 3: XML SERVICE */}
          {activeTab === 'xml' && (
            <div style={{ background: '#ffffff', padding: '32px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', textAlign: 'center' }}>
              <h3 style={{ fontSize: '22px', marginTop: 0, marginBottom: '8px' }}>Interkomunikasi Format XML</h3>
              <p style={{ color: '#6b7280', marginBottom: '24px' }}>Mentransformasikan data SQL relasional menjadi skema dokumen markup XML sesuai requirement.</p>
              <button onClick={handleFetchXML} style={{ padding: '12px 24px', backgroundColor: '#059669', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>Generate Dokumen XML</button>

              {xmlData && (
                <div style={{ marginTop: '32px', textAlign: 'left' }}>
                  <h4 style={{ marginBottom: '12px', textAlign: 'center' }}>Output XML Document Stream:</h4>
                  <pre style={{ backgroundColor: '#1f2937', color: '#10b981', padding: '20px', borderRadius: '8px', overflowX: 'auto', fontSize: '14px', fontFamily: 'Consolas, monospace' }}>
                    {xmlData}
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: LAYANAN KAMPUS (BEASISWA) */}
          {activeTab === 'beasiswa' && (
            <div style={{ background: '#ffffff', padding: '32px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', textAlign: 'center' }}>
              <h3 style={{ fontSize: '22px', marginTop: 0, marginBottom: '8px' }}>Layanan Terintegrasi: Beasiswa Internal</h3>
              <p style={{ color: '#6b7280', marginBottom: '24px' }}>Data di bawah ini ditarik secara dinamis dari sub-domain `campus-service` melalui API Gateway.</p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center', width: '100%' }}>
                {beasiswaList.length > 0 ? (
                  beasiswaList.map((b, index) => (
                    <div key={index} style={{ padding: '20px', border: '1px solid #e5e7eb', borderRadius: '8px', backgroundColor: '#f9fafb', width: '100%', maxWidth: '500px', textAlign: 'left' }}>
                      <h4 style={{ margin: '0 0 8px 0', color: '#1e3a8a' }}>{b.nama_beasiswa}</h4>
                      <p style={{ fontSize: '14px', color: '#4b5563', marginBottom: '12px' }}>{b.deskripsi}</p>
                      <p style={{ fontSize: '13px', margin: 0 }}>
                        <strong>Status Pendaftaran:</strong> <span style={{ padding: '4px 8px', borderRadius: '4px', backgroundColor: '#dbeafe', color: '#1e40af', fontWeight: 'bold' }}>{b.status_seleksi}</span>
                      </p>
                    </div>
                  ))
                ) : (
                  <p style={{ color: '#9ca3af' }}>Tidak ada data beasiswa aktif untuk NIM ini.</p>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default App;