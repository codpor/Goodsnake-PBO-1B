class GameEngine {
    #state; #mode; #score; #playTime; #jumpscareDone; #mapLevel; #pointMultiplier; #doublePointTimer;
    #audio; 
    
    #isPaused = false;
    #shakeTimer = 0;
    #shakeAmount = 0;
    #particles = []; 

    constructor() {
        this.#audio = new AudioManager();
        this.#mode = 'SURVIVAL'; 
        this.#mapLevel = 1; 
        
        this.resetGame();
        this.#state = 'MENU';
    }

    get shakeTimer() { return this.#shakeTimer; }
    get shakeAmount() { return this.#shakeAmount; }
    getState() { return this.#state; }

    setMap(level, name) {
        this.#mapLevel = level;
        let cvs = document.querySelector('canvas');
        if (cvs) {
            cvs.style.backgroundImage = `url('assets/img/BG_${name}.png')`;
            cvs.style.backgroundSize = 'cover';
            cvs.style.backgroundPosition = 'center';
            cvs.style.backgroundColor = 'transparent'; 
        }
    }

    setMode(m) {
        this.#mode = m; 
        this.resetGame();
        // OCP: Suntikkan mode setelah game direset
        if(m === 'CLASSIC') snake.setModeStrategy(new ClassicMode());
        else snake.setModeStrategy(new SurvivalMode());
    }

    resetGame() {
        this.#score = 0;
        this.#playTime = 0;
        this.#jumpscareDone = false;
        this.#pointMultiplier = 1;
        this.#doublePointTimer = 0;
        this.#isPaused = false;
        this.#particles = [];
        
        snake = new Snake();
        if(this.#mode === 'CLASSIC') snake.setModeStrategy(new ClassicMode());
        else snake.setModeStrategy(new SurvivalMode());

        mapEnv = new MapEnvironment(this.#mapLevel);
        mapEnv.generateObstacles();
        mapEnv.spawnFood();
        mapEnv.spawnTrapFood();
        frameRate(7);
    }

    changeState(newState) {
        this.#state = newState;
        if (typeof uiSystem !== 'undefined') uiSystem.resetFocus(); 
    }

    triggerShake(duration, amount) {
        this.#shakeTimer = duration;
        this.#shakeAmount = amount;
    }

    spawnParticle(x, y, text, color) {
        this.#particles.push({
            x: x + TILE_SIZE / 2, y: y, text: text, alpha: 255, color: color
        });
    }

    // Jembatan untuk audio
    playSound(name) { this.#audio.playSound(name); }
    playBGM(type) { this.#audio.playBGM(type); }
    setBGMVolume(vol) { this.#audio.setBGMVolume(vol); }

    // Jembatan untuk makanan (LSP)
    addScore(basePoints, x, y) {
        let added = (this.#pointMultiplier === 2) ? basePoints * 2 : basePoints;
        this.#score += added;
        snake.grow();
        if (x !== undefined && y !== undefined) {
            let color = basePoints > 10 ? (basePoints === 30 ? '#ff4757' : '#f1c40f') : '#f1c40f';
            this.spawnParticle(x, y, `+${added}`, color);
        }
    }

    triggerDecision() {
        this.setBGMVolume(0.1); 
        this.changeState('DECISION');
    }

    triggerNegativeDecision() {
        uiSystem.shuffleNegativeEffects(); 
        this.setBGMVolume(0.1); 
        this.changeState('NEG_DECISION');
    }

    checkJumpscare() {
        if (!this.#jumpscareDone && this.#playTime > 30000 && random(1) < 0.05) {
            this.#jumpscareDone = true;
            this.setBGMVolume(0.0); 
            this.changeState('JUMPSCARE');
            this.playSound('jumpscare');
            setTimeout(() => {
                if(this.#state === 'JUMPSCARE') {
                    this.changeState('PLAYING');
                    this.setBGMVolume(0.3); 
                }
            }, 1500); 
        }
    }

    run() {
        if (this.#state === 'MENU') return;

        if (this.#state === 'PLAYING') {
            mapEnv.drawMap(); 
            mapEnv.drawFoods(); 
            mapEnv.updateTrap();
            
            uiSystem.drawParticles(this.#particles);
            for (let i = this.#particles.length - 1; i >= 0; i--) {
                this.#particles[i].y -= 1.5; 
                this.#particles[i].alpha -= 8; 
                if (this.#particles[i].alpha <= 0) this.#particles.splice(i, 1);
            }

            if (this.#isPaused) {
                snake.drawSnake();
                uiSystem.drawHUD(this.#score, this.#mapLevel, this.#doublePointTimer);
                uiSystem.drawPauseOverlay();
                return;
            }

            this.#playTime += deltaTime; 
            if (this.#shakeTimer > 0) this.#shakeTimer--;

            this.checkInteractions(); 
            this.updateTimers();
            snake.drawSnake();
            uiSystem.drawHUD(this.#score, this.#mapLevel, this.#doublePointTimer);
        }
        else if (this.#state === 'DECISION') {
            uiSystem.drawHUD(this.#score, this.#mapLevel, this.#doublePointTimer); 
            uiSystem.drawDecision();
        }
        else if (this.#state === 'NEG_DECISION') {
            uiSystem.drawHUD(this.#score, this.#mapLevel, this.#doublePointTimer); 
            uiSystem.drawNegativeDecision();
        }
        else if (this.#state === 'JUMPSCARE') {
            uiSystem.drawJumpscare();
        }
        else if (this.#state === 'GAMEOVER') {
            uiSystem.drawGameOver(this.#score, this.#mode);
        }
    }

    updateTimers() {
        if (this.#doublePointTimer > 0) {
            this.#doublePointTimer--;
            if (this.#doublePointTimer <= 0) this.#pointMultiplier = 1;
        }
    }

    checkInteractions() {
        if (!snake.isStunned) {
            if (snake.predictCollision(mapEnv.getObstacles())) {
                if (snake.hasShield) {
                    snake.breakShield();
                    this.triggerShake(10, 8); 
                } else {
                    this.triggerGameOver();
                }
            } else {
                snake.move();
            }
        }

        let head = snake.getHead();
        let food = mapEnv.getFood();
        let trap = mapEnv.getTrap();

        if (head.x === food.x && head.y === food.y) {
            food.applyEffect(this); 
            mapEnv.spawnFood();
        }

        if (trap.isActive && head.x === trap.x && head.y === trap.y) {
            trap.applyEffect(this);
        }
    }

    triggerGameOver() {
        this.playSound('die');
        this.setBGMVolume(0); 

        let hsKey = (this.#mode === 'SURVIVAL') ? 'hsSurvival' : 'hsClassic';
        let highScore = localStorage.getItem(hsKey) || 0;
        if (this.#score > highScore) {
            localStorage.setItem(hsKey, this.#score);
        }

        if (typeof checkMapUnlock === 'function') checkMapUnlock(this.#score);
        if (typeof updateHighScoresUI === 'function') updateHighScoresUI();

        this.changeState('GAMEOVER');
    }

    handleInput(kCode, kStr) {
        if (this.#state === 'PLAYING') {
            if (kCode === 80 || kCode === 27) { 
                this.#isPaused = !this.#isPaused;
                this.setBGMVolume(this.#isPaused ? 0.05 : 0.3);
                this.playSound('click');
                return;
            }
            if (!this.#isPaused) snake.changeDirection(kCode);
        } else if (['DECISION', 'NEG_DECISION', 'GAMEOVER'].includes(this.#state)) {
            if (kCode === UP_ARROW) uiSystem.moveFocus(-1, this.#state);
            else if (kCode === DOWN_ARROW || kCode === 9) uiSystem.moveFocus(1, this.#state);
            else if (kCode === 13 || kCode === 32) {
                let actionId = uiSystem.getFocusedId(this.#state);
                if (actionId) this.executeUIAction(actionId);
            } 
            else if (['1','2','3'].includes(kStr)) {
                let idx = parseInt(kStr) - 1;
                let btns = uiSystem.getActiveButtons(this.#state);
                if (btns[idx]) this.executeUIAction(btns[idx].id);
            }
        }
    }

    executeUIAction(actionId) {
        this.playSound('click');

        if (['SHIELD', 'SPEED', 'DOUBLE', 'OVERLOAD', 'REVERSE', 'SLOW'].includes(actionId)) {
            if (actionId === 'SHIELD') snake.activateShield();
            else if (actionId === 'SPEED') snake.activateSpeed();
            else if (actionId === 'DOUBLE') {
                this.#pointMultiplier = 2;
                this.#doublePointTimer = 35;
            }
            else if (actionId === 'OVERLOAD') snake.activateOverload();
            else if (actionId === 'REVERSE') snake.activateReverse();
            else if (actionId === 'SLOW') snake.activateSlow();

            this.setBGMVolume(0.3);
            this.changeState('PLAYING');
        }
        else if (actionId === 'PLAY_AGAIN') {
            this.resetGame();
            this.changeState('PLAYING');
            this.playBGM(this.#mode);
        }
        else if (actionId === 'MENU_BTN') {
            if (typeof goToScreen === 'function') goToScreen('menu-screen');
            this.changeState('MENU');
            this.playBGM('MENU');
        }
        else if (actionId === 'PLAY') {
            this.resetGame();
            this.changeState('PLAYING');
        }
    }

    handleClick(mx, my) {
        if (this.#state === 'PLAYING' && this.#isPaused) {
            this.#isPaused = false;
            this.setBGMVolume(0.3);
            this.playSound('click');
            return;
        }
        if (['DECISION', 'NEG_DECISION', 'GAMEOVER'].includes(this.#state)) {
            let btns = uiSystem.getActiveButtons(this.#state);
            for (let i = 0; i < btns.length; i++) {
                let btn = btns[i];
                if (mx > btn.x && mx < btn.x + btn.w && my > btn.y && my < btn.y + btn.h) {
                    this.executeUIAction(btn.id);
                    break;
                }
            }
        }
    }
}