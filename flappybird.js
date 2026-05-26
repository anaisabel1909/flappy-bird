// ─── CONFIGURAÇÕES E VARIÁVEIS DO JOGO ───────────────────────────────────────

// Board (Tela do jogo)
let board;
let boardWidth = 360;
let boardHeight = 640;
let context;

// Bird (Passarinho)
let birdWidth = 34;
let birdHeight = 24;
let birdX = boardWidth / 8;
let birdY = boardHeight / 2;
let birdImg;

let bird = {
    x: birdX,
    y: birdY,
    width: birdWidth,
    height: birdHeight,
};

// Animação das asas do passarinho
let frames = [
    './assets/img/flappybird0.png',
    './assets/img/flappybird1.png',
    './assets/img/flappybird2.png',
    './assets/img/flappybird3.png'
];
let currentFrame = 0;

// Efeitos Sonoros
const sounds = {
    jump: new Audio('./assets/sound/sfx_wing.wav'),
    hit: new Audio('./assets/sound/sfx_hit.wav'),
    point: new Audio('./assets/sound/sfx_point.wav'),
    die: new Audio('./assets/sound/sfx_die.wav'),
    bgm: new Audio('./assets/sound/bgm_mario.mp3')
};
sounds.bgm.loop = true;

// Pipes (Canos)
let pipeArray = [];
let pipeWidth = 64;
let pipeHeight = 512;
let pipeX = boardWidth;
let pipeY = 0;
let topPipeImg;
let bottomPipeImg;
let pipeIntervalId = null; // Guarda a referência do temporizador dos canos

// Física e Estados do Jogo
let velocityX = -2; // Velocidade dos canos indo para a esquerda
let velocityY = 0;  // Velocidade vertical do passarinho
let gravity = 0.2;  // Força da gravidade puxando o passarinho para baixo

// Estados possíveis: 'menu' | 'countdown' | 'playing' | 'gameover'
let gameState = 'menu'; 
let score = 0;
let highestScore = parseInt(localStorage.getItem('flappyHighScore')) || 0; // Recupera o recorde salvo no navegador

// Contagem Regressiva e Efeitos Visuais
let countdownValue = 3;
let countdownTimer = null;
let menuBirdOffset = 0;   // Usado para fazer o passarinho flutuar no menu
let menuBirdDir = 1;
let flashAlpha = 0;       // Controla a transparência do efeito de piscar ao bater

// ─── INICIALIZAÇÃO DO JOGO ──────────────────────────────────────────────────

window.onload = function () {
    board = document.getElementById("board");
    board.width = boardWidth;
    board.height = boardHeight;
    context = board.getContext("2d");

    // Inicializa a imagem do passarinho com troca de frames (Animação)
    birdImg = new Image();
    setInterval(() => {
        birdImg.src = frames[currentFrame];
        currentFrame = (currentFrame + 1) % frames.length;
    }, 100);

    // Carrega as imagens dos canos
    topPipeImg = new Image();
    topPipeImg.src = './assets/img/toppipe.png';

    bottomPipeImg = new Image();
    bottomPipeImg.src = './assets/img/bottompipe.png';

    // Inicia o loop principal do Canvas
    requestAnimationFrame(update);

    // Ouvintes de eventos (Teclado, Clique do Mouse e Toque em telas mobile)
    document.addEventListener("keydown", moveBird);
    board.addEventListener("mousedown", moveBird);
    board.addEventListener("touchstart", (e) => {
        e.preventDefault(); // Evita o zoom ou scroll indesejado em celulares
        moveBird(e);
    }, { passive: false });
};

// Auxiliar para desenhar elementos facilmente no Canvas
function drawElement(img, element) {
    context.drawImage(img, element.x, element.y, element.width, element.height);
}

// ─── TRANSIÇÕES DE ESTADO (LÓGICA) ──────────────────────────────────────────

