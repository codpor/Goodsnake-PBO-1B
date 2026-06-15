// ==========================================
// VARIABLE GLOBAL UNTUK STATE MENU
// ==========================================
let selectedMapLevel = 1;
let selectedMapName = 'sawah';

// ==========================================
// FUNGSI NAVIGASI LAYAR (HTML)
// ==========================================
function goToScreen(id) {
    // 1. Cari semua elemen dengan class 'screen' dan sembunyikan
    const screens = document.querySelectorAll('.screen');
    screens.forEach(s => {
        s.classList.remove('active');
        s.style.display = 'none'; // Paksa sembunyi
    });
    
    // 2. Tampilkan screen yang diminta
    if (id !== 'none') {
        const target = document.getElementById(id);
        if (target) {
            target.classList.add('active');
            target.style.display = 'flex'; // Paksa muncul dengan flex (sesuai CSS)
        }
    }
}

// ==========================================
// FUNGSI MEMULAI GAME (START)
// ==========================================
function startGame(mode) {
    // 1. Sembunyikan semua menu HTML agar Game p5.js terlihat
    goToScreen('none'); 
    
    // 2. Kirim data pilihan ke GameEngine p5.js
    if (game) {
        game.setMap(selectedMapLevel, selectedMapName); 
        game.setMode(mode); // 'CLASSIC' atau 'SURVIVAL'
        game.changeState('PLAYING');
        
        // 3. Matikan lagu menu dan nyalakan lagu game
        if (assets.sfx.bgmMenu && assets.sfx.bgmMenu.isPlaying()) {
            assets.sfx.bgmMenu.stop();
        }
        game.playBGM(mode);
    } else {
        console.error("Game Engine belum siap!");
    }
}

// ==========================================
// FUNGSI UPDATE SKOR DI LAYAR UTAMA
// ==========================================
function updateHighScoresUI() {
    const hsClassic = localStorage.getItem('hsClassic') || 0;
    const hsSurvival = localStorage.getItem('hsSurvival') || 0;
    const maxScore = Math.max(hsClassic, hsSurvival);
    
    const classicElem = document.getElementById('hs-classic-val');
    const survivalElem = document.getElementById('hs-survival-val');
    
    if (classicElem) classicElem.innerText = hsClassic;
    if (survivalElem) survivalElem.innerText = hsSurvival;

    // Sinkronkan variabel logika dengan skor yang ada
    if (maxScore >= 100) unlockedMaps.rumah = true;
    if (maxScore >= 500) unlockedMaps.kota = true;

    updateMapLocks(); // Perbarui tampilan visual gembok
}

// ==========================================
// INISIALISASI SAAT PAGE LOAD
// ==========================================

window.onload = () => {
    loadMapProgress();
    updateHighScoresUI();
    goToScreen('menu-screen');

    // Paksa play video dengan retry jika gagal
    const vid = document.getElementById('bg-video');
    if (vid) {
        vid.muted = true; // pastikan muted secara programatik
        vid.play().catch(() => {
            // Kalau masih diblokir, coba lagi saat user pertama klik
            document.addEventListener('click', () => vid.play(), { once: true });
        });
    }
};

// ==========================================
// SISTEM UNLOCK MAP GOODSNAKE
// ==========================================

// Status map yang terbuka
// Sawah otomatis terbuka dari awal
let unlockedMaps = {
    sawah: true,
    rumah: false,
    kota: false
};


// ==========================================
// LOAD DATA MAP YANG SUDAH TERBUKA
// Dari LocalStorage Browser
// ==========================================
function loadMapProgress(){

    // Ambil status unlock dari browser
    const rumahUnlocked =
        localStorage.getItem('unlockRumah');

    const kotaUnlocked =
        localStorage.getItem('unlockKota');

    // Jika rumah sudah pernah terbuka
    if(rumahUnlocked === 'true'){

        unlockedMaps.rumah = true;
    }

    // Jika kota sudah pernah terbuka
    if(kotaUnlocked === 'true'){

        unlockedMaps.kota = true;
    }

    // Update tampilan card map
    updateMapLocks();
}


// ==========================================
// UPDATE TAMPILAN LOCK PADA CARD MAP
// ==========================================
function updateMapLocks(){

    // Ambil card rumah dari HTML
    const rumahCard =
        document.getElementById('lock-perumahan');

    // Ambil card kota dari HTML
    const kotaCard =
        document.getElementById('lock-kota');

    // Jika map rumah sudah terbuka
    if(unlockedMaps.rumah){

        // Hapus class locked
        rumahCard.classList.remove('locked');
    }

    // Jika map kota sudah terbuka
    if(unlockedMaps.kota){

        // Hapus class locked
        kotaCard.classList.remove('locked');
    }
}


// ==========================================
// CEK SCORE UNTUK MEMBUKA MAP BARU
// ==========================================
function checkMapUnlock(score) {
    // Unlock MAP RUMAH (Skor 100)
    if (score >= 100 && !unlockedMaps.rumah) { // Cek jika belum terbuka
        unlockedMaps.rumah = true;
        localStorage.setItem('unlockRumah', 'true');
        showUnlockPopup("🏠 MAP RUMAH TERBUKA!", "Kamu berhasil mencapai 100 poin!");
    }

    // Unlock MAP KOTA (Skor 500)
    if (score >= 500 && !unlockedMaps.kota) { // Cek jika belum terbuka
        unlockedMaps.kota = true;
        localStorage.setItem('unlockKota', 'true');
        showUnlockPopup("🏙️ MAP KOTA TERBUKA!", "Kamu berhasil mencapai 500 poin!");
    }

    updateMapLocks();
}

// ==========================================
// FUNCTION PILIH MAP
// ==========================================
function selectMap(level, name){

    // ======================================
    // CEK MAP RUMAH MASIH TERKUNCI
    // ======================================
    if(name === 'rumah' &&
       !unlockedMaps.rumah){

        return;
    }

    // ======================================
    // CEK MAP KOTA MASIH TERKUNCI
    // ======================================
    if(name === 'kota' &&
       !unlockedMaps.kota){

        return;
    }

    // ======================================
    // SIMPAN MAP PILIHAN USER
    // ======================================
    selectedMapLevel = level;

    selectedMapName = name;

    // ======================================
    // PINDAH KE MENU MODE
    // ======================================
    goToScreen('mode-screen');

    // ======================================
    // MAINKAN SUARA KLIK
    // ======================================
    if (game &&
        typeof game.playSound === 'function') {

        game.playSound('click');
    }
}

// ==========================================
// TAMPILKAN POPUP UNLOCK
// ==========================================
function showUnlockPopup(title, desc){

    const popup =
        document.getElementById(
            'unlock-popup'
        );

    const titleText =
        document.getElementById(
            'unlock-title'
        );

    const descText =
        document.getElementById(
            'unlock-desc'
        );

    // Isi teks popup
    titleText.innerText = title;

    descText.innerText = desc;

    // Tampilkan popup
    popup.classList.remove('hidden');
}

// ==========================================
// TUTUP POPUP UNLOCK
// ==========================================
function closeUnlockPopup(){

    const popup =
        document.getElementById(
            'unlock-popup'
        );

    popup.classList.add('hidden');
}