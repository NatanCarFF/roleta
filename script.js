// Seleciona os elementos do DOM uma vez no início
const roletaElement = document.getElementById('roletaElement');
const botaoGirar = document.getElementById('botaoGirar');
const resultadoPremio = document.getElementById('resultado-premio');
const luzesContainer = document.getElementById('luzesRoletaContainer');
const cenarioParque = document.getElementById('cenarioParque');
const dynamicKeyframesStyleSheet = document.getElementById('dynamicRoletaKeyframes');

// --- Configurações da Roleta ---
const tiposDePremios = [
    "DINHEIRO", "VAZIO", "DINHEIRO", "VAZIO",
    "DINHEIRO", "VAZIO", "DINHEIRO", "VAZIO"
];
// Substitua pela URL da sua imagem de dinheiro
const urlImagemDinheiro = 'https://cdn-icons-png.flaticon.com/128/3135/3135706.png'; 

const numSegmentos = tiposDePremios.length;
const anguloPorSegmento = 360 / numSegmentos;
let currentRotation = 0; // Rastreia o ângulo absoluto da roleta
let girando = false;
const corDinheiro = "#FFA726";
const corVazioRoleta = "#fff0d9"; // Um tom um pouco diferente do fundo do body para os segmentos vazios

// --- Inicialização Visual ---
function inicializarRoleta() {
    // Aplica a rotação inicial se houver (para giros subsequentes)
    roletaElement.style.transform = `rotate(${currentRotation}deg)`;

    // 1. Gerar o conic-gradient para o fundo da roleta
    let gradientString = 'conic-gradient(';
    for (let i = 0; i < numSegmentos; i++) {
        const cor = tiposDePremios[i] === "DINHEIRO" ? corDinheiro : corVazioRoleta;
        const inicioAngulo = i * anguloPorSegmento;
        const fimAngulo = (i + 1) * anguloPorSegmento;
        gradientString += `${cor} ${inicioAngulo}deg ${fimAngulo}deg`;
        if (i < numSegmentos - 1) gradientString += ', ';
    }
    gradientString += ')';
    roletaElement.style.background = gradientString;

    // 2. Adicionar os visuais dos prêmios (imagens)
    // Certifique-se que roletaElement.offsetWidth tenha um valor válido.
    // Isso é mais confiável dentro de DOMContentLoaded ou se o script é 'defer'.
    const raioRoleta = roletaElement.offsetWidth / 2; 
    const distanciaElementoDoCentro = raioRoleta * 0.62;
    
    // Limpar prêmios antigos antes de adicionar novos (caso esta função seja chamada mais de uma vez)
    roletaElement.innerHTML = ''; 

    tiposDePremios.forEach((tipo, index) => {
        if (tipo === "VAZIO") return; // Pula se for vazio

        const premioDiv = document.createElement('div');
        premioDiv.classList.add('premio-visual');

        if (tipo === "DINHEIRO") {
            const img = document.createElement('img');
            img.src = urlImagemDinheiro;
            img.alt = 'Prêmio em Dinheiro';
            premioDiv.appendChild(img);
        }

        const anguloCentroSegmentoDeg = (index * anguloPorSegmento) + (anguloPorSegmento / 2);
        const anguloCentroSegmentoRad = anguloCentroSegmentoDeg * (Math.PI / 180);
        const x = Math.cos(anguloCentroSegmentoRad) * distanciaElementoDoCentro;
        const y = Math.sin(anguloCentroSegmentoRad) * distanciaElementoDoCentro;
        
        let rotacaoDeg = anguloCentroSegmentoDeg;
        if (anguloCentroSegmentoDeg > 90 && anguloCentroSegmentoDeg < 270) {
             rotacaoDeg += 180; // Para não ficar de cabeça para baixo
        }

        premioDiv.style.left = `calc(50% + ${x}px)`;
        premioDiv.style.top = `calc(50% + ${y}px)`;
        premioDiv.style.transform = `translate(-50%, -50%) rotate(${rotacaoDeg}deg)`;
        roletaElement.appendChild(premioDiv);
    });

    // 3. Adicionar Luzes LED ao redor da roleta (apenas uma vez)
    if (luzesContainer.children.length === 0) {
        const numLuzes = 24;
        const raioLuzes = (roletaElement.offsetWidth / 2) + 10; 
        for (let i = 0; i < numLuzes; i++) {
            const luzDiv = document.createElement('div');
            luzDiv.classList.add('luz-led');
            luzDiv.classList.add(i % 2 === 0 ? 'grupo-a' : 'grupo-b');
            const anguloLuzDeg = (i / numLuzes) * 360;
            const anguloLuzRad = anguloLuzDeg * (Math.PI / 180);
            const xLuz = Math.cos(anguloLuzRad) * raioLuzes;
            const yLuz = Math.sin(anguloLuzRad) * raioLuzes;
            luzDiv.style.left = `calc(50% + ${xLuz}px)`;
            luzDiv.style.top = `calc(50% + ${yLuz}px)`;
            luzDiv.style.transform = `translate(-50%, -50%)`;
            luzesContainer.appendChild(luzDiv);
        }
    }

    // 4. Adicionar Estrelas ao Cenário (apenas uma vez)
    if (cenarioParque.querySelectorAll('.estrelas').length === 0) {
        const numEstrelas = 50;
        for (let i = 0; i < numEstrelas; i++) {
            const estrela = document.createElement('div');
            estrela.classList.add('estrelas');
            estrela.style.left = `${Math.random() * 100}%`;
            estrela.style.top = `${Math.random() * 100}%`;
            estrela.style.animationDelay = `${Math.random() * 3}s`;
            estrela.style.transform = `scale(${Math.random() * 0.5 + 0.5})`;
            cenarioParque.appendChild(estrela);
        }
    }
}

