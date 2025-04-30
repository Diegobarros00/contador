// Variáveis globais
let currentTeam = null;
let activeSet = 1;
let maxSets = 3;
let pointsToWin = 25;
let finalSetPoints = 15;
let timeoutCount = 2;
let challengeCount = 2;
let timerInterval = null;
let matchSeconds = 0;
let homeRotation = 1;
let visitorRotation = 1;
let setScores = {
    set1: { home: 0, visitor: 0 },
    set2: { home: 0, visitor: 0 },
    set3: { home: 0, visitor: 0 },
    set4: { home: 0, visitor: 0 },
    set5: { home: 0, visitor: 0 }
};
let homeWins = 0;
let visitorWins = 0;
let serviceTeam = 'home';

// Inicializar o placar
document.addEventListener('DOMContentLoaded', function() {
    initClock();
    updateServiceIndicator();
    resetTimeouts();
    resetChallenges();
    updateSetIndicator();
    
    // Tornar o modal de logo fechável ao clicar fora
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeModal(modal.id);
            }
        });
    });
});

// Atualizar relógio atual
function initClock() {
    function updateClock() {
        const now = new Date();
        const timeStr = now.toLocaleTimeString();
        document.getElementById('current-time').textContent = timeStr;
    }
    
    updateClock();
    setInterval(updateClock, 1000);
}

// Funções de controle de pontuação
function addPoint(team) {
    const scoreElement = document.getElementById(`${team}-score`);
    let score = parseInt(scoreElement.textContent) + 1;
    scoreElement.textContent = score;
    
    // Atualizar pontuação do set atual
    const currentSetObj = `set${activeSet}`;
    setScores[currentSetObj][team] = score;
    
    // Verificar fim do set
    checkSetWinner(team, score);
    
    // Alternar serviço
    toggleService();
    
    // Atualizar placar do set
    updateSetScore();
}

function subtractPoint(team) {
    const scoreElement = document.getElementById(`${team}-score`);
    let score = parseInt(scoreElement.textContent);
    if (score > 0) {
        score--;
        scoreElement.textContent = score;
        
        // Atualizar pontuação do set atual
        const currentSetObj = `set${activeSet}`;
        setScores[currentSetObj][team] = score;
        
        // Atualizar placar do set
        updateSetScore();
    }
}

// Verificar se o set acabou
function checkSetWinner(team, score) {
    const otherTeam = team === 'home' ? 'visitor' : 'home';
    const otherScore = parseInt(document.getElementById(`${otherTeam}-score`).textContent);
    const isFinalSet = activeSet === maxSets;
    const pointsNeeded = isFinalSet ? finalSetPoints : pointsToWin;
    
    if ((score >= pointsNeeded && score - otherScore >= 2) || 
        (score >= pointsNeeded - 1 && score - otherScore >= 10)) {
        
        // Marcar que o time ganhou o set
        const setElement = document.getElementById(`set${activeSet}`);
        if (team === 'home') {
            homeWins++;
            setElement.classList.add('home-win');
            setElement.querySelector('.set-home').textContent = '✓';
        } else {
            visitorWins++;
            setElement.classList.add('visitor-win');
            setElement.querySelector('.set-visitor').textContent = '✓';
        }
        
        // Verificar se o jogo acabou
        if (homeWins >= Math.ceil(maxSets / 2) || visitorWins >= Math.ceil(maxSets / 2)) {
            alert(`${team === 'home' ? 'Time Casa' : 'Time Visitante'} venceu o jogo!`);
        } else {
            // Preparar próximo set
            setTimeout(() => {
                nextSet();
            }, 1000);
        }
    }
}

// Passar para o próximo set
function nextSet() {
    if (activeSet < 5) {
        // Desativar set atual
        document.getElementById(`set${activeSet}`).classList.remove('active-set');
        
        // Ativar próximo set
        activeSet++;
        document.getElementById(`set${activeSet}`).classList.add('active-set');
        
        // Resetar pontuação
        document.getElementById('home-score').textContent = '0';
        document.getElementById('visitor-score').textContent = '0';
        
        // Resetar timeouts e desafios
        resetTimeouts();
        resetChallenges();
        
        // Atualizar indicador de set
        updateSetIndicator();
    }
}

