<?php
// Suppress warnings and errors in output to ensure clean JSON responses
ini_set('display_errors', 0);
ini_set('display_startup_errors', 0);
error_reporting(0);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

require_once 'config.php';

// Auto-migrate / Self-healing database check for law_insights
try {
    $tableCheck = $conn->query("SHOW TABLES LIKE 'law_insights'");
    $tableExists = $tableCheck->rowCount() > 0;
    
    $needsImport = !$tableExists;
    if ($tableExists) {
        $countCheck = $conn->query("SELECT COUNT(*) FROM law_insights");
        $rowCount = $countCheck->fetchColumn();
        if ($rowCount == 0) {
            $needsImport = true;
        }
    }
    
    if ($needsImport) {
        // 1. Create table
        $sql = "CREATE TABLE IF NOT EXISTS law_insights (
            id INT AUTO_INCREMENT PRIMARY KEY,
            author_id INT NOT NULL,
            title VARCHAR(255) NOT NULL,
            summary VARCHAR(500) NOT NULL,
            content TEXT NOT NULL,
            image_url VARCHAR(255) NOT NULL,
            published_date DATE NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
            FULLTEXT(title, summary, content)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;";
        $conn->exec($sql);
        
        // 2. Clear table
        $conn->exec("TRUNCATE TABLE law_insights;");
        
        // 3. Define 20 Indonesian Legal Insights
        $insights = [
            [
                "author_id" => 2, // Syntia (Lawyer)
                "title" => "UU ITE dan Kebebasan Berpendapat di Indonesia",
                "summary" => "Mengulas batas aman beropini secara digital di Indonesia sesuai revisi kedua Undang-Undang Informasi dan Transaksi Elektronik.",
                "content" => "Undang-Undang Informasi dan Transaksi Elektronik (UU ITE) terus mengalami perubahan guna menyeimbangkan perlindungan nama baik dengan hak kebebasan berpendapat masyarakat.\n\nDalam regulasi terbaru, rumusan pasal pencemaran nama baik (Pasal 27 ayat 3) diselaraskan dengan standar hukum perdata di mana delik aduan yang diajukan wajib dilakukan langsung oleh pihak korban secara pribadi. Hal ini mengeliminasi peluang kriminalisasi opini publik oleh pihak ketiga.\n\nTips untuk netizen Indonesia:\n1. Bedakan opini objektif atau kritik kebijakan dengan hinaan personal yang menyerang fisik atau martabat seseorang.\n2. Hindari membagikan tuduhan fakta tanpa bukti tertulis yang jelas.\n3. Laporkan konten kebencian suku, ras, atau antargolongan (SARA) melalui saluran hukum, bukan dengan melakukan doxxing massal di media sosial.",
                "image_url" => "https://images.unsplash.com/photo-1505664194779-8bebcb95ae84?auto=format&fit=crop&w=800&q=80",
                "published_date" => "2026-05-28"
            ],
            [
                "author_id" => 2, // Syntia (Lawyer)
                "title" => "Asas Praduga Tak Bersalah dalam Kasus Pidana",
                "summary" => "Memahami mengapa setiap tersangka wajib dianggap tidak bersalah hingga adanya vonis hakim yang berkekuatan hukum tetap (Inkracht).",
                "content" => "Asas praduga tak bersalah (Presumption of Innocence) adalah tiang utama penegakan keadilan dalam hukum acara pidana Indonesia (KUHAP).\n\nAsas ini memastikan bahwa aparat penegak hukum (Polisi, Jaksa, Hakim) memperlakukan setiap orang yang disangka melakukan tindak pidana sebagai subjek hukum yang memiliki hak asasi dasar, bukan objek yang langsung dihukum. Hak pendampingan hukum oleh advokat sejak pemeriksaan awal di Kepolisian adalah perwujudan konkret asas ini.\n\nTersangka berhak diam dan tidak memberikan jawaban yang menyudutkan dirinya sendiri (Privilege Against Self-Incrimination). Hakim berkewajiban memutus bebas (vrijspraak) jika alat bukti yang dihadirkan di persidangan tidak mencapai batas minimal pembuktian pidana, yaitu keyakinan hakim berlandaskan sekurang-kurangnya dua alat bukti yang sah.",
                "image_url" => "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80",
                "published_date" => "2026-05-25"
            ],
            [
                "author_id" => 2, // Syntia (Lawyer)
                "title" => "Prosedur Gugatan Cerai bagi Non-Muslim",
                "summary" => "Panduan langkah demi langkah mengajukan gugatan perceraian melalui peradilan umum di Pengadilan Negeri.",
                "content" => "Bagi pemeluk agama selain Islam, proses perceraian di Indonesia diatur dalam UU Perkawinan No. 1 Tahun 1974 dan tunduk pada yurisdiksi Pengadilan Negeri (bukan Pengadilan Agama).\n\nProsedur perceraian diawali dengan penyusunan surat gugatan cerai yang memuat identitas para pihak, posita (kronologi alasan hukum cerai), serta petitum (tuntutan seperti putusnya perkawinan dan hak asuh anak). Alasan perceraian harus memenuhi syarat sah undang-undang, seperti salah satu pihak berbuat zina, penjudi berat, melakukan KDRT, atau terjadi pertengkaran terus-menerus yang tidak mungkin didamaikan lagi.\n\nSidang pertama di Pengadilan Negeri wajib dihadiri kedua belah pihak untuk proses mediasi damai difasilitasi oleh hakim mediator. Jika mediasi gagal, persidangan berlanjut ke tahap jawaban tergugat, replik, duplik, pembuktian dokumen, saksi-saksi, hingga pembacaan putusan akhir.",
                "image_url" => "https://images.unsplash.com/photo-1505664194779-8bebcb95ae84?auto=format&fit=crop&w=800&q=80",
                "published_date" => "2026-05-20"
            ],
            [
                "author_id" => 2, // Syntia (Lawyer)
                "title" => "Pembagian Waris Menurut KUHPerdata",
                "summary" => "Memahami golongan ahli waris dan porsi pembagian warisan berdasarkan hukum perdata Barat di Indonesia.",
                "content" => "Hukum waris perdata Barat (KUHPerdata) berlaku bagi warga negara non-Muslim atau mereka yang menundukkan diri secara sukarela.\n\nDalam KUHPerdata, prinsip pembagian warisan didasarkan pada hubungan darah terdekat dengan pewaris. Terdapat empat golongan ahli waris yang berhak:\n- Golongan I: Suami/istri yang hidup terlama dan anak-anak pewaris beserta keturunannya.\n- Golongan II: Orang tua, saudara laki-laki/perempuan, dan keturunan saudaranya.\n- Golongan III: Kakek, nenek, atau leluhur dalam garis lurus ke atas.\n- Golongan IV: Paman, bibi, atau kerabat samping sampai derajat keenam.\n\nAdanya ahli waris Golongan I secara otomatis menutup hak waris Golongan II, III, dan IV. Bagian untuk masing-masing anggota dalam golongan yang sama disamaratakan tanpa membedakan gender anak.",
                "image_url" => "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=800&q=80",
                "published_date" => "2026-05-15"
            ],
            [
                "author_id" => 2, // Syntia (Lawyer)
                "title" => "Kontrak Bisnis Berbahasa Asing di Indonesia",
                "summary" => "Mengapa penggunaan Bahasa Indonesia wajib disertakan dalam setiap kontrak dagang dengan pihak asing sesuai UU No. 24 Tahun 2009.",
                "content" => "Banyak pengusaha lokal menandatangani perjanjian bisnis dengan mitra asing yang ditulis murni dalam Bahasa Inggris. Secara hukum di Indonesia, tindakan ini sangat berisiko.\n\nBerdasarkan Pasal 31 UU No. 24 Tahun 2009 tentang Bendera, Bahasa, dan Lambang Negara, setiap nota kesepahaman (MoU) atau perjanjian yang melibatkan lembaga negara, instansi swasta Indonesia, atau perorangan warga negara Indonesia wajib menggunakan Bahasa Indonesia.\n\nJika perjanjian melibatkan pihak asing, maka kontrak dibuat dalam format dwibahasa (bilingual) dengan kesepakatan versi bahasa mana yang akan berlaku utama (governing language) jika terjadi sengketa interpretasi. Kontrak yang murni menggunakan bahasa asing tanpa versi Bahasa Indonesia berisiko dinyatakan batal demi hukum (void ab initio) oleh pengadilan Indonesia.",
                "image_url" => "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80",
                "published_date" => "2026-05-10"
            ],
            [
                "author_id" => 2, // Syntia (Lawyer)
                "title" => "Perlindungan Hak Cipta Karya Musik Digital",
                "summary" => "Bagaimana pencipta lagu mempertahankan hak moral dan hak ekonomi di era layanan streaming musik digital.",
                "content" => "Perkembangan platform distribusi musik digital mempermudah musisi mempublikasikan karyanya, namun juga meningkatkan risiko pelanggaran hak cipta.\n\nUndang-Undang No. 28 Tahun 2014 tentang Hak Cipta menganut sistem deklaratif di mana hak cipta lahir secara otomatis sejak suatu ciptaan diwujudkan dalam bentuk nyata tanpa keharusan mendaftarkannya terlebih dahulu. Namun, pencatatan ciptaan resmi ke Direktorat Jenderal Kekayaan Intelektual (DJKI) tetap krusial sebagai alat bukti utama di pengadilan.\n\nHak cipta terbagi menjadi:\n1. Hak Moral: Hak melekat abadi pada pencipta agar namanya tetap dicantumkan pada karya.\n2. Hak Ekonomi: Hak mendapatkan royalti atas penggunaan, penggandaan, penyiaran, atau lisensi komersial ciptaan musik.\n\nPecipta berhak melarang pihak lain meng-cover lagu untuk monetisasi YouTube tanpa izin tertulis (Lisensi Sinkronisasi).",
                "image_url" => "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=800&q=80",
                "published_date" => "2026-05-05"
            ],
            [
                "author_id" => 2, // Syntia (Lawyer)
                "title" => "Perbedaan Wanprestasi dan Penipuan",
                "summary" => "Cara jitu mengidentifikasi sengketa kontrak murni (Perdata) dengan tindak kejahatan penipuan (Pidana).",
                "content" => "Batas antara wanprestasi perdata dengan penipuan pidana sangat tipis dan sering kali memicu kesalahan penanganan kasus.\n\nWanprestasi terjadi ketika terdapat hubungan kontrak yang sah di antara para pihak, namun salah satu pihak lalai, terlambat, atau tidak melaksanakan kewajibannya sebagaimana mestinya. Penyelesaian sengketa dilakukan melalui gugatan perdata di Pengadilan Negeri guna menuntut pemenuhan atau ganti rugi.\n\nSementara penipuan (Pasal 378 KUHP) terjadi jika sejak awal kesepakatan dibuat, pelaku memang telah berniat jahat (mens rea) untuk menipu dengan menggunakan tipu muslihat, nama palsu, atau rangkaian kebohongan demi menguntungkan diri sendiri. Jika perjanjian lahir akibat adanya tipu muslihat awal, maka perkara tersebut masuk ranah pidana di Kepolisian.",
                "image_url" => "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80",
                "published_date" => "2026-05-01"
            ],
            [
                "author_id" => 2, // Syntia (Lawyer)
                "title" => "Cara Mendaftarkan Merek Dagang bagi UMKM",
                "summary" => "Mengapa perlindungan merek dagang mutlak diperlukan sejak bisnis berdiri dan bagaimana prosedur hukum pendaftarannya.",
                "content" => "Banyak pelaku UMKM menunda perlindungan merek hingga bisnis mereka berkembang besar. Padahal, Indonesia menganut sistem 'First-to-File' di mana hak eksklusif merek diberikan kepada pihak yang pertama kali mengajukan permohonan pendaftaran secara resmi, bukan siapa yang pertama kali menggunakannya.\n\nLangkah-langkah mendaftarkan merek:\n1. Penelusuran Merek: Lakukan pengecekan di database DJKI untuk memastikan merek Anda belum terdaftar oleh pihak lain dalam kelas barang/jasa serupa.\n2. Pengajuan Permohonan: Daftarkan akun merek secara online di situs resmi DJKI dan isi data merek serta lampirkan label merek (logo) serta tanda tangan pemohon.\n3. Pemeriksaan Formalitas: Pemeriksaan administratif kelengkapan dokumen.\n4. Pengumuman: Merek dipublikasikan selama 2 bulan untuk melihat apakah ada keberatan dari pihak lain.\n5. Pemeriksaan Substantif: Tim pemeriksa mengkaji potensi kesamaan pada pokoknya dengan merek terdaftar.\n\nMerek yang disetujui akan mendapatkan sertifikat resmi dan perlindungan hukum selama 10 tahun.",
                "image_url" => "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80",
                "published_date" => "2026-04-28"
            ],
            [
                "author_id" => 5, // Fadlan (Lawyer)
                "title" => "Prosedur PKPU dan Kepailitan Perusahaan",
                "summary" => "Ulasan mendalam mengenai mekanisme restrukturisasi utang korporasi guna menghindari likuidasi aset secara sepihak.",
                "content" => "Penundaan Kewajiban Pembayaran Utang (PKPU) merupakan mekanisme hukum yang disediakan negara agar debitur yang kesulitan keuangan dapat mengajukan rencana perdamaian berupa restrukturisasi utang kepada para krediturnya di Pengadilan Niaga.\n\nTujuan PKPU adalah menghindari kepailitan. Selama proses PKPU berlangsung (maksimal 270 hari untuk PKPU Tetap), debitur diberikan perlindungan hukum berupa penangguhan segala tindakan eksekusi utang dari kreditur.\n\nJika dalam rapat kreditur rencana perdamaian disetujui secara kuorum dan disahkan oleh majelis hakim (Homologasi), maka perjanjian restrukturisasi mengikat secara hukum. Namun, jika rencana perdamaian ditolak atau batas waktu habis tanpa kesepakatan, Pengadilan Niaga seketika menyatakan debitur pailit, dan kurator ditunjuk untuk melikuidasi seluruh harta debitur guna dibagikan kepada kreditur.",
                "image_url" => "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=800&q=80",
                "published_date" => "2026-04-25"
            ],
            [
                "author_id" => 5, // Fadlan (Lawyer)
                "title" => "Hak Asasi Tersangka dalam Pemeriksaan Polisi",
                "summary" => "Hak-hak hukum yang dilindungi undang-undang bagi seseorang yang sedang menjalani pemeriksaan di Kepolisian sebagai tersangka.",
                "content" => "Saat seseorang ditetapkan sebagai tersangka dan menjalani pemeriksaan berita acara pemeriksaan (BAP) di Kepolisian, ia tidak kehilangan hak asasi dasarnya sebagai manusia.\n\nUndang-Undang Hukum Acara Pidana (KUHAP) menjamin beberapa hak penting bagi tersangka:\n1. Hak didampingi Advokat: Khusus untuk kasus pidana dengan ancaman hukuman 5 tahun ke atas atau hukuman mati, tersangka wajib didampingi penasihat hukum. Jika tidak mampu, negara wajib menyediakan advokat secara gratis.\n2. Bebas dari Tekanan: Pemeriksaan wajib dilakukan secara bebas tanpa paksaan fisik maupun psikis. Keterangan tersangka yang diperoleh dari hasil kekerasan atau intimidasi tidak sah secara hukum.\n3. Hak Bertanya dan Membela: Tersangka berhak menghadirkan saksi meringankan (a de charge) dan ahli guna mendukung argumen pembelaan dirinya.",
                "image_url" => "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80",
                "published_date" => "2026-04-20"
            ],
            [
                "author_id" => 5, // Fadlan (Lawyer)
                "title" => "Perlindungan Data Pribadi Konsumen Fintech",
                "summary" => "Memahami hak konsumen dan batasan akses data pribadi oleh aplikasi pinjaman online berdasarkan UU UU PDP.",
                "content" => "Maraknya kasus penyalahgunaan data pribadi konsumen oleh aplikasi pinjaman online (pinjol) ilegal mendorong disahkannya UU No. 27 Tahun 2022 tentang Perlindungan Data Pribadi (UU PDP).\n\nBerdasarkan regulasi ini, setiap platform teknologi finansial wajib mendapatkan persetujuan eksplisit (consent) tertulis dari pemilik data sebelum memproses, menyimpan, atau mentransfer data pribadi mereka.\n\nFintech berizin OJK dilarang keras mengakses kontak telepon, log panggilan, galeri foto, atau data sensitif di luar kebutuhan verifikasi identitas (hanya boleh akses KTP, foto wajah, dan slip gaji dasar). Penyebaran data pribadi konsumen untuk penagihan kasar dapat dipidanakan dengan ancaman hukuman penjara hingga 5 tahun dan denda miliaran rupiah.",
                "image_url" => "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80",
                "published_date" => "2026-04-15"
            ],
            [
                "author_id" => 5, // Fadlan (Lawyer)
                "title" => "Cara Menghadapi Somasi Sengketa Tanah",
                "summary" => "Langkah hukum taktis dan hati-hati saat menerima teguran resmi (Somasi) terkait sengketa klaim kepemilikan tanah.",
                "content" => "Menerima surat somasi dari pihak lain yang mengklaim kepemilikan atas tanah Anda sering kali memicu kepanikan. Namun, penting untuk tetap tenang dan menyusun tanggapan secara taktis.\n\nSomasi adalah teguran hukum, bukan putusan pengadilan. Pihak yang menyomasi belum tentu pemilik sah tanah tersebut secara mutlak.\n\nLangkah-langkah menghadapi somasi tanah:\n1. Periksa Legalitas Pengirim: Cek apakah somasi dikirim oleh advokat resmi dengan surat kuasa khusus yang valid dari prinsipal.\n2. Verifikasi Alas Hak: Bandingkan isi somasi dengan Sertifikat Hak Milik (SHM) yang Anda pegang. Pastikan SHM Anda terdaftar di Badan Pertanahan Nasional (BPN).\n3. Berikan Jawaban Tertulis: Jangan pernah mengabaikan somasi. Buat jawaban tertulis secara sopan namun tegas yang menyangkal klaim sepihak pengirim dengan melampirkan dasar-dasar kepemilikan hak Anda yang sah secara hukum perdata.",
                "image_url" => "https://images.unsplash.com/photo-1453728013993-6d66e9c9123a?auto=format&fit=crop&w=800&q=80",
                "published_date" => "2026-04-10"
            ],
            [
                "author_id" => 5, // Fadlan (Lawyer)
                "title" => "Mekanisme Praperadilan di Pengadilan",
                "summary" => "Mekanisme yudisial menguji keabsahan tindakan penetapan tersangka, penahanan, atau penangkapan oleh penyidik.",
                "content" => "Praperadilan adalah hak tersangka untuk mengadili prosedur penegakan hukum yang dilakukan oleh aparat kepolisian atau kejaksaan. Gugatan diajukan ke Pengadilan Negeri setempat dan diputus oleh hakim tunggal dalam batas waktu 7 hari kerja.\n\nFokus utama sidang praperadilan tidak mengadili pokok perkara bersalah atau tidaknya tersangka (materiil), melainkan murni menguji keabsahan formal (prosedur) penangkapan, penahanan, penghentian penyidikan (SP3), penghentian penuntutan, atau penetapan status tersangka.\n\nSejak adanya Putusan Mahkamah Konstitusi No. 21/PUU-XII/2014, penetapan status tersangka wajib didahului oleh minimal dua alat bukti yang sah dan pemeriksaan calon tersangka terlebih dahulu. Jika polisi melanggar prosedur ini, hakim praperadilan berhak membatalkan status tersangka demi hukum.",
                "image_url" => "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80",
                "published_date" => "2026-04-05"
            ],
            [
                "author_id" => 5, // Fadlan (Lawyer)
                "title" => "Legalitas Tanda Tangan Elektronik dalam Akta",
                "summary" => "Bagaimana keabsahan pembuktian tanda tangan elektronik pada dokumen perjanjian di hadapan hakim perdata.",
                "content" => "Di era transformasi digital, tanda tangan basah mulai tergantikan oleh tanda tangan elektronik (TTE). Undang-Undang No. 11 Tahun 2008 jo. UU No. 1 Tahun 2024 tentang ITE memberikan pengakuan hukum penuh terhadap keabsahan TTE.\n\nTanda tangan elektronik memiliki kekuatan hukum dan akibat hukum yang sah asalkan memenuhi persyaratan kumulatif:\n1. Data pembuatan TTE terkait eksklusif hanya kepada penandatangan.\n2. TTE berada dalam kendali penuh penandatangan saat proses penandatanganan.\n3. Segala perubahan TTE setelah waktu penandatanganan dapat diketahui.\n4. TTE menggunakan sertifikat elektronik yang diterbitkan oleh Penyelenggara Sertifikasi Elektronik (PSrE) Indonesia terdaftar di Kominfo.\n\nTTE tersertifikasi memberikan jaminan keaslian identitas dan keutuhan dokumen yang tidak dapat disangkal (non-repudiation) di depan persidangan perdata.",
                "image_url" => "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80",
                "published_date" => "2026-04-01"
            ],
            [
                "author_id" => 5, // Fadlan (Lawyer)
                "title" => "Hukum Waris Islam Menurut KHI",
                "summary" => "Memahami porsi pembagian harta warisan berdasarkan Kompilasi Hukum Islam (KHI) di Pengadilan Agama.",
                "content" => "Bagi pemeluk agama Islam di Indonesia, pembagian waris tunduk pada hukum Islam sebagaimana dikodifikasikan dalam Kompilasi Hukum Islam (KHI) dan diadili oleh Pengadilan Agama.\n\nHukum waris Islam menganut asas keadilan berimbang (bilateral) berdasarkan kedekatan kerabat dan tanggung jawab gender. Porsi pembagian dasar ahli waris:\n- Anak laki-laki mendapatkan porsi 2:1 dibandingkan anak perempuan (karena kewajiban nafkah dalam keluarga Muslim).\n- Suami mendapatkan 1/4 bagian jika ada anak, atau 1/2 bagian jika tidak ada anak.\n- Istri mendapatkan 1/8 bagian jika ada anak, atau 1/4 bagian jika tidak ada anak.\n- Ibu mendapatkan 1/6 bagian jika ada anak, atau 1/3 bagian jika tidak ada anak.\n\nDalam perkembangannya, pembagian waris Islam juga dapat disepakati secara damai melalui Musyawarah Kerabat (Ishlah) di mana porsi dibagi rata atas keridhaan tulus seluruh ahli waris setelah hak asasi masing-masing terpenuhi secara formal.",
                "image_url" => "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=800&q=80",
                "published_date" => "2026-03-28"
            ],
            [
                "author_id" => 5, // Fadlan (Lawyer)
                "title" => "Tanggung Jawab Direksi dalam Kepailitan PT",
                "summary" => "Kapan Direksi Perseroan Terbatas dapat dituntut pertanggungjawaban pribadi hingga harta kekayaan pribadinya disita akibat PT pailit.",
                "content" => "Secara umum, Perseroan Terbatas (PT) berstatus sebagai badan hukum mandiri di mana tanggung jawab pemegang saham dan direksi terbatas pada kontribusi modal perseroan (doktrin Separate Legal Entity).\n\nNamun, perlindungan terbatas ini dapat gugur (Piercing the Corporate Veil) jika PT dinyatakan pailit akibat kelalaian atau kesalahan direksi dalam mengelola perusahaan. Berdasarkan Pasal 104 UU Perseroan Terbatas No. 40 Tahun 2007, jika kepailitan terjadi akibat kesalahan direksi dan harta perseroan tidak cukup melunasi utang, maka setiap anggota direksi bertanggung jawab secara tanggung renteng atas seluruh kewajiban PT yang belum terlunasi.\n\nTanggung jawab pribadi ini mencakup penyitaan kekayaan pribadi direksi oleh kurator, kecuali direksi dapat membuktikan di Pengadilan Niaga bahwa ia telah mengambil tindakan pencegahan secara iktikad baik, tidak memiliki benturan kepentingan, dan pengelolaan dilakukan dengan penuh kehati-hatian.",
                "image_url" => "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80",
                "published_date" => "2026-03-25"
            ],
            [
                "author_id" => 3, // Super Admin (Admin)
                "title" => "Prosedur Mediasi Sengketa Konsumen",
                "summary" => "Cara praktis menyelesaikan pertikaian klaim kerugian pembeli produk melalui mediasi di luar pengadilan melalui BPSK.",
                "content" => "Sengketa antara konsumen dengan pelaku usaha terkait cacat produk atau ingkar janji layanan jasa tidak harus diselesaikan melalui jalur peradilan formal yang memakan biaya besar.\n\nNegara menyediakan Badan Penyelesaian Sengketa Konsumen (BPSK) sebagai lembaga alternatif penyelesaian sengketa konsumen di luar pengadilan. Proses penyelesaian di BPSK dilakukan melalui tiga metode pilihan: Mediasi, Konsiliasi, atau Arbitrase.\n\nProses mediasi di BPSK dipandu oleh majelis mediator BPSK yang netral. Hasil kesepakatan damai di antara konsumen dan pelaku usaha dituangkan dalam Akta Perdamaian BPSK yang bersifat final dan mengikat. Putusan BPSK memiliki kekuatan hukum eksekutorial yang dapat dimintakan penetapan eksekusi ke Pengadilan Negeri jika salah satu pihak ingkar janji melaksanakannya.",
                "image_url" => "https://images.unsplash.com/photo-1505664194779-8bebcb95ae84?auto=format&fit=crop&w=800&q=80",
                "published_date" => "2026-03-20"
            ],
            [
                "author_id" => 3, // Super Admin (Admin)
                "title" => "Cara Membuat Perjanjian Kerja Bersama (PKB)",
                "summary" => "Panduan merumuskan kesepakatan formal hak dan kewajiban antara Serikat Pekerja dengan manajemen Perusahaan.",
                "content" => "Perjanjian Kerja Bersama (PKB) merupakan instrumen hukum penting guna menyelaraskan hubungan industrial di tempat kerja secara harmonis.\n\nPKB dibuat melalui perundingan formal antara Serikat Pekerja yang terdaftar resmi dengan jajaran manajemen/pemilik perusahaan. PKB mengatur syarat-syarat kerja, hak pekerja (seperti upah, jaminan sosial, cuti, tunjangan), kewajiban pekerja, serta mekanisme penyelesaian keluh kesah di tempat kerja.\n\nSyarat keabsahan PKB:\n1. Disusun atas dasar iktikad baik tanpa paksaan di antara kedua belah pihak.\n2. Tidak boleh memuat ketentuan yang bertentangan dengan peraturan perundang-undangan ketenagakerjaan yang berlaku nasional.\n3. PKB wajib dicatatkan resmi ke Dinas Ketenagakerjaan setempat dan disosialisasikan secara terbuka kepada seluruh karyawan perusahaan.",
                "image_url" => "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80",
                "published_date" => "2026-03-15"
            ],
            [
                "author_id" => 3, // Super Admin (Admin)
                "title" => "Mekanisme Uji Materiil (Judicial Review) di MA",
                "summary" => "Bagaimana warga negara menguji peraturan perundang-undangan di bawah undang-undang terhadap undang-undang yang lebih tinggi.",
                "content" => "Di Indonesia, hierarki peraturan perundang-undangan wajib selaras di mana aturan yang lebih rendah tidak boleh bertentangan dengan aturan yang lebih tinggi (asas lex superior derogat legi inferiori).\n\nJika terdapat Peraturan Pemerintah (PP), Peraturan Presiden (Perpres), atau Peraturan Daerah (Perda) yang dinilai melanggar undang-undang, warga negara yang memiliki kerugian hukum langsung dapat mengajukan permohonan Hak Uji Materiil (HUM) ke Mahkamah Agung (MA).\n\nMA bertindak sebagai pengawal legalitas regulasi sektoral di bawah undang-undang. Jika MA mengabulkan permohonan uji materiil, maka pasal regulasi yang digugat dinyatakan tidak memiliki kekuatan hukum mengikat secara umum, dan instansi penerbit regulasi wajib mencabut aturan tersebut dalam batas waktu yang ditentukan.",
                "image_url" => "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80",
                "published_date" => "2026-03-10"
            ],
            [
                "author_id" => 3, // Super Admin (Admin)
                "title" => "Perlindungan Pekerja Kontrak (PKWT) UU Cipta Kerja",
                "summary" => "Mengulas hak kompensasi dan batas waktu maksimal hubungan kerja bagi karyawan kontrak berdasarkan Peraturan Pemerintah No. 35 Tahun 2021.",
                "content" => "Perubahan aturan ketenagakerjaan dalam UU Cipta Kerja mengubah lanskap hubungan kerja kontrak (Perjanjian Kerja Waktu Tertentu / PKWT) di Indonesia secara mendasar.\n\nBerdasarkan PP No. 35 Tahun 2021 sebagai aturan turunan UU Cipta Kerja, jangka waktu maksimal hubungan kerja PKWT kini diperpanjang hingga maksimal 5 tahun (termasuk perpanjangan).\n\nNamun, undang-undang memberikan hak perlindungan baru yang krusial bagi pekerja PKWT:\n- Kompensasi PKWT: Setiap pekerja kontrak yang masa kerjanya berakhir atau selesai berhak mendapatkan Uang Kompensasi dari pengusaha.\n- Besar Uang Kompensasi dihitung secara proporsional berdasarkan masa kerja karyawan (misalnya, kerja 12 bulan penuh berhak mendapat kompensasi sebesar 1 bulan upah pokok).\n- Pengusaha yang lalai membayar uang kompensasi PKWT dapat dikenai sanksi administratif hingga denda operasional pembekuan izin usaha oleh pengawas ketenagakerjaan.",
                "image_url" => "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=800&q=80",
                "published_date" => "2026-03-05"
            ]
        ];
        
        $conn->beginTransaction();
        
        $insert_sql = "INSERT INTO law_insights (author_id, title, summary, content, image_url, published_date) 
                       VALUES (:author_id, :title, :summary, :content, :image_url, :published_date)";
        $stmt = $conn->prepare($insert_sql);
        
        foreach ($insights as $item) {
            $stmt->execute([
                ':author_id' => $item['author_id'],
                ':title' => $item['title'],
                ':summary' => $item['summary'],
                ':content' => $item['content'],
                ':image_url' => $item['image_url'],
                ':published_date' => $item['published_date']
            ]);
        }
        
        $conn->commit();
    }
} catch (Exception $e) {
    header("X-Migration-Status: Failed - " . $e->getMessage());
}

