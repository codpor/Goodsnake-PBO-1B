/* global GAME_WIDTH, GAME_HEIGHT, UI_WIDTH, width, height, color, red, green, blue, fill, stroke, strokeWeight, noStroke, noFill, rect, line, ellipse, text, textSize, textStyle, textAlign, CENTER, LEFT, TOP, NORMAL, BOLD, push, pop, translate, scale, cursor, imageMode, image, background, mouseX, mouseY, ceil, snake, assets */

class UISystem {
    constructor() {
        this.focusedIndex = 0; 
        let btnW = 400; let btnH = 55;
        let startX = width/2 - btnW/2; let startY = height/2 - 15;
        this.posBtns = [
            { id: 'SHIELD', text: '🛡️ 1. Shield (Menahan 1x Tabrakan)', color: '#3498db', x: startX, y: startY, w: btnW, h: btnH },
            { id: 'SPEED', text: '⚡ 2. Speed Booster (Cepat 5 Detik)', color: '#f39c12', x: startX, y: startY + 70, w: btnW, h: btnH },
            { id: 'DOUBLE', text: '✨ 3. Double Point (Skor x2 5 Detik)', color: '#9b59b6', x: startX, y: startY + 140, w: btnW, h: btnH }
        ];
        this.negBtns = [
            { id: 'OVERLOAD', text: '1. ??? (Misteri)', color: '#ff7675', x: startX, y: startY, w: btnW, h: btnH },
            { id: 'REVERSE', text: '2. ??? (Misteri)', color: '#fdcb6e', x: startX, y: startY + 70, w: btnW, h: btnH },
            { id: 'SLOW', text: '3. ??? (Misteri)', color: '#d63031', x: startX, y: startY + 140, w: btnW, h: btnH }
        ];
        this.menuBtns = {
            play: { id: 'PLAY', x: width/2 - 125, y: height/2 + 20, w: 250, h: 50 },
            mode: { id: 'MODE', x: width/2 - 125, y: height/2 + 85, w: 250, h: 50 },
            sound: { id: 'SOUND', x: width/2 - 125, y: height/2 + 150, w: 250, h: 50 } 
        };
        this.mapBtns = {
            stay: { id: 'STAY', x: width/2 - 180, y: height/2 + 30, w: 150, h: 50 },
            next: { id: 'NEXT', x: width/2 + 30, y: height/2 + 30, w: 150, h: 50 }
        };
        this.goBtn = { id: 'MENU_BTN', x: width/2 - 100, y: height/2 + 50, w: 200, h: 50 };
        this.playAgainBtn = {
            id: 'PLAY_AGAIN',
            x: width/2 - 140,
            y: height/2 + 95,
            w: 280,
            h: 58
        };

        this.menuBtn = {
            id: 'MENU_BTN',
            x: width/2 - 140,
            y: height/2 + 170,
            w: 280,
            h: 58
        };
    }

    drawPauseOverlay() {
        fill(0, 150);
        rect(0, 0, GAME_WIDTH, GAME_HEIGHT);
        
        fill(255);
        textAlign(CENTER, CENTER);
        textSize(50);
        textStyle(BOLD);
        text('GAME PAUSED', GAME_WIDTH / 2, GAME_HEIGHT / 2 - 20);
        
        textSize(20);
        textStyle(NORMAL);
        text('Tekan P atau Klik untuk Lanjut', GAME_WIDTH / 2, GAME_HEIGHT / 2 + 30);
    }

    drawParticles(particles) {
        for (let p of particles) {
            fill(red(color(p.color)), green(color(p.color)), blue(color(p.color)), p.alpha);
            textSize(22);
            textStyle(BOLD);
            textAlign(CENTER, CENTER);
            text(p.text, p.x, p.y);
        }
    }
    
    resetFocus() { this.focusedIndex = 0; }

    getActiveButtons(state) {
        if (state === 'MENU') return [this.menuBtns.play, this.menuBtns.mode, this.menuBtns.sound];
        if (state === 'DECISION') return this.posBtns;
        if (state === 'NEG_DECISION') return this.negBtns;
        if (state === 'MAP_CHOICE') return [this.mapBtns.stay, this.mapBtns.next];
        if (state === 'GAMEOVER') return [this.playAgainBtn, this.menuBtn];
        return [];
    }

