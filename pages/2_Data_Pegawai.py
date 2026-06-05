import streamlit as st
from app import supabase
import pandas as pd

# Proteksi Halaman: Pastikan sudah login
if not st.session_state.get('is_logged_in', False):
    st.warning("Silakan login terlebih dahulu di halaman utama.")
    st.stop()

st.title("📂 Manajemen Data Master Pegawai")
st.write("RSUD Drs. H. AMRI TAMBUNAN")

# Fungsi pembantu untuk mengambil data referensi untuk dropdown
@st.cache_data(ttl=60)  # Cache selama 1 menit agar tidak terlalu sering memukul database
def fetch_reference_data(table_name):
    try:
        res = supabase.table(table_name).select("id, nama").order("nama").execute()
        return res.data if res.data else []
    except Exception as e:
        return []

# Fetch semua data referensi untuk pilihan dropdown
ref_kelompok_jabatan = fetch_reference_data("ref_kelompok_jabatan")
ref_golongan = fetch_reference_data("ref_golongan")
ref_jabatan = fetch_reference_data("ref_jabatan")
ref_agama = fetch_reference_data("ref_agama")
ref_jenjang = fetch_reference_data("ref_jenjang_pendidikan")
ref_fakultas = fetch_reference_data("ref_fakultas")
ref_jurusan = fetch_reference_data("ref_jurusan")
ref_ruangan = fetch_reference_data("ref_ruangan")
ref_role = fetch_reference_data("ref_role")

# Membuat format dict {nama: id} untuk mempermudah penyimpanan ke database
dict_kel_jabatan = {item['nama']: item['id'] for item in ref_kelompok_jabatan}
dict_golongan = {item['nama']: item['id'] for item in ref_golongan}
dict_jabatan = {item['nama']: item['id'] for item in ref_jabatan}
dict_agama = {item['nama']: item['id'] for item in ref_agama}
dict_jenjang = {item['nama']: item['id'] for item in ref_jenjang}
dict_fakultas = {item['nama']: item['id'] for item in ref_fakultas}
dict_jurusan = {item['nama']: item['id'] for item in ref_jurusan}
dict_ruangan = {item['nama']: item['id'] for item in ref_ruangan}
dict_role = {item['nama']: item['id'] for item in ref_role}

# Membuat Tabs: Tampilan Data dan Input Data
tab1, tab2 = st.tabs(["📊 Daftar Data Pegawai", "➕ Tambah Pegawai Baru"])

# ==========================================
# TAB 1: DAFTAR DATA PEGAWAI (READ)
# ==========================================
with tab1:
    st.subheader("Data Pegawai Aktif & Real-time")
    
    try:
        # Mengambil data dari view PostgreSQL agar masa_kerja_rs terhitung dinamis setiap hari
        query_res = supabase.table("v_master_pegawai_aktif").select(
            "nik, nama, nip, status, kelompok_pegawai, masuk_rs, masa_kerja_rs_realtime, tmt_cpns, tmt_pennes=tmt_pensiun"
        ).execute()
        
        if query_res.data:
            df = pd.DataFrame(query_res.data)
            # Opsional: Rename kolom agar lebih rapi di tabel aplikasi
            df.columns = ["NIK", "Nama Pegawai", "NIP", "Status", "Kelompok", "Masuk RS", "Masa Kerja RS", "TMT CPNS", "TMT Pensiun"]
            st.dataframe(df, use_container_width=True, hide_index=True)
        else:
            st.info("Belum ada data pegawai yang terdaftar.")
    except Exception as e:
        st.error(f"Gagal memuat data dari database: {e}")

