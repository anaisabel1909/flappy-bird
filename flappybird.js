// tela do jogo
let tela;
let larguraTela = 360;
let alturaTela = 640;
let contexto;

// passarinho
let larguraPassaro = 34;
let alturaPassaro = 24;
let passaroX = larguraTela / 8;
let passaroY = alturaTela / 2;
let imagemPassaro;

let passaro = {
    x: passaroX,
    y: passaroY,
    width: larguraPassaro,
    height: alturaPassaro,
};

// animação das asas do passarinho
let quadros = [
    './assets/img/flappybird0.png',
    './assets/img/flappybird1.png',
    './assets/img/flappybird2.png',
    './assets/img/flappybird3.png'
];
let quadroAtual = 0;

// efeitos sonoros
const sons = {
    pulo: new Audio('./assets/sound/sfx_wing.wav'),
    batida: new Audio('./assets/sound/sfx_hit.wav'),
    ponto: new Audio('./assets/sound/sfx_point.wav'),
    morte: new Audio('./assets/sound/sfx_die.wav'),
    musicaFundo: new Audio('./assets/sound/bgm_mario.mp3')
};
sons.musicaFundo.loop = true;

// canos 
let canosArray = [];
let larguraCano = 64;
let alturaCano = 512;
let canoX = larguraTela;
let canoY = 0;
let imagemCanoSuperior;
let imagemCanoInferior;
let idIntervaloCano = null; // guarda a referência do temporizador de criação dos canos

// física
let velocidadeX = -2; // velocidade dos canos indo para a esquerda
let velocidadeY = 0;  // velocidade vertical do passarinho
let gravidade = 0.2;  // gravidade puxando o passarinho para baixo

// estados possíveis: menu, contagem, jogando, fimdejogo
let estadoJogo = 'menu'; 
let pontuacao = 0;
let recorde = parseInt(localStorage.getItem('flappyHighScore')) || 0; // pega o recorde salvo no navegador

// contagem regressiva 
let valorContagem = 3;
let temporizadorContagem = null;

// efeitos visuais
let oscilacaoPassaroMenu = 0;  // usado para fazer o passarinho flutuar no menu
let direcaoPassaroMenu = 1;
let opacidadeFlash = 0;  // controla a transparência do efeito de piscar ao bater

// inicializa o jogo quando a página carrega
window.onload = function () {
    tela = document.getElementById("board");
    tela.width = larguraTela;
    tela.height = alturaTela;
    contexto = tela.getContext("2d");

    // inicializa a imagem do passarinho e cria a animação do passarinho batendo as asas
    imagemPassaro = new Image();
    setInterval(() => {
        imagemPassaro.src = quadros[quadroAtual];
        quadroAtual = (quadroAtual + 1) % quadros.length;
    }, 100);

    // carrega as imagens dos canos
    imagemCanoSuperior = new Image();
    imagemCanoSuperior.src = './assets/img/toppipe.png';

    imagemCanoInferior = new Image();
    imagemCanoInferior.src = './assets/img/bottompipe.png';

    // inicia o loop principal do jogo
    requestAnimationFrame(update);

    // listeners para permitir o movimento do passarinho 
    document.addEventListener("keydown", moverPassaro);
    tela.addEventListener("mousedown", moverPassaro);
};

function desenharPassaro() {
    contexto.save();

    // move o sistema de coordenadas para o centro do pássaro
    contexto.translate(
        passaro.x + passaro.width / 2,
        passaro.y + passaro.height / 2
    );

    // rotação baseada na velocidade
    let angulo = velocidadeY * 0.075;

    // limita os ângulos
    if (angulo > 0.5) {
        angulo = 0.5;
    }
    if (angulo < -0.5) {
        angulo = -0.5;
    }
    contexto.rotate(angulo);

    // desenha o sprite na tela
    contexto.drawImage(
        imagemPassaro,
        -passaro.width / 2,
        -passaro.height / 2,
        passaro.width,
        passaro.height
    );

    contexto.restore();
}

// função auxiliar para desenhar elementos na tela
function desenharElemento(img, elemento) {
    contexto.drawImage(img, elemento.x, elemento.y, elemento.width, elemento.height);
}