// Atualizar indicador de set atual
function updateSetIndicator() {
    for (let i = 1; i <= 5; i++) {
        document.getElementById(`set${i}`).classList.remove('active-set');
    }
    document.getElementById(`set${activeSet}`).classList.add('active-set');
}

// Atualizar placar do set
function updateSetScore() {
    const currentSetObj = `set${activeSet}`;
    const homeScore = setScores[currentSetObj].home;
    const visitorScore = setScores[currentSetObj].visitor;
    
    document.getElementById(`set${activeSet}-score`).textContent = `${homeScore}-${visitorScore}`;
}

// Trocar lados das equipes
function swapSides() {
    const homeContainer = document.getElementById('home-team-container');
    const visitorContainer = document.getElementById('visitor-team-container');
    const homeParent = homeContainer.parentNode;
    
    if (homeContainer.nextElementSibling === visitorContainer) {
        homeParent.insertBefore(visitorContainer, homeContainer);
    } else {
        homeParent.insertBefore(homeContainer, visitorContainer);
    }
}

// Resetar pontuação
function resetScore() {
    document.getElementById('home-score').textContent = '0';
    document.getElementById('visitor-score').textContent = '0';
    
    // Resetar pontuação do set atual
    const currentSetObj = `set${activeSet}`;
    setScores[currentSetObj].home = 0;
    setScores[currentSetObj].visitor = 0;
    
    // Atualizar placar do set
    updateSetScore();
}

// Alternar serviço
function toggleService() {
    document.getElementById('home-service').classList.remove('active');
    document.getElementById('visitor-service').classList.remove('active');
    
    serviceTeam = serviceTeam === 'home' ? 'visitor' : 'home';
    updateServiceIndicator();
}

// Atualizar indicador de serviço
function updateServiceIndicator() {
    document.getElementById('home-service').classList.remove('active');
    document.getElementById('visitor-service').classList.remove('active');
    
    document.getElementById(`${serviceTeam}-service`).classList.add('active');
}

// Funções para estatísticas
function addStat(team, statType) {
    const statElement = document.getElementById(`${team}-${statType}`);
    const currentValue = parseInt(statElement.textContent);
    statElement.textContent = currentValue + 1;
}

// Funções para tempos
function useTimeout(team) {
    for (let i = 1; i <= timeoutCount; i++) {
        const timeoutElement = document.getElementById(`${team}-timeout-${i}`);
        if (!timeoutElement.classList.contains('used')) {
            timeoutElement.classList.add('used');
            break;
        }
    }
}

// Resetar tempos
function resetTimeouts() {
    for (let i = 1; i <= timeoutCount; i++) {
        document.getElementById(`home-timeout-${i}`).classList.remove('used');
        document.getElementById(`visitor-timeout-${i}`).classList.remove('used');
    }
}

// Funções para desafios
function useChallenge(team) {
    const challengeCount = document.getElementById(`${team}-challenge-count`);
    let count = parseInt(challengeCount.textContent);
    
    if (count > 0) {
        count--;
        challengeCount.textContent = count;
    }
}

// Resetar desafios
function resetChallenges() {
    document.getElementById('home-challenge-count').textContent = challengeCount;
    document.getElementById('visitor-challenge-count').textContent = challengeCount;
}

// Funções de rotação
function rotateTeam(team) {
    // Resetar todas as posições
    for (let i = 1; i <= 6; i++) {
        document.getElementById(`${team}-pos-${i}`).classList.remove('active');
    }
    
    // Atualizar a rotação
    if (team === 'home') {
        homeRotation = homeRotation % 6 + 1;
        document.getElementById(`${team}-pos-${homeRotation}`).classList.add('active');
    } else {
        visitorRotation = visitorRotation % 6 + 1;
        document.getElementById(`${team}-pos-${visitorRotation}`).classList.add('active');
    }
}

