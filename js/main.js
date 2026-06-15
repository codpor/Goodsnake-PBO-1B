// ==========================================
// PENGATURAN & DEKLARASI GLOBAL
// ==========================================
const USE_AUDIO = true; 

const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;
const UI_WIDTH = 250;

let game, snake, mapEnv, uiSystem;
const TILE_SIZE = 25; 
let cols, rows;

// Objek untuk menampung semua file gambar dan suara
let assets = {
    img: { 
        tikus: [], katak: null, siput: null, belalang: null, 
        badanUlar: null, mataUlar: null, burhan: null 
    },
    sfx: { 
        bgmMenu: null, bgmSurvival: null, bgmClassic: null, 
        click: null, eat: null, special: null, trap: null, 
        die: null, jumpscare: null 
    }
};

// ==========================================
// PRELOAD: Memuat semua aset sebelum game mulai
// ==========================================
function preload() {
    let errHandler = (err) => console.log("Aset tidak ditemukan, menggunakan placeholder.");

    // Load Gambar
    assets.img.tikus[0] = loadImage('assets/img/tikus1.png', () => {}, errHandler);
    assets.img.tikus[1] = loadImage('assets/img/tikus2.png', () => {}, errHandler);
    assets.img.tikus[2] = loadImage('assets/img/tikus3.png', () => {}, errHandler);
    assets.img.katak = loadImage('assets/img/katak.png', () => {}, errHandler);
    assets.img.siput = loadImage('assets/img/siput.png', () => {}, errHandler);
    assets.img.belalang = loadImage('assets/img/belalang.png', () => {}, errHandler);
    assets.img.badanUlar = loadImage('assets/img/badan_ular.png', () => {}, errHandler);
    assets.img.mataUlar = loadImage('assets/img/mata_ular.png', () => {}, errHandler);
    assets.img.burhan = loadImage('assets/img/burhan.png', () => {}, errHandler);

    // Load Suara
    if (USE_AUDIO) {
        soundFormats('mp3', 'wav');
        assets.sfx.bgmMenu = loadSound('assets/audio/bgm_menu.mp3', () => {}, errHandler);
        assets.sfx.bgmSurvival = loadSound('assets/audio/musik_survival.mp3', () => {}, errHandler);
        assets.sfx.bgmClassic = loadSound('assets/audio/bgm_classic.mp3', () => {}, errHandler);
        
        assets.sfx.click = loadSound('assets/audio/click.mp3', () => {}, errHandler);
        assets.sfx.eat = loadSound('assets/audio/eat.mp3', () => {}, errHandler);
        assets.sfx.special = loadSound('assets/audio/special.mp3', () => {}, errHandler);
        assets.sfx.trap = loadSound('assets/audio/trap.mp3', () => {}, errHandler);
        assets.sfx.die = loadSound('assets/audio/die.mp3', () => {}, errHandler);
        assets.sfx.jumpscare = loadSound('assets/audio/jumpscare.mp3', () => {}, errHandler);
    }
}

// ==========================================
// SETUP: Inisialisasi Canvas dan Game Engine
// ==========================================
function setup() {
    // 1. Tambahkan pixelDensity(1) agar performa stabil
    pixelDensity(1);

    let cvs = createCanvas(GAME_WIDTH + UI_WIDTH, GAME_HEIGHT);
    cvs.parent('canvas-holder'); 
    
    // --- BARIS PALING PENTING ---
    // Ini memastikan canvas benar-benar transparan sejak awal
    clear(); 
    // ----------------------------

    cols = GAME_WIDTH / TILE_SIZE; 
    rows = GAME_HEIGHT / TILE_SIZE;
    
    uiSystem = new UISystem();
    game = new GameEngine();
    
    game.changeState('MENU');
    
    if (typeof updateHighScoresUI === 'function') {
        updateHighScoresUI();
    }
}

function draw() {
    // 1. Clear harus dipanggil di paling atas agar Canvas transparan
    clear(); 

    // 2. Jika di MENU, jangan gambar apa-apa lagi. 
    // Biarkan fungsi berhenti di sini supaya tidak ada pixel warna yang menutupi video.
    if (game.getState() === 'MENU') {
        return;
    }

    // 3. Logika game (hanya jalan jika bukan MENU)
    if (game.shakeTimer > 0) {
        let shake = game.shakeAmount;
        translate(random(-shake, shake), random(-shake, shake));
    }
    
    game.run();
}
// ==========================================
// INPUT: Keyboard & Mouse
// ==========================================
function keyPressed() {
    // Kirim input ke GameEngine
    game.handleInput(keyCode, key);

    // Mencegah browser melakukan default action (seperti scroll saat tekan panah)
    if ([UP_ARROW, DOWN_ARROW, LEFT_ARROW, RIGHT_ARROW, 9, 13, 32, 27].includes(keyCode)) {
        return false; 
    }
}

function mousePressed() {
    // Kirim koordinat klik ke GameEngine
    game.handleClick(mouseX, mouseY);
}