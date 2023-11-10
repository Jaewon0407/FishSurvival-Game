const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// Images
const playerImage = document.getElementById('source');
const fishOneImage = document.getElementById('fish-1');
const fishTwoImage = document.getElementById('fish-2');
const fishThreeImage = document.getElementById('fish-3');

const startButton = document.getElementById('start-replay');
const levelDisplay = document.getElementById('level');
const scoreDisplay = document.getElementById('score');

// Initalize the size of the Canvas
canvas.width = 1000;
canvas.height = 600;

// Controls
let mouseControl = false;
let keyControl = false;

document.addEventListener('keydown', keyDown);
document.addEventListener('keyup', keyUp);

// Player Hitbox
let playerHitboxX;
let playerHitboxY;
let playerHitboxWidth;
let playerHitboxHeight;
let playerHitboxCenterX;
let playerHitboxCenterY;

// Fish Hitbox
let enemyHitboxX;
let enemyHitboxY;
let enemyHitboxWidth;
let enemyHitboxHeight;
let enemyHitboxCenterX;
let enemyHitboxCenterY;

let target;
let level;
let levelUpdated = false;
let playerDead;

const fishes = [];
const players = [];

const fishChar = {

    fish1: {
        spawnCount: 0,
        speed: 0.5,
        width: 10,
        height: 10, 
        fishType: 'fish1',
        playerTarget: false
    },

    fish2: {
        spawnCount: 0,
        speed: 0.5,
        width: 20,
        height: 20,
        fishType: 'fish2',
        playerTarget: false
    },

    fish3: {
        spawnCount: 0,
        speed: 0.5,
        width: 50,
        height: 50, 
        fishType: 'fish3',
        playerTarget: false
    },

    fish4: {
        spawnCount: 0,
        speed: 0.5,
        width: 100,
        height: 100, 
        fishType: 'fish4',
        playerTarget: false
    },

    fish5: {
        spawnCount: 0,
        speed: 0.5,
        width: 150,
        height: 150, 
        fishType: 'fish5',
        playerTarget: false
    }
};

// Helper Functions 
function clear() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

const mouseSpeed = 0.05;

const mouse = {
    x: canvas.width/2,
    y: canvas.height/2
};

function handleMouseMove(event) {

    keyControl = false;
    mouseControl = true;

    // Update mouse coordinates within the canvas 
    mouse.x = event.clientX - canvasPosition.left - player.w/2;
    mouse.y = event.clientY - canvasPosition.top - player.h/2;

}

// Mouse Interactivity 
canvas.addEventListener('mousemove', handleMouseMove);
const canvasPosition = canvas.getBoundingClientRect();

// Player Class 
class Player {
    constructor() {

        // Player score
        this.score = 0;

        // Image Coordinates
        this.x = canvas.width/2;
        this.y = canvas.height/2;

        // Image Size 
        this.imageScale = 0.05;
        this.w = playerImage.width * this.imageScale;
        this.h = playerImage.height * this.imageScale;

        // Image Speed
        this.speed = 5;
        this.dx = 0;
        this.dy = 0;

        // Hitbox scale factor
        this.hitboxScaleX = 0.825; 
        this.hitboxScaleY = 0.75;

        // Hitbox scaled dimension
        this.hitboxWidth = this.w * this.hitboxScaleX;
        this.hitboxHeight = this.h * this.hitboxScaleY;

        // Hitbox Coordinates
        this.hitboxX = this.x + ((this.w - this.hitboxWidth) / 2);
        this.hitboxY = this.y + ((this.h - this.hitboxHeight) / 2);

        // Hitbox Center Coordinates
        this.hitboxCenterX = this.hitboxX + (this.hitboxWidth / 2);
        this.hitboxCenterY = this.hitboxY + (this.hitboxHeight / 2);
    }

    increaseScore(points) {
        this.score += points;
        this.updateLevel();
        updateScoreboard(this.score);
    }