// Funções do cronômetro
function startTimer() {
    if (!timerInterval) {
        timerInterval = setInterval(updateTimer, 1000);
    }
}

function pauseTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
}

function resetTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
    matchSeconds = 0;
    updateTimerDisplay();
}

function updateTimer() {
    matchSeconds++;
    updateTimerDisplay();
}

function updateTimerDisplay() {
    const minutes = Math.floor(matchSeconds / 60);
    const seconds = matchSeconds % 60;
    document.getElementById('match-timer').textContent = 
        `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Funções para modais
function openLogoModal(team) {
    currentTeam = team;
    
    // Limpar inputs
    document.getElementById('team-name-input').value = '';
    document.getElementById('team-rank-input').value = '';
    document.getElementById('logo-upload').value = '';
    
    // Mostrar modal
    document.getElementById('logo-modal').style.display = 'flex';
}

function openSettingsModal() {
    document.getElementById('set-points').value = pointsToWin;
    document.getElementById('winning-sets').value = maxSets;
    document.getElementById('final-set-points').value = finalSetPoints;
    document.getElementById('timeout-count').value = timeoutCount;
    document.getElementById('challenge-count').value = challengeCount;
    
    document.getElementById('settings-modal').style.display = 'flex';
}

function openTournamentModal() {
    document.getElementById('tournament-name-input').value = document.getElementById('tournament-name').textContent;
    document.getElementById('match-number-input').value = '';
    
    document.getElementById('tournament-modal').style.display = 'flex';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Salvar informações do time
function saveLogo() {
    const teamName = document.getElementById('team-name-input').value;
    const teamRank = document.getElementById('team-rank-input').value;
    const logoFile = document.getElementById('logo-upload').files[0];
    const teamColor = document.getElementById('team-color').value;
    
    if (teamName) {
        document.getElementById(`${currentTeam}-name`).textContent = teamName;
    }
    
    if (teamRank) {
        document.getElementById(`${currentTeam}-rank`).textContent = teamRank;
    }
    
    if (logoFile) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const logoElement = document.getElementById(`${currentTeam}-logo`);
            logoElement.innerHTML = '';
            
            const img = document.createElement('img');
            img.src = e.target.result;
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.objectFit = 'contain';
            
            logoElement.appendChild(img);
        };
        reader.readAsDataURL(logoFile);
    }
    
    // Aplicar cor ao container do time
    document.getElementById(`${currentTeam}-team-container`).style.borderLeft = `5px solid ${teamColor}`;
    
    closeModal('logo-modal');
}

// Salvar configurações
function saveSettings() {
    pointsToWin = parseInt(document.getElementById('set-points').value);
    maxSets = parseInt(document.getElementById('winning-sets').value);
    finalSetPoints = parseInt(document.getElementById('final-set-points').value);
    timeoutCount = parseInt(document.getElementById('timeout-count').value);
    challengeCount = parseInt(document.getElementById('challenge-count').value);
    
    resetTimeouts();
    resetChallenges();
    
    closeModal('settings-modal');
}

// Salvar informações do torneio
function saveTournament() {
    const tournamentName = document.getElementById('tournament-name-input').value;
    const matchNumber = document.getElementById('match-number-input').value;
    const tournamentRound = document.getElementById('tournament-round').value;
    
    let displayText = tournamentName;
    
    if (matchNumber) {
        displayText += ` - Jogo ${matchNumber}`;
    }
    
    if (tournamentRound) {
        displayText += ` (${tournamentRound})`;
    }
    
    document.getElementById('tournament-name').textContent = displayText;
    
    closeModal('tournament-modal');
}

// Adicionar listener para botões do timer
document.getElementById('start-timer').addEventListener('click', startTimer);
document.getElementById('pause-timer').addEventListener('click', pauseTimer);
document.getElementById('reset-timer').addEventListener('click', resetTimer);

// Inicializar a rotação ativa para ambos os times
document.getElementById('home-pos-1').classList.add('active');
document.getElementById('visitor-pos-1').classList.add('active');