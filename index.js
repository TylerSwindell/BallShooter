import Enemy from "./Entities/Enemy.js";
import Player from "./Entities/Player.js";
import Projectile from "./Entities/Projectile.js";

/* General Config */

// rgba colors
const WHITE = 'rgba(255,255,255,1)'
const BLACK = 'rgba(0, 0, 0, 1)'
const BLACK30 = 'rgba(0, 0, 0, 0.3)'
const BLACK50 = 'rgba(0, 0, 0, 0.5)'

// Play area setup
const canvas = document.querySelector('canvas')

// Specify rendering style
const ctx = canvas.getContext('2d');

// Play area setup
let cWidth = canvas.width = innerWidth
let cHeight = canvas.height = innerHeight
const midX = cWidth/2
const midY = cHeight/2

let mouseCoords = {
    x: 0,
    y: 0
}

// Player Config
const player = new Player(midX, midY, 20, 'red');

// Array where projectiles are stored
const projectiles = []

// Array where enemies are stored
const enemies = []

let gameover = false;

// Scoring render
function drawScoring() {

    const margins = 50

    ctx.font = '25px sans-serif';

    const scoreText = `Score: ${player.killCount}`   
    const scoreWidth = ctx.measureText(scoreText).width

    const score = {
        text: scoreText, 
        x: 0 + margins, 
        y: 0 + margins, 
        color: WHITE
    }
    ctx.fillStyle = score.color
    ctx.fillText(scoreText, score.x, score.y);
    
    const shotsText = `Shots Fired: ${player.numberOfProjectiles}`
    const shotsTextWidth = ctx.measureText(shotsText).width

    const shots = { 
        text: shotsText, 
        x: cWidth - shotsTextWidth - margins, 
        y: 0 + margins, 
        color: WHITE
    }
    ctx.fillStyle = shots.color
    ctx.fillText(shotsText, shots.x, shots.y);
  }


function spawnEnemies() {
    let spawnFrequency = 1000

    // Main enemy spawning loop
    const id = setInterval(() => {
        // size range
        const min = 15
        const max = 50
        const radius = getRandomRange(min, max)

        let x
        let y

        const rand = Math.random() < .5
        if (rand) {
            x = (Math.random() < .5) ? 0 - radius : cWidth + radius
            y = Math.random() * cHeight
        } else {
            x = Math.random() * cWidth
            y = (Math.random() < .5) ? 0 - radius : cHeight + radius
        }
        
        const angle = Math.atan2(player.y - y, player.x - x)
        const velocity = {x: Math.cos(angle), y: Math.sin(angle)}
        const color = `hsl(${getRandomRange(0,360)},50%,50%)`
        
        enemies.push(new Enemy(x, y, radius, color, velocity, ctx))
        if (gameover) clearInterval(id)
    }, spawnFrequency)
}

const getRandomRange = (min, max) => Math.random() * (max - min) + min

// Main Animation Loop
let animationId
const animate = (loop = true) => {
    if (loop) animationId = requestAnimationFrame(animate)

    ctx.fillStyle = (loop) ? BLACK30 : BLACK

    ctx.fillRect(0, 0, cWidth, cHeight)

    projectiles.forEach((projectile, i) => {
        projectile.update(ctx)

        // Remove projectiles from edge of screen
        if ((projectile.x - projectile.radius < 0 || 
                projectile.x + projectile.radius > cWidth) ||
            (projectile.y - projectile.radius < 0 || 
                projectile.y + projectile.radius > cHeight)) 
            setTimeout(() => {
                projectiles.splice(i, 1)
            }, 0)
    })


    enemies.forEach((enemy, enemyIndex) => {
        enemy.update(ctx)

        // Gets the distance between the center of the player and enemy entities
        const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y)

        // Freezes the game if an enemy hits the player's radius
        if(dist - (enemy.radius) - (player.radius) < 1) {
            cancelAnimationFrame(animationId)
            gameover = true
            projectiles.forEach(projectile => {
                projectile.velocity = 0;
            });
        } else {
            projectiles.forEach((projectile, projectileIndex) => {
                // Gets the distance between the center of the projectile and enemy entities
                const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y)

                // Checks if the radius of a projectile hits the enemy radius
                if (dist - (projectile.radius*.9) - (enemy.radius*.9) < 1) {

                    // Prevents an attempted redraw that causes flashing elements
                    setTimeout(() => {
                        enemies.splice(enemyIndex, 1)
                        projectiles.splice(projectileIndex, 1);
                        player.killCount++
                    })
                }
            })
            // Remove projectiles from edge of screen
            if ((enemy.x < -100 || 
                enemy.x > cWidth+100) ||
            (enemy.y < -100 || 
                enemy.y > cHeight + 100)) 
            setTimeout(() => {
                enemies.splice(enemyIndex, 1)
            }, 0)

        }
    })
    player.update(ctx, 0, 0)
    drawScoring()

}

function createProjectile(origin, size, speed) {
    const angle = Math.atan2(
        mouseCoords.y - origin.y, 
        mouseCoords.x - origin.x
    )
    const velocity = {
        x: Math.cos(angle) * speed, 
        y: Math.sin(angle) * speed
    }
    const projectileSize = size

    projectiles.push( new Projectile( origin.x, origin.y, projectileSize, 'white', velocity) );            
    if (origin.numberOfProjectiles !== undefined) origin.numberOfProjectiles++
}

addEventListener('click', (e) => createProjectile(player, 5, 10))

window.addEventListener('resize', (e) => {
    e.preventDefault()
    cWidth = canvas.width = innerWidth
    cHeight = canvas.height = innerHeight
    animate(false);
})

addEventListener('mousemove', (e) => {
    mouseCoords = {x: e.clientX, y: e.clientY}
})

/* TODO:
 * Create datastructure which remembers which key was pressed until it is lifted.
 * This will be the basis of movement in the game. Currently if I press 'D' while
 * holding 'W' the 'W' long hold is canceled.
 * 
 * Use: 'keydown' for true
 * Use: 'keyup' for false
 * 
 * 
 */

let keyHolds = []
let action;



const playerSpeed = 5;

addEventListener('keydown', (e) => {

    if (!keyHolds.includes(e.code)) keyHolds.push(e.code)
    console.log(e.code, 'down', keyHolds)

    let moveX = 0
    let moveY = 0

    if (!gameover) {  
        keyHolds.forEach((key, keyIndex) => {
            switch(key) {
                case 'Space': { 
                    createProjectile(player, 5, 4)
                    break
                }
                case 'ArrowRight':
                case 'KeyD': moveX += playerSpeed
                    break
                case 'ArrowLeft':
                case 'KeyA': moveX -= playerSpeed
                    break
                case 'ArrowUp':
                case 'KeyW':  moveY -= playerSpeed
                    break 
                case 'ArrowDown':
                case 'KeyS':  moveY += playerSpeed
                break
                default: 
                    break
            }
        })
        player.update(ctx, moveX, moveY);
    } 
})

addEventListener('keyup', (e) => {

    let index = keyHolds.findIndex(ele => ele === e.code)
    keyHolds.splice(index, 1)
    console.log(e.code, 'up', keyHolds)
    player.update(ctx, 0, 0);
                
        
    
})

animate()
spawnEnemies()