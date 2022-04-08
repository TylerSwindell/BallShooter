class Player {
    constructor(x, y, radius, color) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.numberOfProjectiles = 0
        this.killCount = 0
    }

    draw(c) {
        c.beginPath()
        /* X pos, Y pos, radius, angle(360deg), clockwise or ccw (doesn't matter it's a circle)  */
        c.arc(this.x, this.y, this.radius, 0, Math.PI*2, false)
        c.fillStyle = this.color
        c.fill()
    }

    update(c, x, y) {
        for (let i = 0; i < x; i++) {
            console.log(x)
        }
        this.x += x
        this.y += y
        this.draw(c)
    }
}

export default Player;