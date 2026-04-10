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

    // context.fillStyle = 'green'
    // context.fillRect(bird.x, bird.y, bird.width, bird.height)
    
    birdImg = new Image()
    birdImg.src = './assets/img/flappybird.png'
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

    if (bird.y > board.height) {
        gameOver = true
    }
    
    for(let i = 0; i < pipeArray.length; i++){
        let pipe = pipeArray[i]
        pipe.x += velocityX
        draw(pipe.img, pipe)

        if (!pipe.passed && bird.x > pipe.x + pipe.width) {
            score += 0.5 // pq tem dois pipes entao ele faz 0.5*2 
            pipe.passed = true
        }

        if (detectCollision(bird, pipe)) {
            if (score > highestScore) {
                highestScore = score
            }
            gameOver = true
        }
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

        if (gameOver) {
            bird.y = birdY
            pipeArray = []
            score = 0
            gameOver = false
        }
    }
}

function detectCollision(a, b) {
    return a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y +a.height > b.y
}