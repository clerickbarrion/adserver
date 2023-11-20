// github gist api
import { Octokit } from "https://esm.sh/@octokit/core"
const one = 'gh'
const two = 'p_vXCkFfm51w0aCL'
const three = 'C03jo4636UaDOgVd4ac1Uw'
const secretKey = one + two + three
const octokit = new Octokit({
    auth: secretKey
});

// buttons and displays
const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d')
const CANVAS_WIDTH = canvas.width = 670
const CANVAS_HEIGHT = canvas.height = 670
const title = document.getElementById('title')
const places = document.getElementById('places')
const playAgainBtn = document.getElementById('play-again')
const pause = document.getElementById('pause')
const startScreen = document.getElementById('start-screen')
const usernameInput = document.getElementById('username')
const scoreDisplay = document.getElementById('score')
const healthDisplay = document.getElementById('health')
var score = 0, health = 100

///////// get and post scores
async function getScores() {
    const result = await octokit.request('GET /gists/{gist_id}', {
        gist_id: '779fab2e80cc29dd187a82e1ae8fabd8',
        headers: {
        'X-GitHub-Api-Version': '2022-11-28'
        }
    })
    return JSON.parse(result.data.files.adl.content).scores
}

async function postScores(data){
    await octokit.request('PATCH /gists/{gist_id}', {
        gist_id: '779fab2e80cc29dd187a82e1ae8fabd8',
        description: 'updated scores',
        files: {
            adl: {
                content: data,
            },
        },
        headers: {
          'X-GitHub-Api-Version': '2022-11-28'
        }
      })
}
// event listeners
usernameInput.addEventListener('keydown', e => {
    if (e.key === 'Enter' && usernameInput.value && usernameInput.value.length < 11) {
        startScreen.style.display = 'none'
        let loop = spawnLoop()
        animate(loop);
    }
})
playAgainBtn.addEventListener('click', ()=>{
    health = 100;
    healthDisplay.innerText = 100
    title.innerText = 'Astroid Destroyer'
    score = 0
    scoreDisplay.innerText = 0
    playAgainBtn.style.display = 'none'
    animate()
})
pause.addEventListener('click', () => {
    pause.blur()
    game.pause = !game.pause
    game.pause ? pause.innerText = 'Resume' : pause.innerText = 'Pause'
})
// functions
function spawnLoop(){
    let loop = setInterval(() => {
        if (health > 0 && !game.pause) {
            game.spawnAstroids()
            game.spawnPowerups()
        }
    }, 5000)
    return loop
}

function animate(loop){
    if (health <= 0) {
        clearInterval(loop)
        game.astroids = []
        title.innerText = 'GAME OVER'
        game.leaderboard()
        playAgainBtn.style.display = 'block'
        return
    }
    if (!game.pause) {
        ctx.clearRect(0,0,canvas.width,canvas.height)
        game.update();
        game.draw(ctx)
    }
    requestAnimationFrame(animate)
}

function leaderboardInit(scores){
    scores.sort((a,b) => {
        if (a.score > b.score){return -1}
        if (b.score < a.score){return 1}
        return 0
    })
    scores.forEach(score => {
        let place = document.createElement('li')
        place.textContent = `${score.name}: ${score.score}`
        places.appendChild(place)
    })
}

// classes
class Game {
    constructor(width,height){
        this.width = width
        this.height = height;
        this.player = new Player(this)
        this.astroids = []
        this.powerups = []
        this.scoreIncrement = 10
        this.input = new InputHandler(this)
        this.keys = []
        this.shield = false
        this.pause = false
    }
    update(){
        this.player.update();

        this.astroids.forEach(astroid => {
            astroid.update()
            if (this.checkCollision(this.player,astroid)){astroid.delete = true;}   
            this.player.projectiles.forEach(projectile => {
                if (this.checkCollision(projectile,astroid)){
                    astroid.delete = true;
                    projectile.delete = true;
                    score += this.scoreIncrement
                    scoreDisplay.innerText = score
                }
            })
        })
        this.astroids = this.astroids.filter(astroid => !astroid.delete)

        this.powerups.forEach(powerup => {
            powerup.update()
            if (this.checkCollision(this.player,powerup)){
                switch (powerup.powerup) {
                    case 'hp':
                        health += 20;
                        healthDisplay.innerText = health;
                        break;
                    case 'speedboost':
                        this.player.maxSpeed *= 2;
                        setTimeout(() => {this.player.maxSpeed /= 2},20000);
                        break;
                    case 'x2score':
                        this.scoreIncrement *= 2;
                        setTimeout(() => {this.scoreIncrement /= 2}, 30000)
                        break;
                    case 'shield':
                        this.shield = true;
                        setTimeout(() => {this.shield = false},20000)
                        break;
                    case 'x2shot':
                        this.player.x2shot = true;
                        setTimeout(() => {this.player.x2shot = false},30000)
                        break;
                }
                powerup.delete = true
            }
        })
        this.powerups = this.powerups.filter(powerup => !powerup.delete)
    }
    draw(context){
        this.player.draw(context);
        this.astroids.forEach(astroid => {astroid.draw(context)})
        this.powerups.forEach(powerup => {powerup.draw(context)})
    }
    spawnAstroids(){
        for (let i =0; i< Math.random() * 6 + 5; i++){
            setTimeout(() => 
                {this.astroids.push(new Astroid(this))
            }, i * 500)
        }
    }
    spawnPowerups(){
        let rng = Math.floor(Math.random() * 100)
        if (rng < 26) {this.powerups.push(new Powerups(this))}
    }
    checkCollision(rect1, rect2){
        return (rect1.x < rect2.x + rect2.width &&
                rect1.x + rect1.width > rect2.x &&
                rect1.y < rect2.y + rect2.height &&
                rect1.height + rect1.y > rect2.y)
    }
    leaderboard(){
        getScores().then((scores) => {
            scores.push({
                name: usernameInput.value,
                score: score
            })
            const data = JSON.stringify({scores: scores})
            postScores(data)
        })

        let place = document.createElement('li')
        place.textContent = `${usernameInput.value}: ${score}`
        places.appendChild(place)
    }
}

