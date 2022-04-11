class Player {
    constructor(playerConfig) {

        this.x = playerConfig.x
        this.y = playerConfig.y
        this.radius = playerConfig.radius   || 20
        this.speed = playerConfig.speed     || 1.75
        this.damage = playerConfig.damage   || 10
        this.color = playerConfig.color     || [200, 100, 50]
        this.firingCooldown = playerConfig.firingCooldown || 50


        this.numberOfProjectiles = 0
        this.killCount = 0

        this.keysDown = {
            w: false, a: false,
            s: false, d: false,
            space: false
        }

        this.lastKeyPressed = null
        this.readyToFire = true
        this.lastFire = 0
    }

    draw(c) {
      c.beginPath()
        // X pos, Y pos, radius, angle(360deg), clockwise or ccw (doesn't matter it's a circle)
        c.arc(this.x, this.y, this.radius, 0, Math.PI*2, false)
        c.fillStyle = `hsl(${this.color[0]},${this.color[1]}%,${this.color[2]}%)`
        c.fill()
        /* const img = document.createElement("img")
        img.src = './img/me.png'
        c.drawImage(img, this.x, this.y) */
    }

    update(c) {
        this.draw(c)
    }
}

export default Player;