function iniciarContagem() {
    estadoJogo = 'contagem';
    valorContagem = 3;
    
    if (temporizadorContagem) clearInterval(temporizadorContagem);
    
    temporizadorContagem = setInterval(() => {
        valorContagem--;
        if (valorContagem < 0) {
            clearInterval(temporizadorContagem);
            comecarJogo();
        }
    }, 1000);
}

function comecarJogo() {
    estadoJogo = 'jogando';
    passaro.y = passaroY;
    velocidadeY = 0;
    canosArray = [];
    pontuacao = 0;

    // inicia música de fundo
    sons.musicaFundo.currentTime = 0;
    sons.musicaFundo.play();

    // evita acumular ids de intervalos antigos
    if (idIntervaloCano) clearInterval(idIntervaloCano);
    // cria um intervalo que repete a chamada da função de geração de canos a cada 1.2seg
    // também salva o id do intervalo para poder encerrá-lo no fim do jogo
    idIntervaloCano = setInterval(gerarCanos, 1200);
}

function fimDeJogo() {
    // if (estadoJogo === 'fimdejogo') return;
    estadoJogo = 'fimdejogo';

    sons.musicaFundo.pause();
    sons.morte.play();

    opacidadeFlash = 0.6; // ativa o flash vermelho na tela
    clearInterval(idIntervaloCano); // Para de gerar novos canos

    // salva o novo recorde no localStorage se a pontuação atual for maior
    if (pontuacao > recorde) {
        recorde = pontuacao;
        localStorage.setItem('flappyHighScore', recorde);
    }
}

function moverPassaro(e) {
    if (e.type === 'keydown') {
        if (e.code !== 'Space') return;
    }

    // ações baseadas no estado atual do jogo
    if (estadoJogo === 'menu') {
        iniciarContagem();
    } 
    else if (estadoJogo === 'jogando') {
        velocidadeY = -5.5; // pulo do passarinho
        sons.pulo.currentTime = 0;
        sons.pulo.play();
    } 
    else if (estadoJogo === 'fimdejogo') {
        // se o jogo acabou, qualquer clique/tecla reinicia para a contagem
        iniciarContagem();
    }
}