    updateLevel() {

        let nextLevel;

        

        if (this.score === 0 && !levelUpdated) {
            reset(player);
            nextLevel = levelOne(fishChar);
            levelUpdated = true;
            level = 1;
    
        } else if(this.score >= 100 && this.score < 1000 && levelUpdated) {
            reset(player);
            nextLevel = levelTwo(fishChar);
            levelUpdated = false;
            level = 2;
            
        } else if (this.score >= 1000 && this.score < 5000 && !levelUpdated) {
            reset(player);
            nextLevel = levelThree(fishChar);
            levelUpdated = true;
            level = 3;
    
        } else if (this.score >= 5000 && this.score < 20000 && levelUpdated) {
            reset(player);
            nextLevel = levelFour(fishChar);
            levelUpdated = false;
            level = 4;
    
        } else if (this.score >= 20000 && this.score < 50000 && !levelUpdated) {
            reset(player);
            nextLevel = levelFive(fishChar);
            levelUpdated = true;
            level = 5;
    
        } else if (this.score >= 50000 && this.score < 100000 && levelUpdated) {
            reset(player);
            nextLevel = levelSix(fishChar);
            levelUpdated = false;
            level = 6;
    
        } else if (this.score >= 100000 && !levelUpdated) {
            reset(player);
            nextLevel = levelSeven(fishChar);
            level = 7;
    
        }

        updateLevelDisplay(level);
    }

    playerPosition() {    

        if (keyControl === true) {
            // Update x and y 
            this.x += this.dx;
            this.y += this.dy;

            // Update Hitbox coordinates
            this.hitboxX = this.x + ((this.w - this.hitboxWidth) / 2);
            this.hitboxY = this.y + ((this.h - this.hitboxHeight) / 2);

            // Update Hitbox Center Coordinates
            this.hitboxCenterX = this.hitboxX + (this.hitboxWidth / 2);
            this.hitboxCenterY = this.hitboxY + (this.hitboxHeight / 2);

        }

        if (mouseControl === true) {

            // Mouse control x and y 
            const dx = (mouse.x - player.x) * mouseSpeed;
            const dy = (mouse.y - player.y) * mouseSpeed;

            // Update Image
            this.x += dx;
            this.y += dy;

            // Update Hit ox
            this.hitboxX = this.x + ((this.w - this.hitboxWidth) / 2);
            this.hitboxY = this.y + ((this.h - this.hitboxHeight) / 2);

            // Update Hitbox Center Coordinates
            this.hitboxCenterX = this.hitboxX + (this.hitboxWidth / 2);
            this.hitboxCenterY = this.hitboxY + (this.hitboxHeight / 2);

        }

    }

    wallDetection() {
        // Right Wall
        if (this.x + this.w - 50 > canvas.width) {
            this.x = canvas.width - this.w + 50;
        }
        // Left Wall 
        if (this.x < -50) {
            this.x = -50;
        }
        // Top Wall
        if (this.y < -50) {
            this.y = -50;
        }
        // Bottom Wall
        if (this.y + this.h - 50 > canvas.height) {
            this.y = canvas.height - this.h + 50;
        }
    }

    drawPlayer() {
        ctx.drawImage(playerImage, this.x, this.y, this.w, this.h);

        // Hitbox 
        // ctx.strokeStyle = 'red';
        // ctx.lineWidth = 2;

        // Calculate the hitbox boundaries
        // playerHitboxX = this.hitboxX;
        // playerHitboxY = this.hitboxY;
        // playerHitboxWidth = this.hitboxWidth;
        // playerHitboxHeight = this.hitboxHeight;

        // Draw the hitbox rectangle
        // ctx.strokeRect(playerHitboxX, playerHitboxY, playerHitboxWidth, playerHitboxHeight);
    }

    updateImageScale(imageScale) {
        this.w = playerImage.width * imageScale;
        this.h = playerImage.height * imageScale;
    }   

}

class Enemy {
    constructor(x, y, w, h, speed, fishType, angle, level) {
        
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.dx = Math.cos(angle) * speed;
        this.dy = Math.sin(angle) * speed;
        this.angle = angle;
        this.fishType = fishType;
        this.level = level;

        // Hitbox scale factor
        this.hitboxScale = 0.5;

        // Scaled hitbox dimensions
        this.hitboxWidth = this.w * this.hitboxScale;
        this.hitboxHeight = this.h * this.hitboxScale;

        // Hitbox coordinates
        this.hitboxX = this.x + ((this.w - this.hitboxWidth) / 2);
        this.hitboxY = this.y + ((this.h - this.hitboxHeight) / 2);

        // Center Coordinates of the hitbox
        this.hitboxCenterX = this.hitboxX + (this.hitboxWidth / 2);
        this.hitboxCenterY = this.hitboxY + (this.hitboxHeight / 2);

    }

