class IDrawable {
    draw() { throw new Error("Metode draw() wajib diimplementasikan!"); }
}

class GameItem extends IDrawable {
    constructor(x, y) { super(); this.x = x; this.y = y; this.size = TILE_SIZE; }
    drawShadow() { fill(0, 50); noStroke(); rect(this.x + 3, this.y + 3, this.size, this.size, 10); }
    draw() { this.drawShadow(); } 
    applyEffect(engine) { throw new Error("Method wajib!"); }
}

class NormalFood extends GameItem {
    constructor(x, y, type) { super(x, y); this.type = type; }
    draw() {
        super.draw();
        let img = (this.type==='TIKUS1')?assets.img.tikus[0]:(this.type==='KATAK')?assets.img.katak:(this.type==='SIPUT')?assets.img.siput:assets.img.belalang;
        if(img) image(img, this.x, this.y, this.size, this.size); else { fill('#e74c3c'); rect(this.x, this.y, this.size, this.size); }
    }
    applyEffect(engine) { 
        engine.addScore(10, this.x, this.y); 
        engine.playSound('eat'); 
        engine.checkJumpscare(); 
    }
}

class SpecialFood extends GameItem {
    applyEffect(engine) { 
        engine.addScore(20, this.x, this.y); 
        engine.playSound('special'); 
        engine.triggerDecision(); 
    }
    draw() { 
        super.draw(); 
        if(assets.img.tikus[2]) image(assets.img.tikus[2], this.x, this.y, this.size, this.size); 
        else { fill('#f1c40f'); rect(this.x, this.y, this.size, this.size); } 
    }
}

class TrapItem extends GameItem {
    constructor(x, y) { super(x, y); this.isActive = false; this.timer = 70; this.lifespan = 0; }
    applyEffect(engine) { 
        if(!this.isActive) return; 
        engine.addScore(30, this.x, this.y); 
        engine.playSound('trap'); 
        engine.triggerNegativeDecision(); 
        this.isActive = false; 
        this.timer = 105; 
    }
    draw() { 
        if(!this.isActive) return; 
        super.draw(); 
        if(assets.img.tikus[1]) image(assets.img.tikus[1], this.x, this.y, this.size, this.size); 
        else { fill('#8e44ad'); rect(this.x, this.y, this.size, this.size); }
        stroke(255,0,0,map(this.lifespan,0,70,50,255)); 
        strokeWeight(2); noFill(); 
        ellipse(this.x+this.size/2, this.y+this.size/2, this.size+sin(frameCount*0.2)*5); 
    }
}

class MapEnvironment {
    #level; #obstacles; #food; #trap;
    
    constructor(level) {
        this.#level = level; 
        this.#obstacles = [];
        this.#food = null; 
        this.#trap = new TrapItem(0, 0); 
    }

    getObstacles() { return this.#obstacles; }
    getFood() { return this.#food; }
    getTrap() { return this.#trap; }

    generateObstacles() {
        let numObs = (this.#level === 2) ? 15 : (this.#level === 3) ? 30 : 0; 
        let safeXStart = (cols/2) - 5; let safeXEnd = (cols/2) + 3;
        let safeYStart = (rows/2) - 3; let safeYEnd = (rows/2) + 3;

        this.#obstacles = []; 
        for (let i = 0; i < numObs; i++) {
            let rx, ry; let inSafeZone = true;
            while(inSafeZone) {
                rx = floor(random(cols)) * TILE_SIZE; 
                ry = floor(random(rows)) * TILE_SIZE;
                if (!(rx/TILE_SIZE >= safeXStart && rx/TILE_SIZE <= safeXEnd && ry/TILE_SIZE >= safeYStart && ry/TILE_SIZE <= safeYEnd)) {
                    inSafeZone = false;
                }
            }
            this.#obstacles.push({x: rx, y: ry});
        }
    }

    spawnFood() {
        let valid = false;
        let rx = 0, ry = 0;
        while (!valid) {
            rx = floor(random(cols)) * TILE_SIZE; 
            ry = floor(random(rows)) * TILE_SIZE;
            valid = true;
            for (let obs of this.#obstacles) { 
                if (rx === obs.x && ry === obs.y) valid = false; 
            }
        }
        
        if (random(1) < 0.15) {
            this.#food = new SpecialFood(rx, ry);
        } else {
            let randType = random(['KATAK', 'SIPUT', 'BELALANG', 'TIKUS1']);
            this.#food = new NormalFood(rx, ry, randType);
        }
    }

    spawnTrapFood() {
        let valid = false;
        let rx = 0, ry = 0;
        while (!valid) {
            rx = floor(random(cols)) * TILE_SIZE; 
            ry = floor(random(rows)) * TILE_SIZE;
            valid = true;
            for (let obs of this.#obstacles) { 
                if (rx === obs.x && ry === obs.y) valid = false; 
            }
        }
        this.#trap.x = rx;
        this.#trap.y = ry;
        this.#trap.isActive = true; 
        this.#trap.lifespan = 70; 
    }

    hideTrap() { this.#trap.isActive = false; this.#trap.timer = 105; }

    updateTrap() {
        if (this.#trap.isActive) {
            this.#trap.lifespan--;
            if (this.#trap.lifespan <= 0) { this.#trap.isActive = false; this.#trap.timer = 70; }
        } else {
            this.#trap.timer--;
            if (this.#trap.timer <= 0) this.spawnTrapFood();
        }
    }

    drawMap() {
        stroke(255, 15); strokeWeight(1);
        for(let i=0; i<=GAME_WIDTH; i+=TILE_SIZE) line(i, 0, i, GAME_HEIGHT);
        for(let j=0; j<=GAME_HEIGHT; j+=TILE_SIZE) line(0, j, GAME_WIDTH, j);

        for (let obs of this.#obstacles) {
            fill(0, 80); noStroke(); rect(obs.x + 3, obs.y + 3, TILE_SIZE, TILE_SIZE, 3);
            if (this.#level === 1) fill('#4a3728'); 
            else if (this.#level === 2) fill('#7f8c8d'); 
            else fill('#34495e'); 
            stroke(0, 100); strokeWeight(2); rect(obs.x, obs.y, TILE_SIZE, TILE_SIZE, 3);
        }
    }

    drawFoods() {
        imageMode(CORNER); 
        if (this.#food) this.#food.draw();
        if (this.#trap) this.#trap.draw();
    }
}