import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "./Login.css";

const API_BASE = "http://localhost:3000";
const TMDB_KEY = "b04b3bee774c14e48850cbcb33a55d7d"; // Sua chave TMDB

export default function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [capas, setCapas] = useState([]);
  const [indiceAtivo, setIndiceAtivo] = useState(0);

  const navigate = useNavigate();

  // 1. Busca filmes em alta para o fundo rotativo (Igual à Home)
  useEffect(() => {
    async function fetchPosters() {
      try {
        const res = await axios.get(
          `https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_KEY}&with_genres=9648,878&language=pt-BR&sort_by=popularity.desc`,
        );
        setCapas(res.data.results.slice(0, 10));
      } catch (err) {
        console.error("Erro ao carregar posters exclusivos para o login", err); 
      }
    }
    fetchPosters();
  }, []);

  // 2. Lógica de rotação automática das imagens
  useEffect(() => {
    if (capas.length > 0) {
      const intervalo = setInterval(() => {
        setIndiceAtivo((prev) => (prev >= capas.length - 1 ? 0 : prev + 1));
      }, 5000); // Troca a imagem a cada 5 segundos
      return () => clearInterval(intervalo);
    }
  }, [capas]);

const handleLogin = async (e) => {
  e.preventDefault();
  try {
    // 1. Envia as credenciais para a nova rota que criamos no Back-end
    const response = await axios.post("http://localhost:3000/login", { email, senha });
    
    if (response.data.auth) {
      // 2. Salva o "crachá" no navegador para não perder ao mudar de página
      localStorage.setItem("token", response.data.token);
      
      // 3. Navega para a Home
      navigate("/home");
    }
  } catch (err) {
    alert("Usuário ou senha incorretos!");
  }
};

const handleLogout = () => {
  localStorage.removeItem("token");
  navigate("/");
};

  return (
    <div className="container login-page">
      {/* Painel da imagem com Carrossel Automático */}
      <div className="photo-panel">
        {capas.length > 0 && (
          <img
            key={capas[indiceAtivo].id}
            src={`https://image.tmdb.org/t/p/original${capas[indiceAtivo].backdrop_path}`}
            alt="Movie Background"
            className="fade-in-bg"
          />
        )}
        <div className="photo-overlay"></div>
      </div>

      {/* Painel do formulário */}
      <div className="form-panel">
        {/* Logo CineLog posicionada conforme sua última solicitação */}
        <Link to="/" className="top-logo">
          CineLog
        </Link>

        <div className="card">
          <h1>Seja Bem-Vindo</h1>

          {erro && <p className="error-msg">{erro}</p>}

          <form onSubmit={handleLogin}>
            <div className="field">
              <label htmlFor="email">E-mail</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
              />
            </div>

            <div className="field">
              <label htmlFor="senha">Senha</label>
              <input
                type="password"
                id="senha"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="••••••••"
                required
              />
              <div className="forgot-container">
                <a href="#" className="forgot">
                  Esqueceu a senha?
                </a>
              </div>
            </div>

            <button type="submit" className="btn-primary">
              Entrar
            </button>
          </form>

          <div className="divider">Entrar com</div>

          <div className="social-row">
            <button className="social-btn" aria-label="Google">
              <svg viewBox="0 0 24 24" width="24" height="24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
            </button>

            <button className="social-btn" aria-label="Facebook">
              <svg viewBox="0 0 24 24" width="24" height="24">
                <path
                  d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.267h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"
                  fill="#1877F2"
                />
              </svg>
            </button>

            <button className="social-btn" aria-label="Apple">
              <svg viewBox="0 0 24 24" width="24" height="24">
                <path
                  d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.7 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.56-1.32 3.1-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"
                  fill="#000"
                />
              </svg>
            </button>
          </div>

          <p className="signup-link">
            Não tem conta? <Link to="/cadastro">Cadastre-se</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