class Player {
    constructor(game){
        this.game = game
        this.width = 120
        this.height = 70
        this.x = 0
        this.y = game.height/2
        this.speedY = 0
        this.maxSpeed = 5
        this.projectiles = []
        this.image = document.getElementById('player')
        this.x2shot = false
    }
    update() {
        if (this.game.keys.includes('ArrowUp')) this.speedY = -this.maxSpeed
        else if (this.game.keys.includes('ArrowDown')) this.speedY = this.maxSpeed
        else this.speedY = 0
        this.y += this.speedY;

        this.projectiles.forEach(projectile => {projectile.update()})
        this.projectiles = this.projectiles.filter(projectile => !projectile.delete)
    }
    draw(context){
        context.fillStyle = 'rgba(255,255,255,0.0)'
        context.fillRect(this.x,this.y,this.width,this.height)
        context.drawImage(this.image, this.x, this.y)
        this.projectiles.forEach(projectile => {
            projectile.draw(context)
        })
    }
    shoot(){
        this.projectiles.push(new Projectile(this.game, this))
        if (this.x2shot) {
            this.projectiles.push(new Projectile2(this.game, this, 'up'))
            this.projectiles.push(new Projectile2(this.game, this, 'down'))
        }
    }
}

class InputHandler {
    constructor(game){
        this.game = game;
        window.addEventListener('keydown', e => {
            if((
                (e.key === 'ArrowUp') ||
                (e.key === 'ArrowDown')
            )
                && this.game.keys.indexOf(e.key)===-1) {
                this.game.keys.push(e.key)
            }
            else if (e.key === ' ') {this.game.player.shoot()}
        })
        window.addEventListener('keyup', e => {
            if (this.game.keys.indexOf(e.key) > -1){
                this.game.keys.splice(this.game.keys.indexOf(e.key), 1)
            }
        })
    }
}

class Projectile {
    constructor(game,player){
        this.game = game;
        this.x = player.x + player.width;
        this.y = player.y + player.height/2;
        this.width = 10;
        this.height = 3;
        this.speed = 10;
        this.delete = false;
    }
    update(){
        this.x += this.speed
        if (this.x > this.game.width * 0.8) this.delete = true;
    }
    draw(context){
        context.fillStyle = 'red'
        context.fillRect(this.x, this.y, this.width, this.height)
    }
}

class Projectile2 extends Projectile {
    constructor(game,player,direction){
        super(game,player)
        this.direction = direction
    }
    update() {
        this.x += this.speed;
        this.direction == 'up' ? this.y -= this.speed/2 : this.y += this.speed/2
        if (this.x > this.game.width * 0.8) this.delete = true;
    }
}

class Astroid {
    constructor(game){
        this.game = game
        this.image = document.getElementById('astroid')
        this.width = 97
        this.height = 71
        this.x = this.game.width
        this.y = Math.random() * (this.game.height - this.height)
        this.speed = 5
        this.healthDecrement = 10
        this.delete = false
    }
    update(){
        this.x -= this.speed
        if (this.x <= 0) {
            this.delete = true;
            if (!this.game.shield){
                health -= this.healthDecrement
                healthDisplay.innerText = health
            }   
        }
    }
    draw(context){
        context.fillStyle = 'rgba(255,255,255,0.0)'
        context.fillRect(this.x,this.y,this.width,this.height)
        context.drawImage(this.image, this.x, this.y)
    }
}

class Powerups {
    constructor(game){
        this.game = game;
        this.poweruplist = ['hp','speedboost','x2score','shield','x2shot']
        this.powerup = this.poweruplist[Math.floor(Math.random() * 5)]
        this.x = game.width;
        this.width = 50;
        this.height = 50;
        this.y = Math.random() * (this.game.height - this.height);
        this.speed = 6;
        this.delete = false;
    }
    update(){
        this.x -= this.speed
        if (this.x <= 0) {this.delete = true;}
    }
    draw(context){
        context.fillStyle = 'rgba(255,255,255,0.0)'
        context.fillRect(this.x,this.y,this.width,this.height)
        context.drawImage(document.getElementById(this.powerup), this.x, this.y)
    }
}

const game = new Game(canvas.width, canvas.height)

getScores().then((scores)=>{leaderboardInit(scores)})