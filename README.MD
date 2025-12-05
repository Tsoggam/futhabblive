# ⚽ Habblive Copa de Futebol

Sistema de inscrição de times para a Copa de Futebol Habblive com controle de IP por Supabase.

## 🚀 Features

- ✅ Inscrição de times (3, 4 ou 5 jogadores)
- ✅ Controle de spam (1 inscrição por IP)
- ✅ Design retrô pixel art
- ✅ Integração com Supabase
- ✅ Deploy automático no Vercel
- ✅ Responsivo (mobile-friendly)

## 📁 Estrutura do Projeto

```
habblive-campeonato-futebol/
├── index.html          # Página principal
├── styles.css          # Estilos (CSS)
├── main.js             # Lógica (JavaScript)
├── package.json        # Configuração do projeto
├── vercel.json         # Configuração Vercel
├── .gitignore          # Arquivos ignorados no Git
└── README.md           # Este arquivo
```

## 🛠️ Tecnologias

- **Frontend**: HTML, CSS, JavaScript (vanilla)
- **Backend**: Supabase (PostgreSQL)
- **Deploy**: Vercel
- **Fonte**: Press Start 2P (Google Fonts)

## 🔧 Configuração Local

### Pré-requisitos
- Git instalado
- Navegador moderno
- Python ou Node.js (para servidor local)

### Passos

1. **Clone o repositório**
```bash
git clone https://github.com/seu-usuario/habblive-campeonato-futebol.git
cd habblive-campeonato-futebol
```

2. **Inicie o servidor local**

Com Python:
```bash
python -m http.server 3000
```

Com Node.js:
```bash
npx http-server -p 3000
```

3. **Acesse a aplicação**
```
http://localhost:3000
```

## 📤 Deploy no Vercel

1. Faça push do código para GitHub
2. Acesse [vercel.com](https://vercel.com)
3. Clique em "New Project" → Selecione o repositório
4. Adicione as variáveis de ambiente:
   - `SUPABASE_URL`: https://iedqgyzxyvrhjmthmhlr.supabase.co
   - `SUPABASE_KEY`: (sua chave)
5. Clique em "Deploy"

## 💾 Banco de Dados (Supabase)

### Tabela: `teams`

```sql
CREATE TABLE teams (
    id BIGSERIAL PRIMARY KEY,
    player_count INT NOT NULL,
    nicknames TEXT NOT NULL,
    user_ip TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP NOT NULL
);
```

### Políticas RLS

- ✅ Qualquer um pode fazer INSERT
- ✅ Qualquer um pode fazer SELECT
- ❌ Ninguém pode fazer UPDATE/DELETE

## ⚙️ Configurações

### Expiração de Inscrições
Altere `REGISTRATION_EXPIRY` em `main.js` para definir em quantas horas o IP será desbloqueado.

Padrão: 24 horas

```javascript
REGISTRATION_EXPIRY: 24 // horas
```

## 🐛 Troubleshooting

### Erro: "Você já inscreveu um time"
- Aguarde 24 horas ou
- Altere `REGISTRATION_EXPIRY` em `main.js`

### Erro: "Supabase não encontrou"
- Verifique as credenciais em `main.js`
- Confirme que a tabela `teams` existe no Supabase

### CORS Error
- Vá em Supabase → Settings → API → CORS
- Adicione seu domínio Vercel

## 📊 Monitorar Inscrições

1. Acesse [Supabase](https://supabase.com)
2. Selecione seu projeto
3. Clique em "Table Editor"
4. Abra a tabela "teams"
5. Veja todas as inscrições em tempo real

## 🔐 Segurança

- ✅ Credenciais no `.gitignore`
- ✅ RLS habilitado no Supabase
- ✅ Validação no frontend e backend
- ✅ Controle de IP por rate limiting

## 📝 Licença

MIT

## 👨‍💻 Autor

Maggost

---

**Data do campeonato**: 12/12 ⚽