function startCountdown() {
    gameState = 'countdown';
    countdownValue = 3;
    
    if (countdownTimer) clearInterval(countdownTimer);
    
    // Decrementa o número a cada 900ms
    countdownTimer = setInterval(() => {
        countdownValue--;
        if (countdownValue < 0) {
            clearInterval(countdownTimer);
            beginGame();
        }
    }, 900);
}

function beginGame() {
    gameState = 'playing';
    bird.y = birdY;
    velocityY = 0;
    pipeArray = [];
    score = 0;

    // Toca a música de fundo
    sounds.bgm.currentTime = 0;
    sounds.bgm.play();

    // Começa a gerar os canos periodicamente
    if (pipeIntervalId) clearInterval(pipeIntervalId);
    pipeIntervalId = setInterval(placePipes, 1200);
}

function triggerGameOver() {
    if (gameState === 'gameover') return;
    gameState = 'gameover';

    sounds.bgm.pause();
    sounds.die.play();

    flashAlpha = 0.6; // Ativa o flash vermelho na tela
    clearInterval(pipeIntervalId); // Para de gerar novos canos

    // Salva o novo Recorde localmente se o score atual for maior
    if (score > highestScore) {
        highestScore = score;
        localStorage.setItem('flappyHighScore', highestScore);
    }
}

// ─── ENTRADA DO USUÁRIO (CONTROLES) ──────────────────────────────────────────

function moveBird(e) {
    // Se for teclado, filtra apenas as teclas de pulo configuradas originalmente
    if (e.type === 'keydown') {
        if (e.code !== 'Space' && e.code !== 'ArrowUp' && e.code !== 'KeyX') return;
    }

    // Ações baseadas no estado atual do jogo
    if (gameState === 'menu') {
        startCountdown();
    } 
    else if (gameState === 'playing') {
        velocityY = -5.5; // Pulo do passarinho
        sounds.jump.currentTime = 0;
        sounds.jump.play();
    } 
    else if (gameState === 'gameover') {
        // Se o jogo acabou, qualquer clique/tecla reinicia para a contagem
        startCountdown();
    }
}

// ─── LOOP PRINCIPAL E RENDERIZAÇÃO (CANVAS) ─────────────────────────────────

