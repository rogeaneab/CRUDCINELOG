import { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "./Home.css";

const API_BASE = "http://localhost:3000";
const TMDB_KEY = "b04b3bee774c14e48850cbcb33a55d7d";

export default function Home() {
  const [filmesEmAlta, setFilmesEmAlta] = useState([]); // Estado para os filmes em alta
  const [ultimasReviews, setUltimasReviews] = useState([]); 
  const [busca, setBusca] = useState(""); 
  const [loadingFilmes, setLoadingFilmes] = useState(true); 
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [erro, setErro] = useState(null);
  const [indiceHero, setIndiceHero] = useState(0);

  const navigate = useNavigate();

  useEffect(() => {
    fetchFilmesEmAlta();
    fetchUltimasReviews();
  }, []);

  // Rotação do banner
  useEffect(() => {
    if (filmesEmAlta.length > 0) {
      const intervalo = setInterval(() => {
        setIndiceHero((prev) => (prev >= 4 ? 0 : prev + 1));
      }, 8000);
      return () => clearInterval(intervalo);
    }
  }, [filmesEmAlta]);

  async function fetchFilmesEmAlta() {
    setLoadingFilmes(true);
    try {
      const res = await axios.get(
        `https://api.themoviedb.org/3/trending/movie/week?api_key=${TMDB_KEY}&language=pt-BR`
      );

      const formatados = res.data.results.slice(0, 20).map((f) => ({
        id: f.id,
        titulo: f.title,
        sinopse: f.overview,
        poster: `https://image.tmdb.org/t/p/w500${f.poster_path}`,
        banner: `https://image.tmdb.org/t/p/original${f.backdrop_path}`,
      }));

      setFilmesEmAlta(formatados);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingFilmes(false);
    }
  }

  async function fetchUltimasReviews() {
    setLoadingReviews(true);
    // o token do localStorage para passar pelo segurança do Back-end 
    const token = localStorage.getItem("token");

    try {
      const { data } = await axios.get(`${API_BASE}/reviews`, {
        headers: { 'x-access-token': token } // Enviando o "crachá" para o Back-end reconhecer quem é o usuário e retornar só as reviews dele
      });
      setUltimasReviews(data.slice(0, 3));
    } catch (err) {
      console.error("Erro ao carregar reviews:", err);
      // Se o token for inválido, vai dar erro 401, e aí a gente desloga o usuário e pede para logar de novo
      if (err.response?.status === 401) {
        setErro("Sessão expirada. Por favor, faça login novamente.");
      }
    } finally {
      setLoadingReviews(false);
    }
  }

  function handleBusca(e) {
    e.preventDefault();
    if (busca.trim()) {
      navigate(`/filmes?q=${encodeURIComponent(busca.trim())}`);
    }
  }

  function renderEstrelas(nota) {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={`estrela ${i < Math.round(nota) ? "ativa" : ""}`}>★</span>
    ));
  }

  function formatarData(dataStr) { 
    if (!dataStr) return "";
    const d = new Date(dataStr);
    return d.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).toUpperCase().replace(". ", " ").replace(".", "");
  }

  // deslogar o usuario
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const heroAtual = filmesEmAlta[indiceHero];

  return (
    <div className="home-wrapper">
      <nav className="navbar">
        {/* Mudamos o link de entrar para sair caso o usuário queira deslogar */}
        <button onClick={handleLogout} className="nav-link btn-logout-link"> 
          Sair
        </button>
        <Link to="/home" className="logo">CineLog</Link>
        <div className="nav-links">
          <Link to="/home" className="nav-link">Filmes</Link>
          <Link to="/reviews" className="nav-link">Reviews</Link>
        </div>
        <form className="search-form" onSubmit={handleBusca}>
          <input
            type="text"
            className="search-input"
            placeholder="Pesquisar filme..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
          <button type="submit" className="search-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>
        </form>
      </nav>

      <section className="hero">
        {heroAtual ? (
          <>
            <div
              key={heroAtual.id}
              className="hero-bg"
              style={{ backgroundImage: `url(${heroAtual.banner || heroAtual.poster || ""})` }}
            />
            <div className="hero-overlay" />
            <div className="hero-content" key={`text-${heroAtual.id}`}>
              <h1 className="hero-titulo">{heroAtual.titulo}</h1>
              <p className="hero-sinopse">{heroAtual.sinopse}</p>
            </div>
          </>
        ) : (
          <div className="hero-placeholder" />
        )}
      </section>

      <main className="main-content">
        {erro && <div className="erro-banner">{erro}</div>}

        <section className="secao">
          <h2 className="secao-titulo">Filmes em Alta</h2>
          {loadingFilmes ? (
            <div className="loading-row">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="card-skeleton" />
              ))}
            </div>
          ) : (
            <div className="filmes-grid">
              {filmesEmAlta.map((filme) => (
                <Link key={filme.id} to={`/review/${filme.id}`} className="filme-card">
                  <img
                    src={filme.poster}
                    alt={filme.titulo}
                    className="filme-poster"
                    onError={(e) => { e.target.src = "https://via.placeholder.com/500x750?text=Sem+Poster"; }}
                  />
                  <div className="filme-hover-info">
                    <span className="filme-hover-titulo">{filme.titulo}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section className="secao">
          <div className="secao-header">
            <h2 className="secao-titulo">Minhas Últimas Reviews</h2>
            <Link to="/reviews" className="ver-mais">Ver mais</Link>
          </div>
          {loadingReviews ? (
            <div className="loading-row">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="review-skeleton" />
              ))}
            </div>
          ) : (
            <div className="reviews-lista">
              {ultimasReviews.map((review) => (
                <Link key={review.id} to={`/review/${review.filmeId || review.id}`} className="review-card">
                  <img
                    src={review.filmePoster}
                    alt={review.filmeTitulo}
                    className="review-poster"
                    onError={(e) => { e.target.src = "https://via.placeholder.com/500x750?text=Sem+Capa"; }}
                  />
                  <div className="review-info">
                    <div className="review-top">
                      <span className="review-titulo">{review.filmeTitulo}</span>
                      <span className="review-data">{formatarData(review.data)}</span>
                    </div>
                    <div className="review-estrelas">
                      {renderEstrelas(review.nota)}
                    </div>
                    <p className="review-texto">{review.texto}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>

      <footer className="footer">
        <div className="footer-top">
          <Link to="/home" className="logo footer-logo">CineLog</Link>
        </div>
        <div className="footer-bottom">
          <span className="footer-copy">© 2026 CineReview Platform.</span>
        </div>
      </footer>
    </div>
  );
}