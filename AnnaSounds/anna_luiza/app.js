// Elementos do DOM
const entradaUrlServidor = document.getElementById('serverUrl');
const botaoConectar = document.getElementById('connectBtn');
const elementoStatus = document.getElementById('status');
const listaMusicasEl = document.getElementById('songList');
const audioEl = document.getElementById('audio');
const tocandoAgoraEl = document.getElementById('nowPlaying');
const playPauseBtn = document.getElementById('playPauseBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const rewindBtn = document.getElementById('rewindBtn');
const forwardBtn = document.getElementById('forwardBtn');
const progressBar = document.getElementById('progressBar');
const currentTimeEl = document.getElementById('currentTime');
const totalTimeEl = document.getElementById('totalTime');
const volumeRange = document.getElementById('volumeRange');
const toggleThemeBtn = document.getElementById('toggleTheme');
const initialConfig = document.getElementById('initialConfig');
const initialServerUrl = document.getElementById('initialServerUrl');
const initialConnectBtn = document.getElementById('initialConnectBtn');
const demoLink = document.getElementById('demoLink');
const player = document.querySelector('.player');
const songSection = document.getElementById('songSection');
const historySection = document.getElementById('historySection');

// Variáveis globais
let musicasDisponiveis = [];
let musicaAtualIndex = -1;
let isPlaying = false;
let historyList = [];

// Dados de demonstração
const demoMusicas = [
    {
        title: "Swag II",
        artist: "Justin Bieber",
        url: "https://www.soundjay.com/music/soundjay-music-loop-1.mp3",
        cover: "https://via.placeholder.com/200"
    },
    {
        title: "Blinding Lights",
        artist: "The Weeknd",
        url: "https://www.soundjay.com/music/soundjay-music-loop-2.mp3",
        cover: "https://via.placeholder.com/200/FF0000/FFFFFF"
    },
    {
        title: "Dance Monkey",
        artist: "Tones and I",
        url: "https://www.soundjay.com/music/soundjay-music-loop-3.mp3",
        cover: "https://via.placeholder.com/200/0000FF/FFFFFF"
    },
    {
        title: "Shape of You",
        artist: "Ed Sheeran",
        url: "https://www.soundjay.com/music/soundjay-music-loop-4.mp3",
        cover: "https://via.placeholder.com/200/00FF00/000000"
    },
    {
        title: "Bad Guy",
        artist: "Billie Eilish",
        url: "https://www.soundjay.com/music/soundjay-music-loop-5.mp3",
        cover: "https://via.placeholder.com/200/FFFF00/000000"
    }
];

// Menu lateral
const menuToggle = document.getElementById('menuToggle');
const sideMenu = document.getElementById('sideMenu');
const closeMenu = document.getElementById('closeMenu');
menuToggle.onclick = () => sideMenu.classList.add('open');
closeMenu.onclick = () => sideMenu.classList.remove('open');

// Carregar configurações salvas
const urlSalva = localStorage.getItem('urlServidor') ?? localStorage.getItem('serverUrl');
if (urlSalva) {
    entradaUrlServidor.value = urlSalva;
    initialServerUrl.value = urlSalva;
}

// Carregar histórico salvo
const savedHistoryList = localStorage.getItem('historyList');
if (savedHistoryList) {
    historyList = JSON.parse(savedHistoryList);
    renderizarHistorico();
}

// Funções auxiliares
function juntarUrl(base, relativo) {
    try {
        return new URL(relativo, base).href;
    } catch {
        return base.replace(/\/+$/, '') + '/' + relativo.replace(/^\/+/, '');
    }
}

async function buscarJSON(url) {
    const resposta = await fetch(url);
    if (!resposta.ok) throw new Error(`HTTP ${resposta.status}`);
    return resposta.json();
}

function definirStatus(mensagem) {
    elementoStatus.textContent = mensagem;
}

function mostrarInterfacePrincipal() {
    initialConfig.style.display = 'none';
    player.style.display = 'flex';
    songSection.style.display = 'block';
    historySection.style.display = 'block';
}

// Conectar ao servidor
async function conectarServidor(base) {
    if (!base) { 
        definirStatus('Informe a URL do servidor.'); 
        return false;
    }

    // Salvar URL
    localStorage.setItem('urlServidor', base);
    localStorage.setItem('serverUrl', base);

    definirStatus('Conectando…');
    try {
        const saude = await buscarJSON(juntarUrl(base, '/api/saude'));
        definirStatus(`Conectado. ${saude.count} músicas disponíveis.`);
        const musicas = await buscarJSON(juntarUrl(base, '/api/musicas'));
        renderizarMusicas(base, musicas);
        mostrarInterfacePrincipal();
        return true;
    } catch (erro) {
        definirStatus('Falha ao conectar. Verifique a URL e a rede.');
        console.error(erro);
        return false;
    }
}

// Conectar com dados de demonstração
function conectarDemonstracao() {
    definirStatus('Modo de demonstração ativado. 5 músicas disponíveis.');
    renderizarMusicas('', demoMusicas);
    mostrarInterfacePrincipal();
    return true;
}

// Event listeners para conexão
botaoConectar.addEventListener('click', async () => {
    const base = entradaUrlServidor.value.trim().replace(/\/$/, '');
    await conectarServidor(base);
});

initialConnectBtn.addEventListener('click', async () => {
    const base = initialServerUrl.value.trim().replace(/\/$/, '');
    await conectarServidor(base);
});

demoLink.addEventListener('click', (e) => {
    e.preventDefault();
    conectarDemonstracao();
});

// Renderizar lista de músicas
function renderizarMusicas(base, musicas) {
    musicasDisponiveis = musicas;
    listaMusicasEl.innerHTML = '';
    
    if (!musicas.length) {
        listaMusicasEl.innerHTML = '<li>Nenhuma música encontrada no servidor.</li>';
        return;
    }

    musicas.forEach((musica, index) => {
        const li = document.createElement('li');

        const blocoMeta = document.createElement('div');
        blocoMeta.className = 'meta';

        const tituloEl = document.createElement('div');
        tituloEl.className = 'title';
        tituloEl.textContent = musica.title || '(Sem título)';

        const artistaEl = document.createElement('div');
        artistaEl.className = 'artist';
        artistaEl.textContent = musica.artist || 'Desconhecido';

        blocoMeta.appendChild(tituloEl);
        blocoMeta.appendChild(artistaEl);

        const botaoTocar = document.createElement('button');
        botaoTocar.textContent = 'Tocar';
        botaoTocar.addEventListener('click', () => {
            musicaAtualIndex = index;
            tocarMusica(base, musica);
        });

        li.appendChild(blocoMeta);
        li.appendChild(botaoTocar);
        listaMusicasEl.appendChild(li);
    });
}

// Tocar música
function tocarMusica(base, musica) {
    const url = musica.url?.startsWith('http') ? musica.url : juntarUrl(base, musica.url);
    audioEl.src = url;
    audioEl.play().catch(console.error);
    
    // Atualizar informações da música
    tocandoAgoraEl.textContent = `Tocando: ${musica.title} — ${musica.artist}`;
    
    // Atualizar capa do álbum
    const coverImage = document.getElementById('coverImage');
    if (musica.cover) {
        coverImage.src = musica.cover;
    }
    
    // Adicionar ao histórico
    if (!historyList.find(m => m.title === musica.title && m.artist === musica.artist)) {
        historyList.push(musica);
        renderizarHistorico();
        localStorage.setItem('historyList', JSON.stringify(historyList));
    }
}

// Renderizar histórico
function renderizarHistorico() {
    const historyListEl = document.getElementById('historyList');
    historyListEl.innerHTML = '';
    
    if (historyList.length === 0) {
        historyListEl.innerHTML = '<li>Nenhuma música tocada ainda.</li>';
        return;
    }

    historyList.slice().reverse().forEach((musica) => {
        const li = document.createElement('li');
        
        const blocoMeta = document.createElement('div');
        blocoMeta.className = 'meta';

        const tituloEl = document.createElement('div');
        tituloEl.className = 'title';
        tituloEl.textContent = musica.title || '(Sem título)';

        const artistaEl = document.createElement('div');
        artistaEl.className = 'artist';
        artistaEl.textContent = musica.artist || 'Desconhecido';

        blocoMeta.appendChild(tituloEl);
        blocoMeta.appendChild(artistaEl);
        
        li.appendChild(blocoMeta);
        historyListEl.appendChild(li);
    });
}

// Apagar histórico
function apagarHistorico() {
    historyList = [];
    localStorage.removeItem('historyList');
    renderizarHistorico();
}

const btnApagarHistorico = document.getElementById('btnClearHistory');
btnApagarHistorico.addEventListener('click', apagarHistorico);

// Funcionalidades de controle de música
function formatarTempo(segundos) {
    const minutos = Math.floor(segundos / 60);
    const segs = Math.floor(segundos % 60);
    return `${minutos}:${segs.toString().padStart(2, '0')}`;
}

function atualizarProgresso() {
    if (audioEl.duration) {
        const progresso = (audioEl.currentTime / audioEl.duration) * 100;
        progressBar.value = progresso;
        currentTimeEl.textContent = formatarTempo(audioEl.currentTime);
        totalTimeEl.textContent = formatarTempo(audioEl.duration);
    }
}

function tocarPausar() {
    if (isPlaying) {
        audioEl.pause();
        isPlaying = false;
        playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
    } else {
        audioEl.play().catch(console.error);
        isPlaying = true;
        playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
    }
}

function musicaAnterior() {
    if (musicaAtualIndex > 0) {
        musicaAtualIndex--;
        const base = localStorage.getItem('urlServidor');
        tocarMusica(base, musicasDisponiveis[musicaAtualIndex]);
    }
}

function proximaMusica() {
    if (musicaAtualIndex < musicasDisponiveis.length - 1) {
        musicaAtualIndex++;
        const base = localStorage.getItem('urlServidor');
        tocarMusica(base, musicasDisponiveis[musicaAtualIndex]);
    }
}

function retroceder() {
    audioEl.currentTime = Math.max(0, audioEl.currentTime - 10);
}

function avancar() {
    audioEl.currentTime = Math.min(audioEl.duration, audioEl.currentTime + 10);
}

function alterarProgresso() {
    if (audioEl.duration) {
        const novoTempo = (progressBar.value / 100) * audioEl.duration;
        audioEl.currentTime = novoTempo;
    }
}

function alterarVolume() {
    audioEl.volume = volumeRange.value;
}

// Event listeners para controles de música
playPauseBtn.addEventListener('click', tocarPausar);
prevBtn.addEventListener('click', musicaAnterior);
nextBtn.addEventListener('click', proximaMusica);
rewindBtn.addEventListener('click', retroceder);
forwardBtn.addEventListener('click', avancar);
progressBar.addEventListener('input', alterarProgresso);
volumeRange.addEventListener('input', alterarVolume);

// Event listeners para o elemento de áudio
audioEl.addEventListener('timeupdate', atualizarProgresso);
audioEl.addEventListener('loadedmetadata', () => {
    totalTimeEl.textContent = formatarTempo(audioEl.duration);
});
audioEl.addEventListener('play', () => {
    isPlaying = true;
    playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
});
audioEl.addEventListener('pause', () => {
    isPlaying = false;
    playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
});
audioEl.addEventListener('ended', proximaMusica);

// Funcionalidade de modo claro/escuro
function alternarTema() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('tema', isDark ? 'dark' : 'light');
    toggleThemeBtn.textContent = isDark ? '☀️' : '🌙';
}

// Carregar tema salvo
const temaSalvo = localStorage.getItem('tema');
if (temaSalvo === 'dark') {
    document.body.classList.add('dark-mode');
    toggleThemeBtn.textContent = '☀️';
} else {
    toggleThemeBtn.textContent = '🌙';
}

toggleThemeBtn.addEventListener('click', alternarTema);