// Helper function to map articles table structure to law_insights expected by mobile app
function mapArticleToInsight($row) {
    // Strip tags and limit summary to 150 chars
    $summary = strip_tags($row['content']);
    if (mb_strlen($summary) > 150) {
        $summary = mb_substr($summary, 0, 150) . '...';
    }
    
    // Clean content from HTML paragraph/break tags to beautiful plain text for the mobile app
    $cleanContent = $row['content'];
    $cleanContent = str_replace('</p>', "\n\n", $cleanContent);
    $cleanContent = str_replace(['<br>', '<br/>', '<br />'], "\n", $cleanContent);
    $cleanContent = strip_tags($cleanContent);
    $cleanContent = trim($cleanContent);
    
    // Map image_url (handle both external URLs and uploaded assets)
    $imageUrl = $row['image_path'] ?: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80';
    if (!preg_match('~^https?://~i', $imageUrl)) {
        $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? "https" : "http";
        $host = $_SERVER['HTTP_HOST'];
        $imageUrl = $protocol . "://" . $host . "/lawsy/website/public/storage/" . $row['image_path'];
    }
    
    // Map published date
    $pubDate = date('Y-m-d', strtotime($row['created_at']));
    
    // Author details from users LEFT JOIN or fallbacks
    $authorId = !empty($row['u_id']) ? intval($row['u_id']) : 163;
    $authorName = !empty($row['u_name']) ? $row['u_name'] : ($row['admin_name'] ?: 'Admin Lawsy');
    $authorRole = !empty($row['u_role']) ? $row['u_role'] : 'Admin';
    
    $authorPhoto = 'https://i.pravatar.cc/150?u=' . urlencode($authorName);
    if (!empty($row['u_photo'])) {
        if (preg_match('~^https?://~i', $row['u_photo'])) {
            $authorPhoto = $row['u_photo'];
        } else {
            $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? "https" : "http";
            $host = $_SERVER['HTTP_HOST'];
            $authorPhoto = $protocol . "://" . $host . "/lawsy/website/public/storage/" . $row['u_photo'];
        }
    }
    
    return [
        'id' => intval($row['id']),
        'author_id' => $authorId,
        'title' => $row['title'],
        'summary' => $summary,
        'content' => $cleanContent,
        'image_url' => $imageUrl,
        'published_date' => $pubDate,
        'author_name' => $authorName,
        'author_role' => ucfirst($authorRole),
        'author_photo' => $authorPhoto
    ];
}

