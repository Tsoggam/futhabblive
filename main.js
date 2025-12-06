let devtoolsOpen = false;
const threshold = 160;

function detectDevTools() {
    const widthThreshold = window.outerWidth - window.innerWidth > threshold;
    const heightThreshold = window.outerHeight - window.innerHeight > threshold;

    if (widthThreshold || heightThreshold) {
        if (!devtoolsOpen) {
            devtoolsOpen = true;
            handleDevTools();
        }
    }
}

function handleDevTools() {
    document.body.innerHTML = `
        <div style="
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
            background: #000;
            color: #ff0000;
            font-family: 'Press Start 2P', cursive;
            font-size: 20px;
            text-align: center;
            padding: 20px;
        ">
            ⚠️ ACESSO NEGADO ⚠️<br><br>
            DevTools detectado!
        </div>
    `;
}

setInterval(() => {
    debugger;
}, 100);

window.addEventListener('resize', detectDevTools);
detectDevTools();

document.addEventListener('keydown', (e) => {
    if (
        e.keyCode === 123 ||
        (e.ctrlKey && e.shiftKey && e.keyCode === 73) ||
        (e.ctrlKey && e.shiftKey && e.keyCode === 74) ||
        (e.ctrlKey && e.keyCode === 85)
    ) {
        e.preventDefault();
        handleDevTools();
        return false;
    }
});

document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    return false;
});

const CONFIG = {
    STORAGE_TYPE: 'supabase',
    SUPABASE_URL: 'https://iedqgyzxyvrhjmthmhlr.supabase.co',
    SUPABASE_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImllZHFneXp4eXZyaGptdGhtaGxyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5NTgzODIsImV4cCI6MjA4MDUzNDM4Mn0.pst0bTh5tuHHemRixXyTQ6OWenYebd_3l4W3a4bSQD8'
};

const form = document.getElementById('registrationForm');
const playerCountRadios = document.querySelectorAll('input[name="playerCount"]');
const nicknamesContainer = document.getElementById('nicknamesContainer');
const playerError = document.getElementById('playerError');
const nicknamesError = document.getElementById('nicknamesError');
const successMessage = document.getElementById('successMessage');
const submitBtn = document.getElementById('submitBtn');
const apiError = document.getElementById('apiError');
const duplicateWarning = document.getElementById('duplicateWarning');
const modal = document.getElementById('rulesModal');
const rulesBtn = document.getElementById('rulesBtn');
const closeBtn = document.querySelector('.close-modal');

class SupabaseManager {
    constructor() {
        this.url = CONFIG.SUPABASE_URL;
        this.key = CONFIG.SUPABASE_KEY;
        this.table = 'teams';
    }

    async getUserIP() {
        try {
            const response = await fetch('https://api.ipify.org?format=json');
            const data = await response.json();
            return data.ip;
        } catch (error) {
            console.warn('Nao foi possivel obter IP:', error);
            return 'unknown-' + Math.random().toString(36).substr(2, 9);
        }
    }

