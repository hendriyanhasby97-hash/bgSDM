document.addEventListener('DOMContentLoaded', () => {
    // 1. TMT CPNS (Dari NIP angka ke 9, 4 angka pertama tahun, 2 angka berikutnya bulan, tgl 1)
    const elNip = document.getElementById('nip');
    const elTmtCpns = document.getElementById('tmt_cpns');

    elNip?.addEventListener('input', (e) => {
        let nipVal = e.target.value.replace(/\s+/g, ''); // Hapus spasi jika ada
        if(nipVal.length >= 14) {
            let tahun = nipVal.substring(8, 12);
            let bulan = nipVal.substring(12, 14);
            elTmtCpns.value = `${tahun}-${bulan}-01`;
        } else {
            elTmtCpns.value = '';
        }
    });

    // 2. TMT Pensiun (Tgl Lahir + Rentang BUP = Tanggal 1 Bulan Berikutnya)
    const elTglLahir = document.getElementById('tanggal_lahir');
    const elBup = document.getElementById('rentang_bup');
    const elTmtPensiun = document.getElementById('tmt_pensiun');

    function hitungTmtPensiun() {
        if(elTglLahir.value && elBup.value) {
            let date = new Date(elTglLahir.value);
            date.setFullYear(date.getFullYear() + parseInt(elBup.value));
            // Tambah 1 bulan, dan set ke tanggal 1
            date.setMonth(date.getMonth() + 1);
            date.setDate(1);
            elTmtPensiun.value = date.toISOString().split('T')[0];
        }
    }
    elTglLahir?.addEventListener('change', hitungTmtPensiun);
    elBup?.addEventListener('input', hitungTmtPensiun);

    // 3. Masa Kerja RS (Format: ## Tahun ## Bulan ## Hari)
    const elMasukRs = document.getElementById('masuk_rs');
    const elMasaKerja = document.getElementById('masa_kerja_rs');

    elMasukRs?.addEventListener('change', () => {
        if(!elMasukRs.value) return;
        let start = new Date(elMasukRs.value);
        let end = new Date(); // Hari ini

        let years = end.getFullYear() - start.getFullYear();
        let months = end.getMonth() - start.getMonth();
        let days = end.getDate() - start.getDate();

        if (days < 0) {
            months--;
            let prevMonth = new Date(end.getFullYear(), end.getMonth(), 0);
            days += prevMonth.getDate();
        }
        if (months < 0) {
            years--;
            months += 12;
        }
        elMasaKerja.value = `${years} Tahun ${months} Bulan ${days} Hari`;
    });

    // 4. Logika Jumlah Anak (Show/Hide fields)
    const elJumlahAnak = document.getElementById('jumlah_anak');
    elJumlahAnak?.addEventListener('change', (e) => {
        let val = parseInt(e.target.value);
        document.getElementById('div_anak1').style.display = val >= 1 ? 'block' : 'none';
        document.getElementById('div_anak2').style.display = val >= 2 ? 'block' : 'none';
        document.getElementById('div_anak3').style.display = val >= 3 ? 'block' : 'none';
    });
});