// Route operations
$action = isset($_GET['action']) ? $_GET['action'] : 'list';

switch ($action) {
    case 'latest':
        try {
            // Get 3 newest published articles joined with users table
            $sql = "SELECT 
                        a.*, 
                        u.id as u_id, 
                        u.name as u_name, 
                        u.role as u_role, 
                        u.profile_image as u_photo 
                    FROM articles a
                    LEFT JOIN users u ON a.admin_name = u.name COLLATE utf8mb4_unicode_ci
                    WHERE a.status = 'published' 
                    ORDER BY a.created_at DESC, a.id DESC 
                    LIMIT 3";
            $stmt = $conn->query($sql);
            $raw = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            $data = array_map('mapArticleToInsight', $raw);
            
            echo json_encode([
                "status" => "success",
                "data" => $data
            ]);
        } catch (Exception $e) {
            echo json_encode([
                "status" => "error",
                "message" => "Database error: " . $e->getMessage()
            ]);
        }
        break;

    case 'list':
        $query = isset($_GET['query']) ? trim($_GET['query']) : '';
        
        try {
            if (empty($query)) {
                $sql = "SELECT 
                            a.*, 
                            u.id as u_id, 
                            u.name as u_name, 
                            u.role as u_role, 
                            u.profile_image as u_photo 
                        FROM articles a
                        LEFT JOIN users u ON a.admin_name = u.name COLLATE utf8mb4_unicode_ci
                        WHERE a.status = 'published' 
                        ORDER BY a.created_at DESC, a.id DESC";
                $stmt = $conn->query($sql);
                $raw = $stmt->fetchAll(PDO::FETCH_ASSOC);
            } else {
                $wildcard = '%' . $query . '%';
                $sql = "SELECT 
                            a.*, 
                            u.id as u_id, 
                            u.name as u_name, 
                            u.role as u_role, 
                            u.profile_image as u_photo 
                        FROM articles a
                        LEFT JOIN users u ON a.admin_name = u.name COLLATE utf8mb4_unicode_ci
                        WHERE a.status = 'published' 
                          AND (a.title LIKE :query 
                           OR a.category LIKE :query 
                           OR a.content LIKE :query)
                        ORDER BY (CASE 
                            WHEN a.title = :exact_query THEN 0 
                            WHEN a.title LIKE :prefix_query THEN 1 
                            ELSE 2 
                        END) ASC, a.created_at DESC, a.id DESC";
                $stmt = $conn->prepare($sql);
                $stmt->execute([
                    ':query' => $wildcard,
                    ':exact_query' => $query,
                    ':prefix_query' => $query . '%'
                ]);
                $raw = $stmt->fetchAll(PDO::FETCH_ASSOC);
            }
            
            $data = array_map('mapArticleToInsight', $raw);
            
            echo json_encode([
                "status" => "success",
                "data" => $data
            ]);
        } catch (Exception $e) {
            echo json_encode([
                "status" => "error",
                "message" => "Database error: " . $e->getMessage()
            ]);
        }
        break;

    case 'get':
        $id = isset($_GET['id']) ? intval($_GET['id']) : 0;
        
        if ($id <= 0) {
            echo json_encode([
                "status" => "error",
                "message" => "Invalid article ID."
            ]);
            exit;
        }
        
        try {
            $sql = "SELECT 
                        a.*, 
                        u.id as u_id, 
                        u.name as u_name, 
                        u.role as u_role, 
                        u.profile_image as u_photo 
                    FROM articles a
                    LEFT JOIN users u ON a.admin_name = u.name COLLATE utf8mb4_unicode_ci
                    WHERE a.id = :id AND a.status = 'published'";
            $stmt = $conn->prepare($sql);
            $stmt->execute([':id' => $id]);
            $raw = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($raw) {
                $insight = mapArticleToInsight($raw);
                echo json_encode([
                    "status" => "success",
                    "data" => $insight
                ]);
            } else {
                echo json_encode([
                    "status" => "error",
                    "message" => "Article not found."
                ]);
            }
        } catch (Exception $e) {
            echo json_encode([
                "status" => "error",
                "message" => "Database error: " . $e->getMessage()
            ]);
        }
        break;

    default:
        echo json_encode([
            "status" => "error",
            "message" => "Invalid action"
        ]);
        break;
}
?>