    moveFocus(direction, state) {
        let btns = this.getActiveButtons(state);
        if (btns.length > 0) this.focusedIndex = (this.focusedIndex + direction + btns.length) % btns.length;
    }

    getFocusedId(state) {
        let btns = this.getActiveButtons(state);
        if (btns.length > 0 && this.focusedIndex >= 0 && this.focusedIndex < btns.length) return btns[this.focusedIndex].id;
        return null;
    }

    shuffleNegativeEffects() {
        let ids = ['OVERLOAD', 'REVERSE', 'SLOW'];
        ids = ids.sort(() => Math.random() - 0.5);
        for (let i = 0; i < 3; i++) this.negBtns[i].id = ids[i];
    }

    drawHUD(score, level, doubleTimer) {
        let startX = GAME_WIDTH; 
        fill('#2c3e50'); noStroke(); rect(startX, 0, UI_WIDTH, height);
        stroke('#f1c40f'); strokeWeight(4); line(startX, 0, startX, height);
        fill('#f1c40f'); noStroke(); textSize(28); textAlign(LEFT, TOP); textStyle(BOLD);
        text(`SKOR: ${score}`, startX + 20, 20);
        fill(200); textSize(16); textStyle(NORMAL);
        let mapName = (level === 1) ? 'Sawah' : (level === 2) ? 'Kota' : 'Rumah';
        text(`Map: ${mapName}`, startX + 20, 60);
        text(`Panjang Ular: ${snake.bodyLength}`, startX + 20, 85);
        let nextMapName = (level === 1) ? 'Kota' : (level === 2) ? 'Rumah' : 'Sawah';
        let targetScore = (Math.floor(score / 500) + 1) * 500;
        fill('#00cec9'); textStyle(BOLD); 
        text(`Target Map ${nextMapName}: ${targetScore}`, startX + 20, 115);
        textStyle(NORMAL);
        fill(0, 100); noStroke(); rect(startX + 15, 150, UI_WIDTH - 30, 250, 10);
        let uiY = 165;
        fill(255); textStyle(BOLD); text('STATUS EFEK:', startX + 25, uiY); uiY += 35; textStyle(NORMAL);
        let isNegativeActive = (snake.timers.overload > 0 || snake.timers.reverse > 0 || snake.timers.slow > 0);
        if(snake.hasShield) { fill('#3498db'); text('🛡️ Shield Active', startX + 25, uiY); uiY += 25; }
        if(doubleTimer > 0 && !isNegativeActive) { fill('#9b59b6'); text(`✨ Double Point (${ceil(doubleTimer / 7)}s)`, startX + 25, uiY); uiY += 25; }
        let timers = snake.timers;
        if(timers.speed > 0) { fill('#f39c12'); text(`⚡ Speed Boost (${ceil(timers.speed / 14)}s)`, startX + 25, uiY); uiY += 25; }
        fill('#ff4757'); 
        if(isNegativeActive) { text(`🔥 POIN x3 AKTIF!`, startX + 25, uiY); uiY += 25; }
        if(timers.overload > 0) { text(`🔥 Speed Overload (${ceil(timers.overload / 20)}s)`, startX + 25, uiY); uiY += 25; }
        if(timers.reverse > 0) { text(`🔄 Reverse Control (${ceil(timers.reverse / 7)}s)`, startX + 25, uiY); uiY += 25; }
        if(timers.slow > 0) { text(`🐢 Super Slow (${ceil(timers.slow / 3)}s)`, startX + 25, uiY); uiY += 25; }

        fill(150); textSize(14); textAlign(CENTER, CENTER); textStyle(NORMAL);
        text('⏸️ Tekan P / ESC untuk Pause', startX + UI_WIDTH/2, GAME_HEIGHT - 30);
    }

