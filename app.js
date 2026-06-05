// ==========================================
// 1. KONFIGURASI SUPABASE
// ==========================================
// Ganti nilai ini dengan URL dan Anon Key dari Project Supabase kamu
const SUPABASE_URL = 'https://rjdymyzeujfxzqwwhxbb.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_t5vG-vnon8s6CM0RejWbIg_g5EGKvwp'; 
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ==========================================
// 2. SISTEM NOTIFIKASI (TOAST)
// ==========================================
function showToast(message, type = 'success') {
    // Hapus toast lama jika ada
    const oldToast = document.getElementById('toast-notification');
    if (oldToast) oldToast.remove();

    const toast = document.createElement('div');
    toast.id = 'toast-notification';
    
    // Warna berdasarkan tipe
    const bgColor = type === 'success' ? 'bg-green-600' : 'bg-red-600';
    const icon = type === 'success' 
        ? `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>`
        : `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>`;

    toast.className = `fixed bottom-5 right-5 flex items-center p-4 mb-4 text-white rounded-lg shadow-xl transition-all duration-300 transform translate-y-10 opacity-0 ${bgColor} z-50`;
    toast.innerHTML = `
        <div class="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 rounded-lg">
            ${icon}
        </div>
        <div class="ml-3 text-sm font-medium">${message}</div>
    `;

    document.body.appendChild(toast);

    // Animasi masuk
    setTimeout(() => {
        toast.classList.remove('translate-y-10', 'opacity-0');
    }, 10);

    // Hilang otomatis setelah 3 detik
    setTimeout(() => {
        toast.classList.add('translate-y-10', 'opacity-0');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ==========================================
// 3. INISIALISASI HALAMAN (ROUTING SEDERHANA)
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    
    // Cek apakah user berada di halaman Login
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        initLoginProcess(loginForm);
    }

    // Cek apakah user berada di halaman Dashboard
    const formPegawai = document.getElementById('formPegawai');
    if (formPegawai) {
        initDashboardLogic(formPegawai);
        loadDropdownPengaturan();
    }
});

// ==========================================
// 4. LOGIKA LOGIN
// ==========================================
function initLoginProcess(form) {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const btnSubmit = form.querySelector('button[type="submit"]');

        btnSubmit.innerHTML = 'Memproses...';
        btnSubmit.disabled = true;

        try {
            // Asumsi menggunakan Supabase Auth
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email,
                password: password,
            });

            if (error) throw error;

            showToast('Login berhasil! Mengalihkan...', 'success');
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1500);

        } catch (error) {
            showToast(error.message || 'Gagal login. Periksa email & password.', 'error');
            btnSubmit.innerHTML = 'Masuk ke Sistem';
            btnSubmit.disabled = false;
        }
    });
}

