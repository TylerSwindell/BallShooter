class Enemy {
    constructor(x, y, radius, color, velocity, c) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
        this.speed = this.setSpeed()
    }

    draw(c) {
        c.beginPath()
        /* X pos, Y pos, radius, angle(360deg), clockwise or ccw (doesn't matter it's a circle)  */
        c.arc(this.x, this.y, this.radius, 0, Math.PI*2, false)
        c.fillStyle = this.color
        c.fill()
    }

    setSpeed() {
        if (this.radius < 10) return 2
        if (this.radius < 20) return 1.75
        if (this.radius < 30) return 1.50
        if (this.radius < 40) return 1.25
        return 1
    }

    update(c) {
        this.draw(c)
        this.x = this.x + (this.velocity.x * this.speed)
        this.y = this.y + (this.velocity.y * this.speed)
    }
}

export default Enemy;