    drawFish() {

        // If the fish is fish1 
        if (this.fishType === 'fish1') {
            ctx.drawImage(fishOneImage, this.x, this.y, this.w, this.h);
        } else if (this.fishType === 'fish2') {
            ctx.drawImage(fishTwoImage, this.x, this.y, this.w, this.h);
        } else if (this.fishType === 'fish3') {
            ctx.drawImage(fishThreeImage, this.x, this.y, this.w, this.h);
        }

        // Hitbox
        // ctx.strokeStyle = 'red';
        // ctx.lineWidth = 2;

        // Calculate the hitbox boundaries
        // enemyHitboxX = this.hitboxX;
        // enemyHitboxY = this.hitboxY;
        // enemyHitboxWidth = this.hitboxWidth;
        // enemyHitboxHeight = this.hitboxHeight;

        // Draw the hitbox rectangle
        // ctx.strokeRect(enemyHitboxX, enemyHitboxY, enemyHitboxWidth, enemyHitboxHeight);
    }

    updatePosition() {
        // Update image 
        this.x += this.dx;
        this.y += this.dy;

        // Update Hitbox 
        this.hitboxX = this.x + ((this.w - this.hitboxWidth) / 2);
        this.hitboxY = this.y + ((this.h - this.hitboxHeight) / 2);

        // Update Hitbox Center
        this.hitboxCenterX = this.hitboxX + (this.hitboxWidth / 2);
        this.hitboxCenterY = this.hitboxY + (this.hitboxHeight / 2);
    }

    wallDetection() {
        // Top Wall
        if (this.y < 0) {
            this.y = 0;
            this.dy *= -0.5;
        }

        // Left Wall, Right Wall, Bottom Wall
        if (this.x + this.w - 50 > canvas.width || this.x < -50 || this.y < -50 || this.y + this.h - 50 > canvas.height) {
            // Remove the fish from the fishes array
            const index = fishes.indexOf(this);
            if (index !== -1) {
                const fishType = fishes[index].fishType;
                fishes.splice(index, 1);
                respawn(fishType);
            }
        }
    }

    randomTurns() {
        const randomTurn = Math.random();
        if (randomTurn < 0.01) {
            // Generate a random angle within a small range
            const angleChange = Math.random() * Math.PI / 4 - Math.PI / 8;
    
            // Rotate the current velocity vector
            const cosAngle = Math.cos(angleChange);
            const sinAngle = Math.sin(angleChange);
            const newDx = this.dx * cosAngle - this.dy * sinAngle;
            const newDy = this.dx * sinAngle + this.dy * cosAngle;
    
            // Update the fish's velocity
            this.dx = newDx;
            this.dy = newDy;
        }
    }

    avoidPlayer(player) {
        // Calculate the vector from the enemy to the player
        const dx = player.hitboxCenterX - this.hitboxCenterX;
        const dy = player.hitboxCenterY - this.hitboxCenterY;

        // Calculate the distance between the enemy and the player 
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Check if the enemy is too close to the player
        if (distance < 100) {

            // Calculate the normalized direction vector away from the player
            const directionX = -dx / distance;
            const directionY = -dy / distance;

            // Adjust the enemy's velocity based on the direction vector
            this.dx += directionX * 0.1;
            this.dy += directionY * 0.1;
        }
    }

    chasePlayer(player) {
        // Calculate the vector from the enemy to the player
        const dx = player.hitboxCenterX - this.hitboxCenterX;
        const dy = player.hitboxCenterY - this.hitboxCenterY;

        // Calculate the distance between the enemy and the player
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Check if the enemy is close to the player
        if (distance < 100) {
            // Calculate the normalized direction vector towards the player
            const directionX = dx / distance;
            const directionY = dy / distance;

            // Adjust the enemy's velocity based on the direction vector
            this.dx = directionX 
            this.dy = directionY 
        }
    }