    drawMainMenu(mode, isSoundMuted) {
        background('#1e272e');
        stroke(255, 10); strokeWeight(1);
        for(let i=0; i<width; i+=40) line(i, 0, i, height);
        for(let j=0; j<height; j+=40) line(0, j, width, j);
        fill('#2ecc71'); textSize(70); textAlign(CENTER, CENTER); textStyle(BOLD);
        text('GOODSNAKE', width/2, height/2 - 140);
        let hsSurv = localStorage.getItem('hsSurvival') || 0;
        let hsClas = localStorage.getItem('hsClassic') || 0;
        fill(255, 200); textSize(18); textStyle(NORMAL);
        text(`🏆 High Score Survival: ${hsSurv}`, width/2, height/2 - 60);
        text(`🏆 High Score Classic: ${hsClas}`, width/2, height/2 - 30);
        this.renderBtn(this.menuBtns.play, '#27ae60', '🎮 MAIN SEKARANG', this.focusedIndex === 0);
        this.renderBtn(this.menuBtns.mode, '#e67e22', `⚙️ MODE: ${mode}`, this.focusedIndex === 1);
        let soundText = isSoundMuted ? '🔇 SUARA: MATI' : '🔊 SUARA: NYALA';
        this.renderBtn(this.menuBtns.sound, '#8e44ad', soundText, this.focusedIndex === 2);
        fill('#00cec9'); textSize(16); textStyle(BOLD);
        text('🌟 TIPS: Capai Skor 500 untuk Map KOTA, dan 1.000 untuk RUMAH! 🌟', width/2, height - 65);
        
        fill(150); textSize(14); textStyle(NORMAL);
        text('⌨️ Navigasi: ⬆️⬇️ / TAB  |  Pilih: ENTER / SPASI  |  Jeda: P / ESC', width/2, height - 30);
    }

    drawMapChoice() {
        background(0, 200);
        fill('#2c3e50'); stroke('#f39c12'); strokeWeight(3);
        rect(width/2 - 250, height/2 - 100, 500, 200, 20);
        noStroke(); fill('#f39c12'); textSize(28); textAlign(CENTER, CENTER); textStyle(BOLD);
        text('🎉 MILESTONE TERCAPAI! 🎉', width/2, height/2 - 50);
        fill(255); textSize(16); textStyle(NORMAL);
        text('Lanjut membersihkan area ini atau pindah ke map baru?', width/2, height/2 - 15);
        this.renderBtn(this.mapBtns.stay, '#7f8c8d', 'LANJUT', this.focusedIndex === 0);
        this.renderBtn(this.mapBtns.next, '#27ae60', 'MAP BARU', this.focusedIndex === 1);
    }

    drawGameOver(score, mode) {
        fill(0, 180);
        rect(0, 0, width, height);

        let cardW = 520;
        let cardH = 340;
        let cx = width / 2 - cardW / 2;
        let cy = height / 2 - cardH / 2;

        fill(0, 120);
        noStroke();
        rect(cx + 10, cy + 10, cardW, cardH, 25);

        fill('#1f1f2e');
        stroke('#8a2be2');
        strokeWeight(2.5);
        rect(cx, cy, cardW, cardH, 25);

        noStroke();

        fill('#ff4d6d');
        textAlign(CENTER, CENTER);
        textSize(48);
        textStyle(BOLD);
        text('GAME OVER', width/2, cy + 60);

        fill(180);
        textSize(16);
        textStyle(NORMAL);
        text('Better luck next time...', width/2, cy + 95);

        fill(255, 255, 255, 20);
        rect(width/2 - 120, cy + 120, 240, 70, 15);

        fill(255);
        textSize(22);
        textStyle(BOLD);
        text(`SKOR: ${score}`, width/2, cy + 145);

        let hsKey = (mode === 'SURVIVAL') ? 'hsSurvival' : 'hsClassic';
        let hs = localStorage.getItem(hsKey) || 0;

        fill('#ffd166');
        textSize(16);
        text(`BEST: ${hs}`, width/2, cy + 170);

        this.playAgainBtn.x = width/2 - 120;
        this.playAgainBtn.y = cy + 210;
        this.playAgainBtn.w = 240;
        this.playAgainBtn.h = 50;

        this.menuBtn.x = width/2 - 120;
        this.menuBtn.y = cy + 270;
        this.menuBtn.w = 240;
        this.menuBtn.h = 50;

        this.renderBtn(this.playAgainBtn, '#27ae60', '▶ PLAY AGAIN', this.focusedIndex === 0);
        this.renderBtn(this.menuBtn,  '#34495e', '🏠 MENU', this.focusedIndex === 1);
    }