# ==========================================
# TAB 2: FORM INPUT PEGAWAI BARU (CREATE)
# ==========================================
with tab2:
    st.subheader("Formulir Entri Data Master Pegawai")
    
    with st.form("form_pegawai", clear_on_submit=False):
        
        # --- SEKSI 1: IDENTITAS UTAMA ---
        st.markdown("#### 1. Identitas Utama")
        c1, c2, c3 = st.columns(3)
        with c1:
            nama = st.text_input("Nama Lengkap (Tanpa Gelar)")
            nik = st.text_input("NIK (16 Digit)", max_chars=16)
            nip = st.text_input("NIP (18 Digit - Opsional)", max_chars=18)
        with c2:
            status = st.selectbox("Status Pegawai", ["Aktif", "Mutasi", "Pensiun", "Resign", "lainnya"])
            kelompok_pegawai = st.selectbox("Kelompok Pegawai", ["ASN", "Konsultan", "APBD", "BLUD", "Magang"])
            jenis_kelamin = st.radio("Jenis Kelamin", ["L", "P"], horizontal=True)
        with c3:
            tempat_lahir = st.text_input("Tempat Lahir")
            tanggal_lahir = st.date_input("Tanggal Lahir", value=pd.to_datetime("1990-01-01"))
            pilihan_agama = st.selectbox("Agama", list(dict_agama.keys()))

        st.markdown("---")
        
        # --- SEKSI 2: DATA KEPEGAWAIAN ---
        st.markdown("#### 2. Atribut Kepegawaian & Jabatan")
        c4, c5, c6 = st.columns(3)
        with c4:
            pilihan_kel_jabatan = st.selectbox("Kelompok Jabatan", list(dict_kel_jabatan.keys()))
            pilihan_jabatan = st.selectbox("Jabatan", list(dict_jabatan.keys()))
            pilihan_gol = st.selectbox("Golongan", list(dict_golongan.keys()))
        with c5:
            pilihan_ruangan = st.selectbox("Ruangan / Unit Kerja", list(dict_ruangan.keys()))
            masuk_rs = st.date_input("Tanggal Masuk RS")
            tmt_pangkat = st.date_input("TMT Pangkat")
        with c6:
            rentang_bup = st.number_input("Rentang BUP (Batas Usia Pensiun)", min_value=50, max_value=70, value=58)
            st.info("💡 **TMT CPNS** & **TMT Pensiun** akan dihitung secara otomatis oleh sistem database setelah data disimpan.")

        st.markdown("---")
        
        # --- SEKSI 3: PENDIDIKAN ---
        st.markdown("#### 3. Riwayat Pendidikan Tertinggi")
        c7, c8, c9 = st.columns(3)
        with c7:
            pilihan_jenjang = st.selectbox("Jenjang Pendidikan", list(dict_jenjang.keys()))
        with c8:
            pilihan_fakultas = st.selectbox("Fakultas", list(dict_fakultas.keys()))
        with c9:
            pilihan_jurusan = st.selectbox("Jurusan", list(dict_jurusan.keys()))

        st.markdown("---")
        
        # --- SEKSI 4: KELUARGA (LOGIKA DINAMIS) ---
        st.markdown("#### 4. Data Keluarga")
        c10, c11 = st.columns(2)
        with c10:
            status_keluarga = st.selectbox("Status Pernikahan", ["Belum Kawin", "Kawin", "Cerai Hidup", "Cerai Mati"])
            
            # Munculkan nama pasangan jika statusnya bukan 'Belum Kawin'
            nama_pasangan = None
            if status_keluarga != "Belum Kawin":
                nama_pasangan = st.text_input("Nama Suami / Istri")
                
        with c11:
            jumlah_anak = st.number_input("Jumlah Anak", min_value=0, max_value=3, value=0)
            
            # Logika Dinamis Form Input Nama Anak sesuai jumlah_anak
            anak1 = st.text_input("Nama Anak ke-1") if jumlah_anak >= 1 else None
            anak2 = st.text_input("Nama Anak ke-2") if jumlah_anak >= 2 else None
            anak3 = st.text_input("Nama Anak ke-3") if jumlah_anak == 3 else None

        st.markdown("---")
        
        # --- SEKSI 5: DOKUMEN & KONTAK ---
        st.markdown("#### 5. Kontak & Nomor Legalitas")
        c12, c13 = st.columns(2)
        with c12:
            no_bpjsn = st.text_input("No. BPJS Kesehatan")
            no_bpjsket_taspen = st.text_input("No. BPJS Ketenagakerjaan / Taspen")
            npwp = st.text_input("NPWP")
            alamat = st.text_area("Alamat Lengkap Rumah")
        with c13:
            no_telp = st.text_input("No. Telepon / HP Aktif")
            email = st.text_input("Email Resmi Pegawai")
            password = st.text_input("Kata Sandi Akun Pegawai", type="password", help="Digunakan pegawai untuk login HRIS")
            pilihan_role = st.selectbox("Hak Akses Sistem (Role)", list(dict_role.keys()))

        # Button Submit Form
        st.markdown("<br>", unsafe_allow_html=True)
        submit_button = st.form_submit_button("Simpan Data Pegawai Ke Database")
        
        if submit_button:
            # Validasi input krusial
            if not nik or not nama or not email or not password:
                st.error("Gagal Menyimpan! Kolom NIK, Nama, Email, dan Kata Sandi wajib diisi.")
            else:
                # Siapkan payload data dengan mencocokkan ID dari kamus tabel referensi
                payload = {
                    "nik": nik,
                    "nama": nama,
                    "nip": nip if nip.strip() != "" else None,
                    "status": status,
                    "kelompok_pegawai": kelompok_pegawai,
                    "id_kelompok_jabatan": dict_kel_jabatan.get(pilihan_kel_jabatan),
                    "id_gol": dict_golongan.get(pilihan_gol),
                    "tmt_pangkat": str(tmt_pangkat),
                    "id_jabatan": dict_jabatan.get(pilihan_jabatan),
                    "jenis_kelamin": jenis_kelamin,
                    "id_agama": dict_agama.get(pilihan_agama),
                    "rentang_bup": int(rentang_bup),
                    "masuk_rs": str(masuk_rs),
                    "tempat_lahir": tempat_lahir,
                    "tanggal_lahir": str(tanggal_lahir),
                    "status_keluarga": status_keluarga,
                    "nama_pasangan": nama_pasangan,
                    "jumlah_anak": int(jumlah_anak),
                    "anak1": anak1,
                    "anak2": anak2,
                    "anak3": anak3,
                    "alamat": alamat,
                    "id_jenjang": dict_jenjang.get(pilihan_jenjang),
                    "id_fakultas": dict_fakultas.get(pilihan_fakultas),
                    "id_jurusan": dict_jurusan.get(pilihan_jurusan),
                    "id_ruangan": dict_ruangan.get(pilihan_ruangan),
                    "no_bpjsn": no_bpjsn,
                    "no_bpjsket_taspen": no_bpjsket_taspen,
                    "npwp": npwp,
                    "email": email,
                    "no_telp": no_telp,
                    "password": password, # Password disimpan langsung (bisa dikembangkan dengan hashing bcrypt di backend)
                    "id_role": dict_role.get(pilihan_role)
                }
                
                try:
                    # Eksekusi insert data ke tabel master_pegawai Supabase
                    supabase.table("master_pegawai").insert(payload).execute()
                    st.success(f"Berhasil! Data pegawai atas nama {nama} telah tersimpan dan terhitung otomatis.")
                    st.balloons()
                except Exception as e:
                    st.error(f"Gagal menyimpan data ke Supabase: {e}")