    hitboxDie(player) {

        const index = fishes.indexOf(this)

        if (
            player.hitboxX < this.hitboxX + this.hitboxWidth && 
            player.hitboxX + player.hitboxWidth > this.hitboxX && 
            player.hitboxY < this.hitboxY + this.hitboxHeight && 
            player.hitboxHeight + player.hitboxY > this.hitboxY
        ) {
            // Player death
            if (!playerDead) {
                if (fishChar[this.fishType].playerTarget === true) {
                    playerDead = true;
                    reset(player);
                    replay(player);
    
                } else if (fishChar[this.fishType].playerTarget === false) {
                    // Fish death
                    if (index !== -1) {
                        const fishType = fishes[index].fishType;
                        let points = 0;
    
                        // Update Player score 
                        if (fishType === 'fish1') {
                            points = 5;
                            player.imageScale += 0.000125; 
                            player.updateImageScale(player.imageScale);
    
    
                        } else if (fishType === 'fish2') {
                            points = 10;
                            player.imageScale += 0.00025;
                            player.updateImageScale(player.imageScale);
    
                        } else if (fishType === 'fish3') {
                            points = 50;
                            player.imageScale += 0.0005;
                            player.updateImageScale(player.imageScale);
    
                        } else if (fishType === 'fish4') {
                            points = 100;
                            player.imageScale += 0.0025;
                            player.updateImageScale(player.imageScale);
    
                        } else if (fishType === 'fish5') {
                            points = 1000;
                            player.imageScale += 0.005;
                            player.updateImageScale(player.imageScale);
                        }
                        
                        // Update Score
                        player.increaseScore(points);
    
                        // Despawn fish
                        fishes.splice(index, 1);
                        
                        // Respawn fish
                        respawn(fishType);
                    }
                }
            }
        }
    }

    changeBehaviour() {
        // Level 1 
        // If fish type is fish1 or fish2, then the fish will avoid the player

        if (!playerDead) {
            players.forEach(player => {
                if (fishChar[this.fishType].playerTarget === true) {
                    this.chasePlayer(player);
                } else {
                    this.avoidPlayer(player);
                }
            });
        }
    }
}

function gameStart() {
    
    playerDead = false;

    startButton.innerHTML = '';
    scoreDisplay.innerHTML = 'Score: 0';
    levelDisplay.innerHTML = 'Level: 1';

    player = new Player();
    player.updateLevel();
    update();
}

function replay(player) {

    player.score = 0; 
    levelUpdated = false; 
    level = 1; 

    startButton.innerHTML = 'Replay';
    scoreDisplay.innerHTML = '';
    levelDisplay.innerHTML = '';
    
    clear();

    gameLoop();
}

function reset(player) {

    player.x = canvas.width / 2; 
    player.y = canvas.height / 2; 
    player.dx = 0; 
    player.dy = 0; 

    fishes.length = 0;
    players.length = 0;
    
}

function updateLevelDisplay(level) {
    const levelElement = document.querySelector('#level');
    levelElement.innerHTML = `Level: ${level}`;
}

function updateScoreboard(score) {
    const scoreElement = document.querySelector('#score');
    scoreElement.innerHTML = `Score: ${score}`;
}

function respawn(fishType) {

    const wall = Math.floor(Math.random()*3);

    let x, y;

    if (wall === 0) {
        x = 0;
        y = Math.random() * canvas.height;
    } else if (wall === 1) {
        x = canvas.width;
        y = Math.random() * canvas.height;
    } else if (wall === 2) {
        x = Math.random() * canvas.width;
        y = canvas.height;
    }

    const angle = Math.random() * 2 * Math.PI;

    const respawnedFish = new Enemy(x, y, fishChar[fishType].width, fishChar[fishType].height, fishChar[fishType].speed, fishType, angle, fishChar[fishType].level);
    fishes.push(respawnedFish);
}

function initialSpawnFish(fishChar) {

    const x = Math.random() * (canvas.width - fishChar.width);
    const y = Math.random() * (canvas.height - fishChar.height);

    const angle = Math.random() * 2 * Math.PI;

    const fish = new Enemy(x, y, fishChar.width, fishChar.height, fishChar.speed, fishChar.fishType, angle, fishChar.level);
    fishes.push(fish);
}

/* LEVELS */
function levelOne(fishChar) {

    fishChar.fish1.spawnCount = 15;
    fishChar.fish2.spawnCount = 8;

    fishChar.fish1.playerTarget = false;
    fishChar.fish2.playerTarget = true;

    players.push(player);

    // Inital Spawn 
    for (let i = 0; i < fishChar.fish1.spawnCount; i++) {
        initialSpawnFish(fishChar.fish1);
    }

    for (let i = 0; i < fishChar.fish2.spawnCount; i++) {
        initialSpawnFish(fishChar.fish2);
    }
}