    renderBtn(btn, btnColor, label, isFocused) {
        let isHover =
        mouseX > btn.x &&
        mouseX < btn.x + btn.w &&
        mouseY > btn.y &&
        mouseY < btn.y + btn.h;
        
        let active = isHover || isFocused;
        
        let btnScale = active ? 1.05 : 1; 
        let offsetY = active ? -6 : 0;

        let cx = btn.x + btn.w / 2;
        let cy = btn.y + btn.h / 2;
        
        push();
        translate(cx, cy);
        scale(btnScale); 
        translate(-cx, -cy);

        fill(0, 120);
        noStroke();
        rect(btn.x + 8, btn.y + 8, btn.w, btn.h, 18);

        if (active) {
            for (let i = 0; i < 3; i++) {
                stroke(btnColor); 
                strokeWeight(8 - i * 2);
                noFill();
                rect(btn.x - i, btn.y - i + offsetY, btn.w + i * 2, btn.h + i * 2, 18);
            }
        } 

        fill(active ? btnColor : '#2c2c3a'); 
        stroke(active ? '#ffffff' : btnColor); 
        strokeWeight(active ? 3 : 1.5);
        rect(btn.x, btn.y + offsetY, btn.w, btn.h, 18);

        noStroke();
        fill(255);
        textAlign(CENTER, CENTER);
        textStyle(BOLD);
        textSize(active ? 20 : 18);
        text(label, btn.x + btn.w / 2, btn.y + btn.h / 2 + offsetY);

        pop();

        if (isHover) {
            cursor('pointer');
        } else {
            cursor('default');
        }
    }

    drawDecision() {
        this.drawGenericDecision('HAMA SPESIAL DITANGKAP!', 'Pilih Kemampuan:', this.posBtns, '#2c3e50', '#f1c40f');
    }

    drawNegativeDecision() {
        this.drawGenericDecision('HAMA BERBAHAYA DITANGKAP!', 'Risiko Misteri (Seluruh Makanan Poin x3):', this.negBtns, '#2d3436', '#ff7675');
    }

    drawGenericDecision(title, subTitle, btns, bgColor, titleColor) {
        fill(0, 180); noStroke(); rect(0, 0, width, height);
        fill(0, 100); noStroke(); rect(width/2 - 240 + 8, height/2 - 150 + 8, 480, 400, 20);
        fill(bgColor); stroke(titleColor); strokeWeight(2); rect(width/2 - 240, height/2 - 150, 480, 400, 20);
        noStroke(); textAlign(CENTER, CENTER);
        fill(titleColor); textSize(26); textStyle(BOLD); text(title, width/2, height/2 - 95);
        fill(200); textSize(16); textStyle(NORMAL); text(subTitle, width/2, height/2 - 55);
        let hoveringAny = false;
        for (let i = 0; i < btns.length; i++) {
            let btn = btns[i];
            let isHovered = mouseX > btn.x && mouseX < btn.x + btn.w && mouseY > btn.y && mouseY < btn.y + btn.h;
            let active = isHovered || (this.focusedIndex === i);
            fill(0, 50); noStroke(); rect(btn.x + 4, btn.y + 4, btn.w, btn.h, 12);
            fill(active ? '#34495e' : '#1a1a1a'); stroke(btn.color); strokeWeight(active ? 3 : 1.5);
            rect(btn.x, btn.y, btn.w, btn.h, 12); 
            noStroke(); fill(255); textSize(20); textAlign(LEFT, CENTER); textStyle(BOLD);
            text(btn.text, btn.x + 20, btn.y + btn.h/2);
            if (isHovered) hoveringAny = true;
        }
        if (hoveringAny) cursor('pointer'); else cursor('default');
    }

    drawJumpscare() {
        background(0);
        if (assets.img.burhan) {
            imageMode(CENTER);
            image(assets.img.burhan, width/2, height/2, width, height);
        } else {
            fill(255, 0, 0); textSize(120); textAlign(CENTER, CENTER); textStyle(BOLD);
            text('BOO!', width/2, height/2);
        }
    }
}