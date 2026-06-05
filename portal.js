document.addEventListener('DOMContentLoaded', () => {
    
    // Fungsi Load Data ke Tabel
    async function loadPegawai() {
        const { data, error } = await supabase
            .from('master_pegawai')
            .select('nip, nama, masa_kerja_rs, tmt_pensiun')
            .order('nama', { ascending: true });

        if (error) {
            console.error("Gagal menarik data:", error);
            return;
        }

        const tbody = document.querySelector('#tabelPegawai tbody');
        tbody.innerHTML = '';
        
        data.forEach(p => {
            let tr = `<tr>
                <td>${p.nip || '-'}</td>
                <td>${p.nama || '-'}</td>
                <td>${p.masa_kerja_rs || '-'}</td>
                <td>${p.tmt_pensiun || '-'}</td>
            </tr>`;
            tbody.innerHTML += tr;
        });
    }

    // Fungsi Simpan Data
    const btnSimpan = document.getElementById('btnSimpan');
    btnSimpan?.addEventListener('click', async () => {
        // Mengumpulkan value dari form
        const payload = {
            nip: document.getElementById('nip').value,
            tmt_cpns: document.getElementById('tmt_cpns').value,
            tanggal_lahir: document.getElementById('tanggal_lahir').value,
            rentang_bup: document.getElementById('rentang_bup').value,
            tmt_pensiun: document.getElementById('tmt_pensiun').value,
            masuk_rs: document.getElementById('masuk_rs').value,
            masa_kerja_rs: document.getElementById('masa_kerja_rs').value,
            jumlah_anak: document.getElementById('jumlah_anak').value,
            anak1: document.getElementById('anak1').value,
            anak2: document.getElementById('anak2').value,
            anak3: document.getElementById('anak3').value
            // Tambahkan mapping untuk id input HTML lain yang kamu buat ke kolom Supabase
        };

        const { error } = await supabase
            .from('master_pegawai')
            .insert([payload]);

        if (error) {
            alert('Gagal menyimpan: ' + error.message);
        } else {
            alert('Data Pegawai berhasil disimpan!');
            document.getElementById('formPegawai').reset();
            // Sembunyikan field anak kembali
            document.getElementById('jumlah_anak').dispatchEvent(new Event('change'));
            loadPegawai();
        }
    });

    // Load data saat halaman dibuka
    loadPegawai();
});