function levelTwo(fishChar) {

    fishChar.fish1.spawnCount = 15;
    fishChar.fish2.spawnCount = 8;
    fishChar.fish3.spawnCount = 5;

    fishChar.fish1.playerTarget = false;
    fishChar.fish2.playerTarget = false;
    fishChar.fish3.playerTarget = true;

    players.push(player);

    // Inital Spawn 
    for (let i = 0; i < fishChar.fish1.spawnCount; i++) {
        initialSpawnFish(fishChar.fish1);
    }

    for (let i = 0; i < fishChar.fish2.spawnCount; i++) {
        initialSpawnFish(fishChar.fish2);
    }

    for (let i = 0; i < fishChar.fish3.spawnCount; i++) {
        initialSpawnFish(fishChar.fish3);
    }
}

function levelThree(fishChar) {
    fishChar.fish1.spawnCount = 15;
    fishChar.fish2.spawnCount = 10;
    fishChar.fish3.spawnCount = 8;
    fishChar.fish4.spawnCount = 5;

    fishChar.fish1.playerTarget = false;
    fishChar.fish2.playerTarget = false;
    fishChar.fish3.playerTarget = true;
    fishChar.fish4.playerTarget = true;

    players.push(player);

    // Inital Spawn 
    for (let i = 0; i < fishChar.fish1.spawnCount; i++) {
        initialSpawnFish(fishChar.fish1);
    }

    for (let i = 0; i < fishChar.fish2.spawnCount; i++) {
        initialSpawnFish(fishChar.fish2);
    }

    for (let i = 0; i < fishChar.fish3.spawnCount; i++) {
        initialSpawnFish(fishChar.fish3);
    }

    for (let i = 0; i < fishChar.fish4.spawnCount; i++) {
        initialSpawnFish(fishChar.fish4);
    }
}

function levelFour(fishChar) {
    fishChar.fish1.spawnCount = 15;
    fishChar.fish2.spawnCount = 10;
    fishChar.fish3.spawnCount = 8;
    fishChar.fish4.spawnCount = 5;
    fishChar.fish5.spawnCount = 1;

    fishChar.fish1.playerTarget = false;
    fishChar.fish2.playerTarget = false;
    fishChar.fish3.playerTarget = false;
    fishChar.fish4.playerTarget = true;
    fishChar.fish5.playerTarget = true;

    players.push(player);

    // Inital Spawn 
    for (let i = 0; i < fishChar.fish1.spawnCount; i++) {
        initialSpawnFish(fishChar.fish1);
    }

    for (let i = 0; i < fishChar.fish2.spawnCount; i++) {
        initialSpawnFish(fishChar.fish2);
    }

    for (let i = 0; i < fishChar.fish3.spawnCount; i++) {
        initialSpawnFish(fishChar.fish3);
    }

    for (let i = 0; i < fishChar.fish4.spawnCount; i++) {
        initialSpawnFish(fishChar.fish4);
    }

    for (let i = 0; i < fishChar.fish5.spawnCount; i++) {
        initialSpawnFish(fishChar.fish5);
    }
}

/* Game Controls */
function moveUp() {
    player.dy = -player.speed;
}

function moveDown() {
    player.dy = player.speed;
}

function moveRight() {
    player.dx = player.speed;
}

function moveLeft() {
    player.dx = -player.speed;
}

function keyDown(event) {

    keyControl = true;
    mouseControl = false;
    
    if (event.key === 'ArrowUp' || event.key === 'Up') {
        moveUp();
    } else if (event.key === 'ArrowDown' || event.key === 'Down') {
        moveDown();
    } else if (event.key === 'ArrowRight' || event.key === 'Right') {
        moveRight();
    } else if (event.key === 'ArrowLeft' || event.key === 'Left') {
        moveLeft();
    }
}

function keyUp(event) {
    if (
        event.key === 'Right' || 
        event.key === 'ArrowRight' ||
        event.key === 'Left' ||
        event.key === 'ArrowLeft' ||
        event.key === 'Up' ||
        event.key === 'ArrowUp' ||
        event.key === 'Down' ||
        event.key === 'ArrowDown'
    ) {
        player.dx = 0;
        player.dy = 0;
    }
}

/* Game UPDATE */

function update() {

    clear();
    
    players.forEach(player => {
        player.playerPosition();
        player.wallDetection();
        player.drawPlayer();
    });

    console.log(players);
    
    fishes.forEach(fish => {
        fish.updatePosition();
        fish.wallDetection();
        fish.randomTurns();
        fish.changeBehaviour();
        fish.hitboxDie(player);
        fish.drawFish();
    });

    console.log(players);

    requestAnimationFrame(update);
}

startButton.addEventListener('click', gameStart);


