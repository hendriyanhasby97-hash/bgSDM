import streamlit as st
from app import supabase
import pandas as pd
import plotly.express as px

# Proteksi Halaman
if not st.session_state.get('is_logged_in', False):
    st.warning("Silakan login terlebih dahulu di halaman utama.")
    st.stop()

st.title("📈 Dashboard Eksekutif HRIS")
st.write("Ringkasan Data Sumber Daya Manusia RSUD Drs. H. AMRI TAMBUNAN")

# Fungsi untuk menarik data khusus keperluan dashboard
@st.cache_data(ttl=60) # Cache 1 menit agar dashboard dimuat lebih cepat
def load_dashboard_data():
    try:
        # Mengambil kolom yang diperlukan untuk statistik
        res = supabase.table("master_pegawai").select("id_pegawai, status, kelompok_pegawai, jenis_kelamin").execute()
        if res.data:
            return pd.DataFrame(res.data)
        return pd.DataFrame()
    except Exception as e:
        st.error(f"Gagal memuat data: {e}")
        return pd.DataFrame()

df = load_dashboard_data()

# --- TAMPILAN DASHBOARD ---
if df.empty:
    st.info("Belum ada data pegawai untuk ditampilkan di dashboard. Silakan tambah data di menu Manajemen Data Pegawai.")
else:
    # 1. Menghitung Metrik Utama (KPI)
    total_pegawai = len(df)
    total_aktif = len(df[df['status'] == 'Aktif'])
    total_pensiun = len(df[df['status'] == 'Pensiun'])
    total_asn = len(df[df['kelompok_pegawai'] == 'ASN'])

    # Menampilkan Card Metrik
    col1, col2, col3, col4 = st.columns(4)
    col1.metric("Total Terdaftar", total_pegawai)
    col2.metric("Pegawai Aktif", total_aktif)
    col3.metric("Pensiun", total_pensiun)
    col4.metric("Total ASN", total_asn)

    st.markdown("---")

    # 2. Visualisasi Grafik (Baris Pertama)
    col_chart1, col_chart2 = st.columns(2)

    with col_chart1:
        st.subheader("Distribusi Status Pegawai")
        status_counts = df['status'].value_counts().reset_index()
        status_counts.columns = ['Status', 'Jumlah']
        
        # Grafik Donut
        fig_status = px.pie(status_counts, values='Jumlah', names='Status', hole=0.4, 
                            color_discrete_sequence=px.colors.qualitative.Pastel)
        fig_status.update_layout(margin=dict(t=0, b=0, l=0, r=0))
        st.plotly_chart(fig_status, use_container_width=True)

    with col_chart2:
        st.subheader("Berdasarkan Kelompok")
        kelompok_counts = df['kelompok_pegawai'].value_counts().reset_index()
        kelompok_counts.columns = ['Kelompok', 'Jumlah']
        
        # Grafik Batang
        fig_kelompok = px.bar(kelompok_counts, x='Kelompok', y='Jumlah', color='Kelompok', text_auto=True,
                              color_discrete_sequence=px.colors.qualitative.Set2)
        fig_kelompok.update_layout(showlegend=False, margin=dict(t=0, b=0, l=0, r=0))
        st.plotly_chart(fig_kelompok, use_container_width=True)
        
    st.markdown("---")
    
    # 3. Visualisasi Grafik (Baris Kedua)
    st.subheader("Proporsi Jenis Kelamin")
    # Konversi L/P menjadi Laki-laki/Perempuan agar lebih mudah dibaca
    df['jenis_kelamin_label'] = df['jenis_kelamin'].map({'L': 'Laki-laki', 'P': 'Perempuan'})
    jk_counts = df['jenis_kelamin_label'].value_counts().reset_index()
    jk_counts.columns = ['Jenis Kelamin', 'Jumlah']
    
    # Grafik Pie
    fig_jk = px.pie(jk_counts, values='Jumlah', names='Jenis Kelamin', color='Jenis Kelamin', 
                    color_discrete_map={'Laki-laki':'#3b82f6', 'Perempuan':'#ec4899'})
    fig_jk.update_layout(margin=dict(t=0, b=0, l=0, r=0))
    st.plotly_chart(fig_jk, use_container_width=True)

st.caption("Data diperbarui secara *real-time* dari *database* HRIS.")
