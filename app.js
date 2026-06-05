document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    
    if(loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const nik = document.getElementById('nikInput').value;
            const pass = document.getElementById('passwordInput').value;

            // Logika login sederhana mencocokkan field password di tabel
            // Direkomendasikan migrasi ke Supabase Auth di fase produksi
            const { data, error } = await supabase
                .from('master_pegawai')
                .select('*')
                .eq('nik', nik)
                .eq('password', pass)
                .single();

            if (error || !data) {
                alert("Login gagal. Periksa kembali NIK dan Password.");
            } else {
                alert(`Selamat datang, ${data.nama}!`);
                window.location.href = 'portal.html';
            }
        });
    }
});
