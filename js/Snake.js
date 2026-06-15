// ==========================================
// INTERFACE 2 (YANG SEMPAT HILANG)
// ==========================================
class IMovable {
    move() {
        throw new Error("Metode move() wajib diimplementasikan!");
    }
}

// ==========================================
// STRATEGY PATTERN UNTUK OCP 
// ==========================================
class GameModeStrategy {
    handleBoundary(head) { throw new Error("Method wajib!"); }
    checkCollision(nextX, nextY, body, obstacles, growCount) { throw new Error("Method wajib!"); }
}

class ClassicMode extends GameModeStrategy {
    handleBoundary(head) {
        if (head.x < 0) head.x = GAME_WIDTH - TILE_SIZE; 
        else if (head.x >= GAME_WIDTH) head.x = 0;
        if (head.y < 0) head.y = GAME_HEIGHT - TILE_SIZE; 
        else if (head.y >= GAME_HEIGHT) head.y = 0;
    }
    checkCollision(nx, ny, body, obs, grow) {
        let tx = nx, ty = ny;
        if (tx < 0) tx = GAME_WIDTH - TILE_SIZE; else if (tx >= GAME_WIDTH) tx = 0;
        if (ty < 0) ty = GAME_HEIGHT - TILE_SIZE; else if (ty >= GAME_HEIGHT) ty = 0;
        return this.isHit(tx, ty, body, obs, grow);
    }
    isHit(x, y, body, obs, grow) {
        let limit = grow > 0 ? body.length : body.length - 1;
        for (let i = 0; i < limit; i++) if (x === body[i].x && y === body[i].y) return true;
        for (let o of obs) if (x === o.x && y === o.y) return true;
        return false;
    }
}

class SurvivalMode extends ClassicMode {
    handleBoundary(head) { /* Nabrak = Mati, tidak ada teleport */ }
    checkCollision(nx, ny, body, obs, grow) {
        if (nx < 0 || nx >= GAME_WIDTH || ny < 0 || ny >= GAME_HEIGHT) return true;
        return super.isHit(nx, ny, body, obs, grow);
    }
}

// ==========================================
// CLASS SNAKE 
// ==========================================
class Snake extends IMovable {
    #body; #xDir; #yDir; #isStunned; #hasShield; #growCount; #timers;
    #modeStrategy; 

    constructor() {
        super();
        let cx = floor(cols/2), cy = floor(rows/2);
        this.#body = [createVector(cx * TILE_SIZE, cy * TILE_SIZE), createVector((cx-1)*TILE_SIZE, cy*TILE_SIZE), createVector((cx-2)*TILE_SIZE, cy*TILE_SIZE)];
        this.#xDir = 1; this.#yDir = 0;
        this.#hasShield = false; this.#isStunned = false; this.#growCount = 0;
        this.#timers = { speed: 0, overload: 0, reverse: 0, slow: 0 };
        this.#modeStrategy = new SurvivalMode(); 
    }

    setModeStrategy(strategy) { this.#modeStrategy = strategy; }
    getHead() { return this.#body[0]; }
    get hasShield() { return this.#hasShield; }
    get isStunned() { return this.#isStunned; }
    get bodyLength() { return this.#body.length; }
    get timers() { return this.#timers; }
    activateShield() { this.#hasShield = true; }
    breakShield() { this.#hasShield = false; this.#isStunned = true; }
    activateSpeed() { this.#timers.speed = 70; }
    activateOverload() { this.#timers.overload = 120; }
    activateReverse() { this.#timers.reverse = 42; }
    activateSlow() { this.#timers.slow = 18; }
    grow() { this.#growCount++; }

    changeDirection(kCode) {
        let u = UP_ARROW, d = DOWN_ARROW, l = LEFT_ARROW, r = RIGHT_ARROW;
        if (this.#timers.reverse > 0) [u, d, l, r] = [DOWN_ARROW, UP_ARROW, RIGHT_ARROW, LEFT_ARROW];
        if (kCode === u && this.#yDir !== 1) { this.#xDir = 0; this.#yDir = -1; }
        else if (kCode === d && this.#yDir !== -1) { this.#xDir = 0; this.#yDir = 1; }
        else if (kCode === l && this.#xDir !== 1) { this.#xDir = -1; this.#yDir = 0; }
        else if (kCode === r && this.#xDir !== -1) { this.#xDir = 1; this.#yDir = 0; }
        if (this.#isStunned) this.#isStunned = false;
    }

    predictCollision(obstacles) {
        let nx = this.#body[0].x + this.#xDir * TILE_SIZE;
        let ny = this.#body[0].y + this.#yDir * TILE_SIZE;
        return this.#modeStrategy.checkCollision(nx, ny, this.#body, obstacles, this.#growCount);
    }

    move() {
        let head = this.#body[0].copy();
        head.x += this.#xDir * TILE_SIZE;
        head.y += this.#yDir * TILE_SIZE;
        this.#modeStrategy.handleBoundary(head);
        this.#body.unshift(head);
        if (this.#growCount > 0) this.#growCount--; else this.#body.pop();
        
        Object.keys(this.#timers).forEach(k => { if(this.#timers[k] > 0) this.#timers[k]--; });
        if (this.#timers.overload > 0) frameRate(20);
        else if (this.#timers.slow > 0) frameRate(3);
        else if (this.#timers.speed > 0) frameRate(14);
        else frameRate(7);
    }

    drawSnake() {
        for (let i = 0; i < this.#body.length; i++) {
            let x = this.#body[i].x, y = this.#body[i].y;
            fill(0, 80); noStroke(); rect(x + 4, y + 4, TILE_SIZE, TILE_SIZE, 5); 
            if (i === 0) {
                push(); translate(x + TILE_SIZE/2, y + TILE_SIZE/2);
                rotate((this.#xDir===1)?0:(this.#xDir===-1)?PI:(this.#yDir===1)?HALF_PI:-HALF_PI);
                imageMode(CENTER);
                if (assets.img.badanUlar && assets.img.mataUlar) {
                    image(assets.img.badanUlar, 0, 0, TILE_SIZE, TILE_SIZE);
                    image(assets.img.mataUlar, 0, 0, TILE_SIZE, TILE_SIZE);
                } else {
                    fill(this.#hasShield?'#3498db':(this.#timers.reverse>0?'#ff4757':'#27ae60')); 
                    rect(-TILE_SIZE/2, -TILE_SIZE/2, TILE_SIZE, TILE_SIZE, 5);
                }
                pop();
            } else {
                if (assets.img.badanUlar) { imageMode(CORNER); image(assets.img.badanUlar, x, y, TILE_SIZE, TILE_SIZE); }
                else { fill('#2ecc71'); stroke(0, 50); rect(x, y, TILE_SIZE, TILE_SIZE, 5); }
            }
        }
    }
}