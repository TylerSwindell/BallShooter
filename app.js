import Enemy from "./Entities/Enemy.js";
import Player from "./Entities/Player.js";
import Projectile from "./Entities/Projectile.js";
import { WHITE, BLACK, BLACK30, canvasMargins } from "./config.js";

/* General Config */

// Play area setup
const canvas = document.querySelector("canvas");

// Specify rendering style
const ctx = canvas.getContext("2d");

// Play area setup
let cWidth = (canvas.width = innerWidth);
let cHeight = (canvas.height = innerHeight);
const midX = cWidth / 2;
const midY = cHeight / 2;

let mouseCoords = {
  x: 0,
  y: 0,
};

// Player Config
const playerConfig = {
  x: midX,
  y: midY,
};

let player = new Player(playerConfig);

// Main animation loop iterations
let microTicks = 1;
// Base Level Games Ticks
let curentGameTick = 1;
// Frames Per Tick
const FPT = 25;

// Array where projectiles are stored
const projectiles = [];

// Array where enemies are stored
const enemies = [];

let gameover = false;

// Scoring render
function drawScoring() {
  ctx.font = "25px sans-serif";
  const scoreText = `Score: ${player.killCount}`;
  const scoreWidth = ctx.measureText(scoreText).width;

  const score = {
    text: scoreText,
    x: 0 + canvasMargins,
    y: 0 + canvasMargins,
    color: WHITE,
  };

  ctx.fillStyle = score.color;
  ctx.fillText(scoreText, score.x, score.y);

  const shotsText = `Shots Fired: ${player.numberOfProjectiles}`;
  const shotsTextWidth = ctx.measureText(shotsText).width;

  const shots = {
    text: shotsText,
    x: cWidth - shotsTextWidth - canvasMargins,
    y: 0 + canvasMargins,
    color: WHITE,
  };
  ctx.fillStyle = shots.color;
  ctx.fillText(shotsText, shots.x, shots.y);
}

function spawnEnemies() {
  let spawnFrequency = 1000;

  // Main enemy spawning loop
  const id = setInterval(() => {
    // size range
    const min = 15;
    const max = 50;
    const radius = getRandomRange(min, max);

    let x;
    let y;

    const rand = Math.random() < 0.5;
    if (rand) {
      x = Math.random() < 0.5 ? 0 - radius : cWidth + radius;
      y = Math.random() * cHeight;
    } else {
      x = Math.random() * cWidth;
      y = Math.random() < 0.5 ? 0 - radius : cHeight + radius;
    }

    const angle = Math.atan2(player.y - y, player.x - x);
    const velocity = { x: Math.cos(angle), y: Math.sin(angle) };
    const color = `hsl(${getRandomRange(0, 360)},50%,50%)`;

    enemies.push(new Enemy(x, y, radius, color, velocity, ctx));
    if (gameover) clearInterval(id);
  }, spawnFrequency);
}

const getRandomRange = (min, max) => Math.random() * (max - min) + min;

function createProjectile(origin, size, speed) {
  const angle = Math.atan2(mouseCoords.y - origin.y, mouseCoords.x - origin.x);
  const velocity = {
    x: Math.cos(angle) * speed,
    y: Math.sin(angle) * speed,
  };
  const projectileSize = size;

  projectiles.push(
    new Projectile(origin.x, origin.y, projectileSize, "white", velocity)
  );
  if (origin.numberOfProjectiles !== undefined) origin.numberOfProjectiles++;
}

addEventListener("click", (e) => {
  player.lastFire = curentGameTick;
  if (player.readyToFire) createProjectile(player, 5, 10);
});

window.addEventListener("resize", (e) => {
  e.preventDefault();
  cWidth = canvas.width = innerWidth;
  cHeight = canvas.height = innerHeight;
  animate(false);
});

addEventListener("mousemove", (e) => {
  mouseCoords = {
    x: e.clientX,
    y: e.clientY,
  };
});

addEventListener("keydown", (e) => {
  const key = e.code;

  if (!gameover) {
    switch (key) {
      case "Space":
        {
          e.preventDefault();
          player.keysDown.space = true;
        }
        break;
      case "KeyW":
        player.keysDown.w = true;
        break;
      case "KeyA":
        player.keysDown.a = true;
        break;
      case "KeyS":
        player.keysDown.s = true;
        break;
      case "KeyD":
        player.keysDown.d = true;
        break;
      default:
        break;
    }
  }
});