// Chamar inicialização quando o DOM estiver pronto e os tamanhos forem calculados
window.addEventListener('DOMContentLoaded', inicializarRoleta);


// --- Lógica de Giro ---
botaoGirar.addEventListener('click', () => {
    if (girando) return;
    girando = true;
    botaoGirar.disabled = true;
    resultadoPremio.textContent = 'Sorteando...';

    const indiceSorteado = Math.floor(Math.random() * numSegmentos);
    
    // --- Cálculo dos Ângulos para a Animação de 10s ---
    const anguloDePartidaAnim = currentRotation; 

    // Fase Rápida (primeiros 5s)
    const voltasFaseRapida = Math.floor(Math.random() * 5) + 10; // 10-14 voltas
    const anguloKeyframe50 = anguloDePartidaAnim + (voltasFaseRapida * 360);

    // Fase Lenta (próximos 5s) e Alinhamento Final
    const voltasFaseLenta = Math.floor(Math.random() * 2) + 2; // 2-3 voltas lentas
    const anguloAlvoNoPonteiro = 270; // Ponteiro no topo
    const anguloMeioSegmentoSorteado = (indiceSorteado * anguloPorSegmento) + (anguloPorSegmento / 2);
    
    const anguloBaseParaAlinhar = anguloKeyframe50 + (voltasFaseLenta * 360);
    const orientacaoAposVoltasLentas = anguloBaseParaAlinhar % 360;
    
    let rotacaoPendenteParaAlinhar = (anguloAlvoNoPonteiro - anguloMeioSegmentoSorteado - orientacaoAposVoltasLentas);
    // Ajuste para garantir que a rotação pendente seja a menor volta (positiva ou negativa) para alinhar
    while(rotacaoPendenteParaAlinhar < -180) { 
         rotacaoPendenteParaAlinhar += 360;
    }
    while(rotacaoPendenteParaAlinhar > 180) {
         rotacaoPendenteParaAlinhar -= 360;
    }
    // Se quiser forçar sempre a girar para frente para alinhar:
    // if (rotacaoPendenteParaAlinhar < 0) rotacaoPendenteParaAlinhar += 360;


    const anguloFinalReal = anguloBaseParaAlinhar + rotacaoPendenteParaAlinhar;

    // --- Gerar e Aplicar Keyframes ---
    const keyframesCSS = `
        @keyframes spinRoletaComplexa {
            0%   {
                transform: rotate(${anguloDePartidaAnim}deg);
                animation-timing-function: cubic-bezier(0.4, 0, 0.8, 0.5); /* Acelera e mantém rápido */
            }
            50%  {
                transform: rotate(${anguloKeyframe50}deg);
                animation-timing-function: cubic-bezier(0.25, 0.45, 0.45, 1); /* Desacelera para a parada suave */
            }
            100% {
                transform: rotate(${anguloFinalReal}deg);
            }
        }`;
    dynamicKeyframesStyleSheet.innerHTML = keyframesCSS;

    roletaElement.style.animation = 'none'; // Reseta animação anterior
    void roletaElement.offsetWidth; // Força reflow para garantir que o reset seja aplicado
    roletaElement.style.animation = 'spinRoletaComplexa 10s forwards'; // Duração 10s

    // Atualiza currentRotation para o próximo giro
    currentRotation = anguloFinalReal;

    setTimeout(() => {
        girando = false;
        botaoGirar.disabled = false;
        const premioGanho = tiposDePremios[indiceSorteado];
        if (premioGanho === "DINHEIRO") {
            resultadoPremio.textContent = `🎉 Prêmio: Dinheiro! 💰`;
        } else {
            resultadoPremio.textContent = `😕 Prêmio: Vazio`;
        }
        // Opcional: resetar visualmente o ângulo para menos de 360 após a animação,
        // mas mantendo o currentRotation absoluto para a lógica.
        // roletaElement.style.transform = `rotate(${currentRotation % 360}deg)`;
        // roletaElement.style.animation = ''; // Limpar a animação para o próximo clique não ser afetado por 'forwards' de forma inesperada

    }, 10000); // Total de 10 segundos
});