function update() {
    requestAnimationFrame(update);
    context.clearRect(0, 0, board.width, board.height);

    // CONFIGURAÇÃO DE TEXTO PADRÃO
    context.fillStyle = 'white';
    context.textAlign = "center";
    context.shadowColor = 'rgba(0, 0, 0, 0.6)';
    context.shadowBlur = 4;

    // ESTADO: MENU INICIAL
    if (gameState === 'menu') {
        // Faz o passarinho flutuar de cima para baixo suavemente
        menuBirdOffset += 0.05 * menuBirdDir;
        if (Math.abs(menuBirdOffset) > 1) menuBirdDir *= -1;
        bird.y = (boardHeight / 2) - 40 + (menuBirdOffset * 10);
        
        drawElement(birdImg, bird);

        context.font = "bold 26px sans-serif";
        context.fillText("FLAPPY BIRD", boardWidth / 2, boardHeight / 3 + 10);
        
        context.font = "16px sans-serif";
        context.fillText("Pressione ESPAÇO ou CLIQUE", boardWidth / 2, boardHeight / 2 + 50);
        context.fillText("para Iniciar", boardWidth / 2, boardHeight / 2 + 75);

        context.fillStyle = '#ffe066';
        context.fillText(`RECORDE: ${highestScore}`, boardWidth / 2, boardHeight / 2 + 130);
    }

    // ESTADO: CONTAGEM REGRESSIVA
    else if (gameState === 'countdown') {
        bird.y = birdY; // Mantém o pássaro fixo no centro
        drawElement(birdImg, bird);

        context.font = "bold 70px sans-serif";
        context.fillText(countdownValue === 0 ? "GO!" : countdownValue, boardWidth / 2, boardHeight / 3);
        
        context.font = "16px sans-serif";
        context.fillText("PREPARA!", boardWidth / 2, boardHeight / 3 + 60);
    }

    // ESTADO: JOGANDO OU GAME OVER
    else if (gameState === 'playing' || gameState === 'gameover') {
        
        if (gameState === 'playing') {
            // Aplica a gravidade e atualiza a posição do pássaro
            velocityY += gravity;
            bird.y = Math.max(bird.y + velocityY, 0); // Impede que saia pelo topo

            // Verifica se caiu no chão
            if (bird.y > board.height) {
                triggerGameOver();
            }
        }

        drawElement(birdImg, bird);

        // Atualiza e desenha os Canos
        for (let i = 0; i < pipeArray.length; i++) {
            let pipe = pipeArray[i];
            
            if (gameState === 'playing') {
                pipe.x += velocityX; // Move os canos para a esquerda
                
                // Contabilização de pontos (0.5 para cada metade do cano, somando 1 ponto por par)
                if (!pipe.passed && bird.x > pipe.x + pipe.width) {
                    score += 0.5;
                    sounds.point.currentTime = 0;
                    sounds.point.play();
                    pipe.passed = true;
                }

                // Checa colisão mecânica
                if (detectCollision(bird, pipe)) {
                    triggerGameOver();
                }
            }
            
            drawElement(pipe.img, pipe);
        }

        // Remove canos antigos que saíram totalmente da tela esquerda
        while (pipeArray.length > 0 && pipeArray[0].x < -pipeWidth) {
            pipeArray.shift();
        }

        // Desenha o Score atualizado centralizado no topo da tela
        context.font = "bold 32px sans-serif";
        context.fillText(Math.floor(score), boardWidth / 2, 60);

        // Detalhes extras se for GAME OVER
        if (gameState === 'gameover') {
            context.fillStyle = '#ff4040';
            context.font = "bold 30px sans-serif";
            context.fillText("GAME OVER", boardWidth / 2, boardHeight / 3);

            context.fillStyle = 'white';
            context.font = "16px sans-serif";
            context.fillText(`Pontuação: ${Math.floor(score)}`, boardWidth / 2, boardHeight / 3 + 50);
            context.fillText(`Melhor Pontuação: ${highestScore}`, boardWidth / 2, boardHeight / 3 + 80);
            
            context.fillStyle = '#ffe066';
            context.fillText("Clique ou Espaço para reiniciar", boardWidth / 2, boardHeight / 2 + 100);
        }
    }

    // EFEITO VISUAL: FLASH DE COLISÃO VERMELHO
    if (flashAlpha > 0) {
        context.shadowBlur = 0; // Remove sombras para o preenchimento total da tela
        context.fillStyle = `rgba(255, 0, 0, ${flashAlpha})`;
        context.fillRect(0, 0, boardWidth, boardHeight);
        flashAlpha -= 0.04; // Dissipa o flash gradativamente
    }

    // Reseta configurações de sombra para evitar vazamento em outros renders
    context.shadowBlur = 0;
}

// ─── GERADOR DE CANOS E DETECTOR DE COLISÃO ──────────────────────────────────

function placePipes() {
    if (gameState !== 'playing') return;

    let randomPipeY = pipeY - pipeHeight / 4 - Math.random() * (pipeHeight / 2);

    let openingSpaceArray = [4, 5]
    let openingSpace = board.height / openingSpaceArray[Math.floor(Math.random() * 2)];

    // Cano Superior
    pipeArray.push({
        img: topPipeImg,
        x: pipeX,
        y: randomPipeY,
        width: pipeWidth,
        height: pipeHeight,
        passed: false
    });

    // Cano Inferior
    pipeArray.push({
        img: bottomPipeImg,
        x: pipeX,
        y: randomPipeY + pipeHeight + openingSpace,
        width: pipeWidth,
        height: pipeHeight,
        passed: false
    });
}

function detectCollision(a, b) {
    let collision = a.x < b.x + b.width &&
                    a.x + a.width > b.x &&
                    a.y < b.y + b.height &&
                    a.y + a.height > b.y;

    if (collision) {
        sounds.hit.currentTime = 0;
        sounds.hit.play();
    }
    return collision;
}