addEventListener("keyup", (e) => {
  const key = e.code;

  player.lastKeyPressed = key;

  if (!gameover) {
    switch (key) {
      case "Space":
        player.keysDown.space = false;
        break;
      case "KeyW":
        player.keysDown.w = false;
        break;
      case "KeyA":
        player.keysDown.a = false;
        break;
      case "KeyS":
        player.keysDown.s = false;
        break;
      case "KeyD":
        player.keysDown.d = false;
        break;
      default:
        break;
    }
  }
});

const tickEngine = () => {
  if (microTicks >= FPT) {
    microTicks = 0;
    curentGameTick++;
  }
  if (microTicks === 0) player.readyToFire = true;

  microTicks++;

  console.log("Micro:", microTicks);
  console.log("Ticks:", curentGameTick);
};

const redrawBackground = (looping) => {
  ctx.fillStyle = looping ? BLACK30 : BLACK;
  ctx.fillRect(0, 0, cWidth, cHeight);
};

const playerControls = () => {
  // Setup W A S D Keys to move playerd
  // X Axis
  if (player.keysDown.a) player.x -= player.speed;
  if (player.keysDown.d) player.x += player.speed;

  // Y Axis
  if (player.keysDown.w) player.y -= player.speed;
  if (player.keysDown.s) player.y += player.speed;

  // Setup Space key to fire
  player.readyToFire = curentGameTick > player.lastFire ? true : false;
  if (player.keysDown.space) {
    player.lastFire = curentGameTick;
    if (player.readyToFire) createProjectile(player, 5, 10);
  }

  player.update(ctx);
};

const screenEdgeDetection = (entities, canvasWidth, canvasHeight) => {
  entities.forEach((ent, i) => {
    ent.update(ctx);

    // Remove projectiles from edge of screen
    if (
      ent.x - ent.radius < -100 ||
      ent.x + ent.radius > canvasWidth ||
      ent.y - ent.radius < -100 ||
      ent.y + ent.radius > canvasHeight
    )
      setTimeout(() => entities.splice, 0, (i, 1));
  });
};

const enemyManager = (enemies) => {
  enemies.forEach((enemy, enemyIndex) => {
    enemy.update(ctx);

    // Gets the distance between the center of the player and enemy entities
    const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y);

    // Freezes the game if an enemy hits the player's radius
    if (dist - enemy.radius - player.radius < 1) {
      cancelAnimationFrame(animationId);
      gameover = true;

      // Create end screen

      const endScreenContainer = document.createElement("div");
      endScreenContainer.style.cssText =
        "position:absolute;width:100%;height:100%;z-index:100;top:0;left:0;display:grid;place-items:center;";

      const endScreen = document.createElement("div");
      endScreen.style.cssText =
        "display:grid;place-items:center;width:300px;height:150px;";

      const endScreenText = document.createElement("h2");
      endScreenText.textContent = "Game Over!";
      endScreenText.style.cssText = "color:red;z-index:101;";

      const restartButton = document.createElement("button");
      restartButton.textContent = "Play again?";
      restartButton.style.cssText = "z-index:101;";
      restartButton.addEventListener("click", () => window.location.reload());

      endScreen.appendChild(endScreenText);
      endScreen.appendChild(restartButton);
      endScreenContainer.appendChild(endScreen);
      document.body.appendChild(endScreenContainer);

      projectiles.forEach((projectile) => {
        projectile.velocity = 0;
      });
    } else {
      projectiles.forEach((projectile, projectileIndex) => {
        // Gets the distance between the center of the projectile and enemy entities
        const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y);

        // Checks if the radius of a projectile hits the enemy radius
        if (dist - projectile.radius * 0.9 - enemy.radius * 0.9 < 1) {
          enemy.radius -= player.damage;
          if (enemy.radius < 10) enemies.splice(enemyIndex, 1);

          // Prevents an attempted redraw that causes flashing elements
          setTimeout(() => {
            //enemies.splice(enemyIndex, 1)
            projectiles.splice(projectileIndex, 1);
            player.killCount++;
          });
        }
      });
    }
  });
};

// Main Animation Loop
let animationId;
const animate = (looping = true) => {
  if (looping) animationId = requestAnimationFrame(animate);

  tickEngine();
  redrawBackground(looping);

  playerControls();

  screenEdgeDetection(projectiles, cWidth, cHeight);
  screenEdgeDetection(enemies, cWidth + 100, cHeight + 100);

  enemyManager(enemies);

  drawScoring();
};

function mainLoop() {
  animate();
  spawnEnemies();
}

mainLoop();
