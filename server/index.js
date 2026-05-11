const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const app = express();

// --- CONFIGURAÇÕES ---
app.use(cors()); 
app.use(express.json()); 

const uploadDir = './uploads';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}
app.use('/uploads', express.static('uploads'));

// --- BANCO DE DADOS ---
const db = new sqlite3.Database('./novo_database.sqlite', (err) => {
    if (err) console.error("Erro ao abrir banco", err);
    console.log("✅ Banco de dados SQLite conectado.");
    
    db.run(`CREATE TABLE IF NOT EXISTS reviews (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        rating INTEGER NOT NULL,
        comment TEXT,
        image TEXT
    )`);
});

// --- ROTAS (CRUD) ---

app.get('/reviews', (req, res) => {
    db.all("SELECT * FROM reviews", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows || []);
    });
});

app.post('/reviews', (req, res) => {
    const { title, rating, comment, image } = req.body;
    console.log("📥 Recebendo nova review:", title); // Log para debug

    const sql = "INSERT INTO reviews (title, rating, comment, image) VALUES (?, ?, ?, ?)";
    db.run(sql, [title, rating, comment, image], function(err) {
        if (err) {
            console.error("❌ Erro no SQL:", err.message);
            return res.status(500).json({ error: err.message });
        }
        res.json({ id: this.lastID, success: true });
    });
});

app.put('/reviews/:id', (req, res) => {
    const { title, rating, comment, image } = req.body;
    const id = req.params.id;
    const sql = "UPDATE reviews SET title = ?, rating = ?, comment = ?, image = ? WHERE id = ?";
    db.run(sql, [title, rating, comment, image, id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

app.delete('/reviews/:id', (req, res) => {
    const id = req.params.id;
    db.run("DELETE FROM reviews WHERE id = ?", id, function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

// --- INICIALIZAÇÃO (Faltava isso!) ---
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});