// github git api
import { Octokit } from "https://esm.sh/@octokit/core"
const octokit = new Octokit({
    auth: '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'
});

// buttons and displays
const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d')
const CANVAS_WIDTH = canvas.width = 720;
const CANVAS_HEIGHT = canvas.height = 720;
const title = document.getElementById('title')
const places = document.getElementById('places')
const playAgainBtn = document.getElementById('play-again')
const startScreen = document.getElementById('start-screen')
const usernameInput = document.getElementById('username')
const scoreDisplay = document.getElementById('score')
const healthDisplay = document.getElementById('health')
var score = 0, health = 100

///////// get and post scores
const result = await octokit.request('GET /gists/{gist_id}', {
    gist_id: '779fab2e80cc29dd187a82e1ae8fabd8',
    headers: {
    'X-GitHub-Api-Version': '2022-11-28'
    }
})
var scores = JSON.parse(result.data.files.adl.content).scores

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
    if (e.key === 'Enter') {
        startScreen.style.display = 'none'
        let loop = spawnLoop()
        animate(loop);
    }
})
playAgainBtn.addEventListener('click', ()=>{
    health = 100;
    healthDisplay.innerText = Number('100')
    title.innerText = 'Astroid Destroyer'
    score = 0
    scoreDisplay.innerText = Number('0')
    playAgainBtn.style.display = 'none'
    animate()
})
// functions
function spawnLoop(){
    let loop = setInterval(() => {
        if (health > 0) {game.spawnAstroids()}
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
    ctx.clearRect(0,0,canvas.width,canvas.height)
    game.update();
    game.draw(ctx)
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
    return scores
}

// classes
class Game {
    constructor(width,height){
        this.width = width
        this.height = height;
        this.player = new Player(this)
        this.astroids = []
        this.input = new InputHandler(this)
        this.keys = []
    }
    update(){
        this.player.update();
        this.astroids.forEach(astroid => {
            astroid.update()
            if (this.checkCollision(this.player,astroid)){
                astroid.delete = true;
            }
            this.player.projectiles.forEach(projectile => {
                if (this.checkCollision(projectile,astroid)){
                    astroid.delete = true;
                    projectile.delete = true;
                    score += 10
                    scoreDisplay.innerText = score
                }
            })
        })
        this.astroids = this.astroids.filter(astroid => !astroid.delete)
    }
    draw(context){
        this.player.draw(context);
        this.astroids.forEach(astroid => {
            astroid.draw(context)
        })
    }
    spawnAstroids(){
    for (let i =0; i<5; i++){
            setTimeout(() => 
                {this.astroids.push(new Astroid(this))
            }, i * 500)
        }
    }
    checkCollision(rect1, rect2){
        return (rect1.x < rect2.x + rect2.width &&
                rect1.x + rect1.width > rect2.x &&
                rect1.y < rect2.y + rect2.height &&
                rect1.height + rect1.y > rect2.y)
    }
    leaderboard(){
        scores.push({
            name: usernameInput.value,
            score: score
        })
        const data = JSON.stringify({scores: scores})
        postScores(data)

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
    }
    update() {
        if (this.game.keys.includes('ArrowUp')) this.speedY = -this.maxSpeed
        else if (this.game.keys.includes('ArrowDown')) this.speedY = this.maxSpeed
        else this.speedY = 0
        this.y += this.speedY;

        this.projectiles.forEach(projectile => {
            projectile.update()
        })
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
        this.projectiles.push(new Projectile(this.game, this.x,this.y))
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
    constructor(game,x,y){
        this.game = game;
        this.x = x;
        this.y = y;
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
        context.fillRect(this.x + 120, this.y + this.height + 30, this.width, this.height)
    }
}

class Astroid {
    constructor(game){
        this.game = game
        this.image = document.getElementById('astroid')
        this.x = game.width
        this.y = Math.random() * game.height
        this.width = 97
        this.height = 71
        this.speed = 5
        this.delete = false
    }
    update(){
        this.x -= this.speed
        if (this.x <= 0) {
            this.delete = true;
            health -= 5
            healthDisplay.innerText = health
        }
    }

    draw(context){
        context.fillStyle = 'rgba(255,255,255,0.0)'
        context.fillRect(this.x,this.y,this.width,this.height)
        context.drawImage(this.image, this.x, this.y)
    }
}

const game = new Game(canvas.width, canvas.height)

leaderboardInit(scores)