
function topWall(obj) {
    return obj.y;
}
function bottomWall(obj) {
    return obj.y + obj.height;
}
function leftWall(obj) {
    return obj.x;
}
function rightWall(obj) {
    return obj.x + obj.width;
}

// DINOSAUR
function Dinosaur (x, dividerY) {
    this.width = 110;
    this.height = 120;
    this.x = x;
    this.y = dividerY - this.height;
    this.vy = 0;
    this.jumpVelocity = -25;
}
Dinosaur.prototype.image = new Image();
Dinosaur.prototype.image.src = "css/cintaku.png";

Dinosaur.prototype.draw = function(context) {
    if (this.image.complete) {
        context.drawImage(this.image, this.x, this.y, this.width, this.height);
    } else {
        this.image.onload = () => {
            context.drawImage(this.image, this.x, this.y, this.width, this.height);
        };
    }
}
Dinosaur.prototype.jump = function() {
    console.log("Jump called");
    this.vy = this.jumpVelocity;
};
Dinosaur.prototype.update = function(divider, gravity) {
    this.y += this.vy;
    this.vy += gravity;
    if (bottomWall(this) > topWall(divider) && this.vy > 0) {
        this.y = topWall(divider) - this.height;
        this.vy = 0;
        return;
    }
};
// ----------
// DIVIDER
function Divider (gameWidth, gameHeight) {
    this.width = gameWidth;
    this.height = 4;
    this.x = 3;
    this.y = gameHeight - this.height - Math.floor(0.2 * gameHeight);
}
Divider.prototype.draw = function(context) {
    context.fillRect(this.x, this.y, this.width, this.height);
};
// ----------

// ----------
// CACTUS
function Cactus(gameWidth, groundY){
    this.width = 100;
    this.height = (Math.random() > 0.5) ? 150 : 110;
    this.x = gameWidth;
    this.y = groundY - this.height;
    this.passed = false; // ← Tambahan ini
}

Cactus.image = new Image();
Cactus.image.src = "css/kaktus.png";

Cactus.prototype.draw = function(context) {
    if (Cactus.image.complete) {
        context.drawImage(Cactus.image, this.x, this.y, this.width, this.height);
    } else {
        Cactus.image.onload = () => {
            context.drawImage(Cactus.image, this.x, this.y, this.width, this.height);
        };
    }
};
// ----------
// GAME
function Game () {
    var canvas = document.getElementById("game");

    // Set fullscreen
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    this.width = canvas.width;
    this.height = canvas.height;
    this.context = canvas.getContext("2d");
    this.context.fillStyle = "brown";

    document.spacePressed = false;
    document.addEventListener("keydown", function(e) {
        if (e.key === " ") this.spacePressed = true;
    });
    document.addEventListener("keyup", function(e) {
        if (e.key === " ") this.spacePressed = false;
    });
    this.score = 0;
    this.gravity = 0.6;
    this.divider = new Divider(this.width, this.height);
    this.dino = new Dinosaur(Math.floor(0.1 * this.width), this.divider.y);
    this.cacti = [];

    this.runSpeed = -4;
    this.paused = false;
    this.noOfFrames = 0;
}
window.addEventListener("resize", () => {
    const canvas = document.getElementById("game");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    game.width = canvas.width;
    game.height = canvas.height;

    game.divider = new Divider(game.width, game.height);
    game.dino = new Dinosaur(Math.floor(0.1 * game.width), game.divider.y);
});

Game.prototype.spawnCactus = function(probability)
    //Spawns a new cactus depending upon the probability
    {
    if(Math.random() <= probability){
        this.cacti.push(new Cactus(this.width, this.divider.y));
    }
}

Game.prototype.update = function () {
    if(this.paused){
        return;
    }

    if (document.spacePressed == true && bottomWall(this.dino) >= topWall(this.divider)) {
        this.dino.jump();
    }
    this.dino.update(this.divider, this.gravity);

    if(this.cacti.length > 0 && rightWall(this.cacti[0]) < 0) {
        this.cacti.shift();
    }

    if(this.cacti.length == 0){
        this.spawnCactus(0.5);
    } else if (
        this.cacti.length > 0 && this.width - leftWall(this.cacti[this.cacti.length-1]) > this.jumpDistance + 150)
    {
        this.spawnCactus(0.05);
    }

    for (let i = 0; i < this.cacti.length; i++){
        this.cacti[i].x += this.runSpeed;
    }

    // Deteksi tabrakan
    for(let i = 0; i < this.cacti.length; i++){
        if(
            rightWall(this.dino) >= leftWall(this.cacti[i])
            && leftWall(this.dino) <= rightWall(this.cacti[i])
            && bottomWall(this.dino) >= topWall(this.cacti[i])
        ){
            this.paused = true;
        }
    }

    // Tambah skor jika berhasil melewati kaktus
    for (let i = 0; i < this.cacti.length; i++) {
        let cactus = this.cacti[i];
        if (!cactus.passed && rightWall(this.dino) > rightWall(cactus)) {
            cactus.passed = true;
            this.score += 1;
        }
    }

    this.jumpDistance = Math.floor(this.runSpeed * (2 * this.dino.jumpVelocity) / this.gravity);
};

Game.prototype.draw = function () {
    // clear rectangle of game
    this.context.clearRect(0, 0, this.width, this.height);
    // draw divider line
    this.divider.draw(this.context);
    // draw the dinosaur
    this.dino.draw(this.context);
    //drawing the cactii
    for (i = 0; i < this.cacti.length; i++){
        this.cacti[i].draw(this.context);
    }

    
    // draw GAME OVER if paused
    if (this.paused) {
        this.context.fillStyle = "white";
        this.context.font = "bold 64px Arial";
        this.context.textAlign = "center";
        this.context.textBaseline = "middle";
        this.context.fillText(`I LOVE YOU TOO`, this.width / 2, this.height / 2 - 50);
        this.context.fillText(`♡✧˚ ༘ ⋆｡♡˚ SKOR KAMU ${this.score} ♡✧˚ ༘ ⋆｡♡˚`, this.width / 2, this.height / 2 + 30);
    } else {
        var oldFill = this.context.fillStyle;
        this.context.fillStyle = "white";
        this.context.font = "24px Arial"; // Tambahkan font agar konsisten
        this.context.textAlign = "right"; // Rapi di pojok kanan atas
        this.context.fillText(this.score, this.width - 40, 30);
        this.context.fillStyle = oldFill;
    }
    
};

var game = new Game();
function main (timeStamp) {
    game.update();
    game.draw();
    window.requestAnimationFrame(main);
}
var startGame = window.requestAnimationFrame(main);