// ==========================================
// 5. LOGIKA DASHBOARD & FORM PEGAWAI
// ==========================================
function initDashboardLogic(form) {
    
    // --- A. AUTO-CALCULATE TMT CPNS ---
    const nipInput = document.getElementById('nip');
    const tmtCpnsInput = document.getElementById('tmt_cpns');
    if (nipInput && tmtCpnsInput) {
        nipInput.addEventListener('input', (e) => {
            let cleanNip = e.target.value.replace(/[^0-9]/g, '');
            if (cleanNip.length >= 14) {
                let tahun = cleanNip.substring(8, 12);
                let bulan = cleanNip.substring(12, 14);
                tmtCpnsInput.value = `${tahun}-${bulan}-01`;
            } else {
                tmtCpnsInput.value = '';
            }
        });
    }

    // --- B. AUTO-CALCULATE TMT PENSIUN ---
    const tglLahirInput = document.getElementById('tanggal_lahir');
    const bupInput = document.getElementById('rentang_bup');
    const tmtPensiunInput = document.getElementById('tmt_pensiun');
    
    const calculatePensiun = () => {
        if(tglLahirInput.value && bupInput.value) {
            let date = new Date(tglLahirInput.value);
            date.setFullYear(date.getFullYear() + parseInt(bupInput.value));
            date.setMonth(date.getMonth() + 1); // Bulan depan
            date.setDate(1); // Set ke tanggal 1
            tmtPensiunInput.value = date.toISOString().split('T')[0];
        }
    };
    if (tglLahirInput) tglLahirInput.addEventListener('change', calculatePensiun);
    if (bupInput) bupInput.addEventListener('input', calculatePensiun);

    // --- C. AUTO-CALCULATE MASA KERJA RS ---
    const masukRsInput = document.getElementById('masuk_rs');
    const masaKerjaInput = document.getElementById('masa_kerja_rs');
    
    if (masukRsInput && masaKerjaInput) {
        masukRsInput.addEventListener('change', (e) => {
            if(!e.target.value) return;
            let awal = new Date(e.target.value);
            let sekarang = new Date(); // Hari ini
            
            let years = sekarang.getFullYear() - awal.getFullYear();
            let months = sekarang.getMonth() - awal.getMonth();
            let days = sekarang.getDate() - awal.getDate();

            if (days < 0) {
                months--;
                let prevMonth = new Date(sekarang.getFullYear(), sekarang.getMonth(), 0);
                days += prevMonth.getDate();
            }
            if (months < 0) {
                years--;
                months += 12;
            }
            masaKerjaInput.value = `${years} Tahun ${months} Bulan ${days} Hari`;
        });
    }

    // --- D. LOGIKA DROPDOWN ANAK DINAMIS ---
    const jmlAnakInput = document.getElementById('jumlah_anak');
    if (jmlAnakInput) {
        jmlAnakInput.addEventListener('change', (e) => {
            let jml = parseInt(e.target.value);
            document.getElementById('div_anak1').classList.toggle('hidden', jml < 1);
            document.getElementById('div_anak2').classList.toggle('hidden', jml < 2);
            document.getElementById('div_anak3').classList.toggle('hidden', jml < 3);
            
            // Clear input jika di-hide
            if(jml < 3) document.getElementById('anak3').value = '';
            if(jml < 2) document.getElementById('anak2').value = '';
            if(jml < 1) document.getElementById('anak1').value = '';
        });
    }

    // --- E. SUBMIT FORM KE SUPABASE ---
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btnSubmit = form.querySelector('button[type="submit"]');
        btnSubmit.innerHTML = 'Menyimpan...';
        btnSubmit.disabled = true;

        // Kumpulkan data dari form
        const payload = {
            nama: document.getElementById('nama').value,
            nik: document.getElementById('nik').value,
            nip: document.getElementById('nip').value,
            status: document.getElementById('status').value,
            kelompok_pegawai: document.getElementById('kelompok_pegawai').value,
            role: document.getElementById('role').value,
            
            // Waktu
            tmt_cpns: document.getElementById('tmt_cpns').value || null,
            masuk_rs: document.getElementById('masuk_rs').value || null,
            masa_kerja_rs: document.getElementById('masa_kerja_rs').value,
            rentang_bup: document.getElementById('rentang_bup').value || null,
            tmt_pensiun: document.getElementById('tmt_pensiun').value || null,

            // Pribadi
            tempat_lahir: document.getElementById('tempat_lahir').value,
            tanggal_lahir: document.getElementById('tanggal_lahir').value || null,
            jenis_kelamin: document.getElementById('jenis_kelamin').value,
            status_keluarga: document.getElementById('status_keluarga').value,
            nama_pasangan: document.getElementById('nama_pasangan').value,
            jumlah_anak: document.getElementById('jumlah_anak').value,
            anak1: document.getElementById('anak1').value,
            anak2: document.getElementById('anak2').value,
            anak3: document.getElementById('anak3').value,
        };

        try {
            const { data, error } = await supabase
                .from('master_pegawai')
                .insert([payload]);

            if (error) throw error;

            showToast('Data Pegawai berhasil disimpan!', 'success');
            form.reset(); // Kosongkan form setelah sukses
            
            // Sembunyikan kembali field anak
            document.getElementById('div_anak1').classList.add('hidden');
            document.getElementById('div_anak2').classList.add('hidden');
            document.getElementById('div_anak3').classList.add('hidden');

        } catch (error) {
            console.error('Error Save:', error);
            showToast('Gagal menyimpan data: ' + error.message, 'error');
        } finally {
            btnSubmit.innerHTML = 'Simpan Data Pegawai';
            btnSubmit.disabled = false;
        }
    });
}

// ==========================================
// 6. LOAD DROPDOWN DARI PENGATURAN (CONTOH)
// ==========================================
async function loadDropdownPengaturan() {
    // Ini adalah contoh jika kamu punya tabel 'pengaturan' di Supabase
    // yang berisi { kategori: 'role', nilai: 'Admin' }
    
    /* try {
        const { data, error } = await supabase.from('pengaturan').select('*');
        if (error) throw error;
        
        const roleSelect = document.getElementById('role');
        // Filter data untuk kategori role
        const roles = data.filter(item => item.kategori === 'role');
        
        let options = '<option value="">-- Pilih Role --</option>';
        roles.forEach(r => {
            options += `<option value="${r.nilai}">${r.nilai}</option>`;
        });
        roleSelect.innerHTML = options;
        
    } catch (error) {
        console.error('Gagal memuat pengaturan:', error);
    }
    */
   
   // Mockup sementara agar form terlihat utuh:
   const roleSelect = document.getElementById('role');
   if(roleSelect) {
       roleSelect.innerHTML = `
        <option value="">-- Pilih Role --</option>
        <option value="Admin">Admin HRD</option>
        <option value="Direksi">Direksi</option>
        <option value="Pegawai">Pegawai</option>
       `;
   }
}
