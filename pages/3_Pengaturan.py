import streamlit as st
from app import supabase
import pandas as pd

if not st.session_state.get('is_logged_in', False):
    st.warning("Silakan login terlebih dahulu di halaman utama.")
    st.stop()

st.title("⚙️ Pengaturan Master Data")
st.write("Kelola opsi dropdown untuk form kepegawaian di sini.")

# Pilih tabel referensi yang ingin diedit
kategori_dict = {
    "Kelompok Jabatan": "ref_kelompok_jabatan",
    "Golongan": "ref_golongan",
    "Jabatan": "ref_jabatan",
    "Agama": "ref_agama",
    "Jenjang Pendidikan": "ref_jenjang_pendidikan",
    "Fakultas": "ref_fakultas",
    "Jurusan": "ref_jurusan",
    "Ruangan": "ref_ruangan",
    "Role": "ref_role"
}

pilihan_kategori = st.selectbox("Pilih Kategori Data yang ingin dikelola:", list(kategori_dict.keys()))
tabel_terpilih = kategori_dict[pilihan_kategori]

st.markdown("---")

col1, col2 = st.columns([1, 1])

# --- BAGIAN BACA DATA ---
with col1:
    st.subheader(f"Daftar {pilihan_kategori}")
    try:
        response = supabase.table(tabel_terpilih).select("*").execute()
        if response.data:
            df = pd.DataFrame(response.data)
            st.dataframe(df, use_container_width=True, hide_index=True)
        else:
            st.info("Data masih kosong.")
    except Exception as e:
        st.error(f"Gagal mengambil data: {e}")

# --- BAGIAN TAMBAH DATA ---
with col2:
    st.subheader(f"Tambah {pilihan_kategori}")
    with st.form("form_tambah_referensi"):
        nama_baru = st.text_input(f"Nama {pilihan_kategori} Baru")
        submit_btn = st.form_submit_button("Simpan")
        
        if submit_btn:
            if nama_baru.strip() == "":
                st.warning("Nama tidak boleh kosong!")
            else:
                try:
                    # Insert data ke tabel Supabase yang dipilih
                    supabase.table(tabel_terpilih).insert({"nama": nama_baru}).execute()
                    st.success(f"{nama_baru} berhasil ditambahkan ke {pilihan_kategori}!")
                    st.rerun() # Refresh halaman agar tabel data di sebelah kiri langsung update
                except Exception as e:
                    st.error(f"Gagal menyimpan data (mungkin duplikat): {e}")
