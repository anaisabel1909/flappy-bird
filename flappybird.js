// board
let board
let boardWidth = 360
let boardHeight = 640
let context 

// bird
let birdWidth = 34
let birdHeight = 24
let birdX = boardWidth/8  
let birdY = boardHeight/2
let birdImg

let bird= {
    x: birdX,
    y: birdY,
    width: birdWidth,
    height: birdHeight,
}

let frames = [
    './assets/img/flappybird0.png',
    './assets/img/flappybird1.png',
    './assets/img/flappybird2.png',
    './assets/img/flappybird3.png'
]

let currentFrame = 0

// sound effects 
const sounds = {
  jump: new Audio('./assets/sound/sfx_wing.wav'),
  hit: new Audio('./assets/sound/sfx_hit.wav'),
  point: new Audio('./assets/sound/sfx_point.wav'),
  die: new Audio('./assets/sound/sfx_die.wav')
}

// pipes
let pipeArray = []
let pipeWidth = 64
let pipeHeight = 512
let pipeX = boardWidth
let pipeY = 0
let topPipeImg
let bottomPipeImg


// physics 
let velocityX = -2 //pipes moving left speed
let velocityY = 0
let gravity = 0.2

let gameOver = false
let score = 0
let highestScore = 0

window.onload = function() {
    board = document.getElementById("board")
    board.width = boardWidth
    board.height = boardHeight
    context = board.getContext("2d")
    
    birdImg = new Image()
    setInterval(() => {
        birdImg.src = frames[currentFrame]
        currentFrame = (currentFrame + 1) % frames.length
    }, 100)
    birdImg.onload = function() {
        draw(birdImg, bird)
    }

    topPipeImg = new Image()
    topPipeImg.src = './assets/img/toppipe.png'

    bottomPipeImg = new Image()
    bottomPipeImg.src = './assets/img/bottompipe.png'

    requestAnimationFrame(update)
    setInterval(placePipes, 1500)
    document.addEventListener("keydown", moveBird)
}

function draw(img, element) {
    context.drawImage(img, element.x, element.y, element.width, element.height)
}

function update() {

    requestAnimationFrame(update)
    if (gameOver) {
        return
    }
    context.clearRect(0, 0, board.width, board.height)
    
    velocityY += gravity
    bird.y = Math.max(bird.y += velocityY, 0)

    draw(birdImg, bird)

    if (bird.y > board.height && !gameOver) {
        // sounds.die.currentTime = 0
        sounds.die.play()
        gameOver = true
    }
    
    for(let i = 0; i < pipeArray.length; i++){
        let pipe = pipeArray[i]
        pipe.x += velocityX
        draw(pipe.img, pipe)

        if (!pipe.passed && bird.x > pipe.x + pipe.width) {
            score += 0.5 // pq tem dois pipes entao ele faz 0.5*2 
            sounds.point.currentTime = 0
            sounds.point.play()
            pipe.passed = true
        }

        if (detectCollision(bird, pipe)) {
            gameOver = true
        }
    }

    if (gameOver)
    if (score > highestScore) {
                highestScore = score
            }

    while (pipeArray.length > 0 && pipeArray[0].x < -pipeWidth) {
        pipeArray.shift()
    }

    // score
    context.fillStyle = 'white'
    context.font = "20px sans-serif"
    context.fillText(score, 5, 45)

    if (gameOver) {
        context.fillText("GAME OVER", 5, 90)
        context.fillText(`HIGHEST SCORE: ${highestScore}`, 5, 150)
    }
}

function placePipes() {
    if (gameOver) {
        return
    }

    let randomPipeY = pipeY - pipeHeight/4 - Math.random()*(pipeHeight/2)
    let openingSpace = board.height/4
    
    let topPipe = {
        img: topPipeImg,
        x: pipeX,
        y: randomPipeY,
        width: pipeWidth,
        height: pipeHeight,
        passed: false
    }

    pipeArray.push(topPipe)

    let bottomPipe = {
        img: bottomPipeImg,
        x: pipeX,
        y: randomPipeY + pipeHeight + openingSpace,
        width: pipeWidth,
        height: pipeHeight,
        passed: false
    }

    pipeArray.push(bottomPipe)
}

function moveBird(e) {
    if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyX') {
        velocityY = -6
        sounds.jump.currentTime = 0
        sounds.jump.play()

        if (gameOver) {
            bird.y = birdY
            pipeArray = []
            score = 0
            gameOver = false
        }
    }
}

function detectCollision(a, b) {
    let collision = a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y +a.height > b.y

    if (collision) {
        sounds.hit.currentTime = 0
        sounds.hit.play()
    }

    return collision 
}