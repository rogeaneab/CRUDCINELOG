const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken'); // Adicionado para segurança

const app = express();
const PORT = 3000;
const SECRET_KEY = "cinelog_secret_key_2026"; // Chave para assinar o crachá (token)

// --- MIDDLEWARES ---
app.use(cors()); 
app.use(express.json()); 

const uploadDir = './uploads';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}
app.use('/uploads', express.static('uploads'));

// --- CONEXÃO COM O BANCO DE DADOS ---
const db = new sqlite3.Database('./cine_database.sqlite', (err) => {
    if (err) {
        console.error("❌ Erro ao abrir banco de dados:", err.message);
    } else {
        console.log("✅ Banco de dados SQLite conectado.");
        criarTabelas();
    }
});

// --- CRIAÇÃO DAS TABELAS ---
function criarTabelas() {
    // Tabela de Reviews
    db.run(`CREATE TABLE IF NOT EXISTS reviews (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        filmeTitulo TEXT NOT NULL,
        filmeAno TEXT,
        filmeGenero TEXT,
        filmeDuracao TEXT,
        filmePoster TEXT,
        filmeBanner TEXT,
        diretor TEXT,
        nota INTEGER NOT NULL,
        texto TEXT,
        data TEXT
    )`);

    // NOVA: Tabela de Usuários para o Login
    db.run(`CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT,
        email TEXT UNIQUE,
        senha TEXT
    )`, () => {
        // Criar um usuário padrão para teste se a tabela estiver vazia
        db.run(`INSERT OR IGNORE INTO usuarios (nome, email, senha) VALUES (?, ?, ?)`, 
        ['Admin', 'admin@teste.com', '123456']);
    });
}

// --- MIDDLEWARE DE VERIFICAÇÃO (O "SEGURANÇA") ---
function verificarJWT(req, res, next) {
    const token = req.headers['x-access-token'];
    if (!token) return res.status(401).json({ auth: false, message: 'Token não fornecido.' });

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) return res.status(500).json({ auth: false, message: 'Falha ao autenticar token.' });
        
        req.userId = decoded.id;
        next();
    });
}

// --- ROTAS DE AUTENTICAÇÃO ---

app.post('/login', (req, res) => {
    const { email, senha } = req.body;

    db.get("SELECT * FROM usuarios WHERE email = ? AND senha = ?", [email, senha], (err, user) => {
        if (err) return res.status(500).json({ message: "Erro no servidor" });
        
        if (user) {
            // Se achou o usuário, gera o token (crachá)
            const token = jwt.sign({ id: user.id }, SECRET_KEY, { expiresIn: '24h' });
            return res.json({ auth: true, token, nome: user.nome });
        }

        res.status(401).json({ message: "Login inválido!" });
    });
});

// --- ROTAS DE REVIEWS (PROTEGIDAS) ---

// Adicionamos 'verificarJWT' antes das funções para proteger os dados
app.get('/reviews', verificarJWT, (req, res) => {
    const sql = "SELECT * FROM reviews ORDER BY data DESC";
    db.all(sql, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows || []);
    });
});

app.post('/reviews', verificarJWT, (req, res) => {
    const { 
        filmeTitulo, filmeAno, filmeGenero, filmeDuracao, 
        filmePoster, filmeBanner, diretor, nota, texto, data 
    } = req.body;

    const sql = `INSERT INTO reviews 
        (filmeTitulo, filmeAno, filmeGenero, filmeDuracao, filmePoster, filmeBanner, diretor, nota, texto, data) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    
    const params = [filmeTitulo, filmeAno, filmeGenero, filmeDuracao, filmePoster, filmeBanner, diretor, nota, texto, data];

    db.run(sql, params, function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID, success: true });
    });
});

app.delete('/reviews/:id', verificarJWT, (req, res) => {
    db.run("DELETE FROM reviews WHERE id = ?", req.params.id, function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

// --- ROTA DE EDIÇÃO (UPDATE) ---
app.put('/reviews/:id', verificarJWT, (req, res) => {
    const { id } = req.params;
    const { 
        filmeTitulo, filmeAno, filmeGenero, filmeDuracao, 
        filmePoster, filmeBanner, diretor, nota, texto, data 
    } = req.body;

    const sql = `UPDATE reviews SET 
        filmeTitulo = ?, filmeAno = ?, filmeGenero = ?, filmeDuracao = ?, 
        filmePoster = ?, filmeBanner = ?, diretor = ?, nota = ?, texto = ?, data = ?
        WHERE id = ?`;
    
    const params = [
        filmeTitulo, filmeAno, filmeGenero, filmeDuracao, 
        filmePoster, filmeBanner, diretor, nota, texto, data, id
    ];

    db.run(sql, params, function(err) {
        if (err) return res.status(500).json({ error: err.message });
        
        if (this.changes === 0) {
            return res.status(404).json({ message: "Review não encontrada." });
        }
        
        res.json({ success: true, message: "Review atualizada com sucesso!" });
    });
});

// Outras rotas (PUT, GET BY ID) também devem receber o verificarJWT...

// --- INICIALIZAÇÃO ---
app.listen(PORT, () => {
    console.log(`🚀 Back-end CineLog Protegido rodando em http://localhost:${PORT}`);
});