function update() {
    requestAnimationFrame(update);
    contexto.clearRect(0, 0, tela.width, tela.height);

    // configuração padrão dos textos
    contexto.fillStyle = 'white';
    contexto.textAlign = "center";
    contexto.shadowColor = 'rgba(0, 0, 0, 0.6)';
    contexto.shadowBlur = 4;

    if (estadoJogo === 'menu') {
        // faz o passarinho flutuar de cima para baixo
        oscilacaoPassaroMenu += 0.05 * direcaoPassaroMenu;
        if (Math.abs(oscilacaoPassaroMenu) > 1) direcaoPassaroMenu *= -1;
        passaro.y = (alturaTela / 2) - 40 + (oscilacaoPassaroMenu * 10);
        
        desenharPassaro();

        contexto.font = "bold 26px sans-serif";
        contexto.fillText("FLAPPY BIRD", larguraTela / 2, alturaTela / 3 + 10);
        
        contexto.font = "16px sans-serif";
        contexto.fillText("Pressione ESPAÇO ou CLIQUE", larguraTela / 2, alturaTela / 2 + 50);
        contexto.fillText("para Iniciar", larguraTela / 2, alturaTela / 2 + 75);

        contexto.fillStyle = '#ffe066';
        contexto.fillText(`RECORDE: ${recorde}`, larguraTela / 2, alturaTela / 2 + 130);
    }

    else if (estadoJogo === 'contagem') {
        passaro.y = passaroY; // mantém o pássaro fixo no centro
        desenharPassaro();

        contexto.font = "bold 70px sans-serif";
        contexto.fillText(valorContagem === 0 ? "VAI!" : valorContagem, larguraTela / 2, alturaTela / 3);
        
        contexto.font = "16px sans-serif";
        contexto.fillText("PREPARA!", larguraTela / 2, alturaTela / 3 + 60);
    }

    else if (estadoJogo === 'jogando' || estadoJogo === 'fimdejogo') {
        
        if (estadoJogo === 'jogando') {
            // aplica a gravidade e atualiza a posição do pássaro
            velocidadeY += gravidade;
            passaro.y = Math.max(passaro.y + velocidadeY, 0); // impede que saia pelo topo

            // verifica se caiu no chão
            if (passaro.y > tela.height) {
                fimDeJogo();
            }
        }

        desenharPassaro();

        // atualiza e desenha os canos
        for (let i = 0; i < canosArray.length; i++) {
            let cano = canosArray[i];
            
            if (estadoJogo === 'jogando') {
                cano.x += velocidadeX; // move os canos para a esquerda
                
                // contabilização dos pontos (0.5 para cada metade do cano, somando 1 ponto por par)
                if (!cano.passou && passaro.x > cano.x + cano.width) {
                    pontuacao += 0.5;
                    sons.ponto.currentTime = 0;
                    sons.ponto.play();
                    cano.passou = true;
                }

                // checa colisão mecânica
                if (detectarColisao(passaro, cano)) {
                    fimDeJogo();
                }
            }
            
            desenharElemento(cano.imagem, cano);
        }

        // remove canos antigos que saíram totalmente da tela esquerda
        while (canosArray.length > 0 && canosArray[0].x < -larguraCano) {
            canosArray.shift();
        }

        // escreve a pontuação atualizada
        contexto.font = "bold 32px sans-serif";
        contexto.fillText(Math.floor(pontuacao), larguraTela / 2, 60);

        // escreve os detalhes no game over
        if (estadoJogo === 'fimdejogo') {
            contexto.fillStyle = '#ff4040';
            contexto.font = "bold 30px sans-serif";
            contexto.fillText("FIM DE JOGO", larguraTela / 2, alturaTela / 3);

            contexto.fillStyle = 'white';
            contexto.font = "16px sans-serif";
            contexto.fillText(`Pontuação: ${Math.floor(pontuacao)}`, larguraTela / 2, alturaTela / 3 + 50);
            contexto.fillText(`Melhor Pontuação: ${recorde}`, larguraTela / 2, alturaTela / 3 + 80);
            
            contexto.fillStyle = '#ffe066';
            contexto.fillText("Clique ou Espaço para reiniciar", larguraTela / 2, alturaTela / 2 + 100);
        }
    }

    // flash vermelho 
    if (opacidadeFlash > 0) {
        contexto.shadowBlur = 0; 
        contexto.fillStyle = `rgba(255, 0, 0, ${opacidadeFlash})`;
        contexto.fillRect(0, 0, larguraTela, alturaTela);
        opacidadeFlash -= 0.04; // dissipa o flash
    }

    // reseta configurações de sombra para evitar vazamento em outros renders
    contexto.shadowBlur = 0;
}

function gerarCanos() {
    if (estadoJogo !== 'jogando') return;

    // escolhendo uma posição Y aleatória para o cano
    let canoAleatorioY = canoY - alturaCano / 4 - Math.random() * (alturaCano / 2);

    // escolhendo um espaçamento aleatório entre os canos de cima e de baixo
    let arrayEspacamento = [4, 5];
    let espacamento = tela.height / arrayEspacamento[Math.floor(Math.random() * 2)];

    // cano superior
    canosArray.push({
        imagem: imagemCanoSuperior,
        x: canoX,
        y: canoAleatorioY,
        width: larguraCano,
        height: alturaCano,
        passou: false
    });

    // cano inferior
    canosArray.push({
        imagem: imagemCanoInferior,
        x: canoX,
        y: canoAleatorioY + alturaCano + espacamento,
        width: larguraCano,
        height: alturaCano,
        passou: false
    });
}

function detectarColisao(a, b) {
    let colisao = a.x < b.x + b.width &&
                  a.x + a.width > b.x &&
                  a.y < b.y + b.height &&
                  a.y + a.height > b.y;

    if (colisao) {
        sons.batida.currentTime = 0;
        sons.batida.play();
    }
    return colisao;
}