    async checkDuplicateIP() {
        try {
            const userIP = await this.getUserIP();
            const response = await fetch(
                `${this.url}/rest/v1/${this.table}?user_ip=eq.${userIP}&select=id`,
                {
                    method: 'GET',
                    headers: {
                        'apikey': this.key,
                        'Authorization': `Bearer ${this.key}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (!response.ok) {
                throw new Error(`Erro: ${response.status}`);
            }

            const data = await response.json();
            return data.length > 0;
        } catch (error) {
            console.error('Erro ao verificar duplicata:', error);
            throw new Error('Erro ao verificar se voce ja se inscreveu');
        }
    }

    async checkDuplicateNicknames(nicknames) {
        try {
            const response = await fetch(
                `${this.url}/rest/v1/${this.table}?select=nicknames`,
                {
                    method: 'GET',
                    headers: {
                        'apikey': this.key,
                        'Authorization': `Bearer ${this.key}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (!response.ok) {
                throw new Error(`Erro: ${response.status}`);
            }

            const teams = await response.json();
            const allNicknames = teams.flatMap(team =>
                team.nicknames.split(',').map(n => n.trim().toUpperCase())
            );

            const duplicates = nicknames.filter(nick =>
                allNicknames.includes(nick.toUpperCase())
            );

            return duplicates;
        } catch (error) {
            console.error('Erro ao verificar nicknames:', error);
            throw new Error('Erro ao verificar nicknames duplicados');
        }
    }

    async saveTeam(teamData) {
        try {
            const userIP = await this.getUserIP();

            const payload = {
                player_count: parseInt(teamData.playerCount),
                nicknames: teamData.nicknames.join(','),
                user_ip: userIP,
                created_at: new Date().toISOString()
            };

            const response = await fetch(
                `${this.url}/rest/v1/${this.table}`,
                {
                    method: 'POST',
                    headers: {
                        'apikey': this.key,
                        'Authorization': `Bearer ${this.key}`,
                        'Content-Type': 'application/json',
                        'Prefer': 'return=minimal'
                    },
                    body: JSON.stringify(payload)
                }
            );

            if (!response.ok) {
                const error = await response.json();
                console.error('Erro Supabase:', error);
                if (response.status === 409) {
                    throw new Error('Voce ja tem um time inscrito!');
                }
                throw new Error(`Erro ao salvar: ${response.status}`);
            }

            console.log('Time registrado com sucesso!');
            return { success: true };
        } catch (error) {
            console.error('Erro ao salvar time:', error);
            throw error;
        }
    }
}

const supabaseManager = new SupabaseManager();

playerCountRadios.forEach(radio => {
    radio.addEventListener('change', () => {
        const count = parseInt(radio.value);
        nicknamesContainer.innerHTML = '';
        playerError.classList.remove('show');
        apiError.classList.remove('show');
        duplicateWarning.style.display = 'none';

        for (let i = 1; i <= count; i++) {
            const wrapper = document.createElement('div');
            wrapper.className = 'nickname-input-wrapper';
            wrapper.innerHTML = `
                <div class="player-number">${i}</div>
                <input 
                    type="text" 
                    name="nickname${i}" 
                    class="nickname-input"
                    placeholder="nickname ${i}"
                    required
                    maxlength="16"
                >
            `;
            nicknamesContainer.appendChild(wrapper);
        }
    });
});

rulesBtn.addEventListener('click', () => {
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
});

closeBtn.addEventListener('click', () => {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
});

window.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
});

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    playerError.classList.remove('show');
    nicknamesError.classList.remove('show');
    successMessage.classList.remove('show');
    apiError.classList.remove('show');
    duplicateWarning.style.display = 'none';

    const selectedPlayers = document.querySelector('input[name="playerCount"]:checked');
    if (!selectedPlayers) {
        playerError.classList.add('show');
        return;
    }

    const nicknameInputs = document.querySelectorAll('.nickname-input');
    let allFilled = true;
    nicknameInputs.forEach(input => {
        if (!input.value.trim()) {
            allFilled = false;
            input.classList.add('error');
        } else {
            input.classList.remove('error');
        }
    });

    if (!allFilled) {
        nicknamesError.classList.add('show');
        return;
    }

    submitBtn.disabled = true;
    submitBtn.classList.add('loading');
    apiError.textContent = '';

    try {
        const isDuplicate = await supabaseManager.checkDuplicateIP();

        if (isDuplicate) {
            duplicateWarning.style.display = 'block';
            submitBtn.disabled = false;
            submitBtn.classList.remove('loading');
            return;
        }

        const nicknames = Array.from(nicknameInputs).map(input => input.value.toUpperCase());

        const duplicateNicks = await supabaseManager.checkDuplicateNicknames(nicknames);

        if (duplicateNicks.length > 0) {
            apiError.textContent = `!! NICKNAME JÁ EXISTE: ${duplicateNicks.join(', ')} !!`;
            apiError.classList.add('show');
            submitBtn.disabled = false;
            submitBtn.classList.remove('loading');
            return;
        }

        const teamData = {
            playerCount: selectedPlayers.value,
            nicknames: nicknames,
            date: '12/12'
        };

        await supabaseManager.saveTeam(teamData);

        successMessage.classList.add('show');
        console.log('Time registrado:', teamData);

        setTimeout(() => {
            form.reset();
            nicknamesContainer.innerHTML = '';
            playerCountRadios.forEach(radio => radio.checked = false);
            successMessage.classList.remove('show');
            submitBtn.disabled = false;
            submitBtn.classList.remove('loading');
        }, 3000);

    } catch (error) {
        console.error('Erro:', error);
        apiError.textContent = `ERRO: ${error.message}`;
        apiError.classList.add('show');

        submitBtn.disabled = false;
        submitBtn.classList.remove('loading');
    }
});