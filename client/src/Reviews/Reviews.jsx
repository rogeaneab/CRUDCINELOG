import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom"; // Adicionado useNavigate
import "./Reviews.css";

const API_BASE = "http://localhost:3000";
const TMDB_KEY = "b04b3bee774c14e48850cbcb33a55d7d";

const FORM_INICIAL = {
  filmeId: "",
  filmeTitulo: "",
  filmeAno: "",
  filmeGenero: "",
  filmeDuracao: "",
  filmePoster: "",
  filmeBanner: "",
  diretor: "",
  nota: 0,
  texto: "",
  data: new Date().toISOString().split("T")[0],
};

// --- Sub-componentes mantidos (SeletorEstrelas, ReviewCard, ModalAdicionarReview, ModalReviewInfo) ---
// Certifique-se de que eles estão no seu arquivo conforme o código anterior.

function SeletorEstrelas({ valor, onChange, readonly = false }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="seletor-estrelas" aria-label="Nota em estrelas">
      {Array.from({ length: 5 }, (_, i) => i + 1).map((n) => (
        <button
          key={n}
          type="button"
          className={`estrela-btn ${n <= (hover || valor) ? "ativa" : ""}`}
          onClick={() => !readonly && onChange(n)}
          onMouseEnter={() => !readonly && setHover(n)}
          onMouseLeave={() => !readonly && setHover(0)}
          disabled={readonly}
          aria-label={`${n} estrela${n > 1 ? "s" : ""}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

function ReviewCard({ review, onClick }) {
  return (
    <div className="review-card" onClick={() => onClick(review)}>
      <div className="review-card-banner">
        <img
          src={review.filmeBanner || review.filmePoster}
          alt={review.filmeTitulo}
          className="review-card-img"
          onError={(e) => { e.target.src = "/placeholder-banner.jpg"; }}
        />
        <div className="review-card-overlay" />
      </div>
      <div className="review-card-body">
        <h3 className="review-card-titulo">{review.filmeTitulo}</h3>
        <SeletorEstrelas valor={review.nota} readonly />
        <p className="review-card-texto">{review.texto}</p>
        <button className="btn-ver-mais">Ver mais</button>
      </div>
    </div>
  );
}

function ModalAdicionarReview({ aberto, onFechar, onSalvar, reviewParaEditar }) {
  const [form, setForm] = useState(FORM_INICIAL);
  const [salvando, setSalvando] = useState(false);
  const [erroForm, setErroForm] = useState("");

  useEffect(() => {
    if (reviewParaEditar) { setForm(reviewParaEditar); } 
    else { setForm(FORM_INICIAL); }
    setErroForm("");
  }, [reviewParaEditar, aberto]);

  async function buscarDadosFilme() {
    if (!form.filmeTitulo) return alert("Digite o título do filme!");
    try {
      const resBusca = await axios.get(`https://api.themoviedb.org/3/search/movie?api_key=${TMDB_KEY}&query=${encodeURIComponent(form.filmeTitulo)}&language=pt-BR`);
      if (resBusca.data.results.length > 0) {
        const filmeId = resBusca.data.results[0].id;
        const resDetalhes = await axios.get(`https://api.themoviedb.org/3/movie/${filmeId}?api_key=${TMDB_KEY}&append_to_response=credits&language=pt-BR`);
        const dados = resDetalhes.data;
        const diretor = dados.credits.crew.find((p) => p.job === "Director")?.name || "";
        setForm({
          ...form,
          filmeId: dados.id,
          filmeTitulo: dados.title,
          filmeAno: dados.release_date.split("-")[0],
          filmeGenero: dados.genres.map((g) => g.name).join(", "),
          filmeDuracao: `${dados.runtime} min`,
          diretor: diretor,
          filmePoster: `https://image.tmdb.org/t/p/w500${dados.poster_path}`,
          filmeBanner: `https://image.tmdb.org/t/p/original${dados.backdrop_path}`,
        });
      } else { alert("Filme não encontrado."); }
    } catch (err) { alert("Erro ao buscar dados na API."); }
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.filmeTitulo.trim()) { setErroForm("Informe o título do filme."); return; }
    if (form.nota === 0) { setErroForm("Selecione uma nota de 1 a 5 estrelas."); return; }
    if (!form.texto.trim()) { setErroForm("Escreva o texto da sua review."); return; }
    setSalvando(true);
    setErroForm("");
    try {
      await onSalvar(form, reviewParaEditar?.id);
      onFechar();
    } catch (err) { setErroForm("Ocorreu um erro ao salvar. Tente novamente."); } 
    finally { setSalvando(false); }
  }

  if (!aberto) return null;

  return (
    <div className="modal-overlay" onClick={onFechar}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-titulo">{reviewParaEditar ? "Editar Review" : "Adicionar Review"}</h2>
          <button className="modal-fechar" onClick={onFechar} aria-label="Fechar">✕</button>
        </div>
        <form className="modal-form" onSubmit={handleSubmit}>
          <fieldset className="form-fieldset">
            <legend className="form-legend">Dados do Filme</legend>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Título *</label>
                <div style={{ display: "flex", gap: "8px" }}>
                  <input name="filmeTitulo" value={form.filmeTitulo} onChange={handleChange} className="form-input" placeholder="Ex: Obsessão" required />
                  <button type="button" onClick={buscarDadosFilme} className="btn-buscar-api" title="Buscar dados do filme">🔍</button>
                </div>
              </div>
              <div className="form-group form-group--sm">
                <label className="form-label">Ano</label>
                <input name="filmeAno" value={form.filmeAno} onChange={handleChange} className="form-input" placeholder="2025" />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Gênero</label>
                <input name="filmeGenero" value={form.filmeGenero} onChange={handleChange} className="form-input" placeholder="Ex: Terror" />
              </div>
              <div className="form-group form-group--sm">
                <label className="form-label">Duração</label>
                <input name="filmeDuracao" value={form.filmeDuracao} onChange={handleChange} className="form-input" placeholder="1h48" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Diretor</label>
              <input name="diretor" value={form.diretor} onChange={handleChange} className="form-input" placeholder="Ex: Curry Barker" />
            </div>
            <div className="form-group">
              <label className="form-label">URL do Poster</label>
              <input name="filmePoster" value={form.filmePoster} onChange={handleChange} className="form-input" placeholder="https://..." />
            </div>
          </fieldset>
          <fieldset className="form-fieldset">
            <legend className="form-legend">Sua Review</legend>
            <div className="form-group">
              <label className="form-label">Nota *</label>
              <SeletorEstrelas valor={form.nota} onChange={(n) => setForm((prev) => ({ ...prev, nota: n }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Texto *</label>
              <textarea name="texto" value={form.texto} onChange={handleChange} className="form-input form-textarea" placeholder="Escreva sua opinião sobre o filme..." rows={5} required />
            </div>
            <div className="form-group form-group--sm">
              <label className="form-label">Data</label>
              <input type="date" name="data" value={form.data} onChange={handleChange} className="form-input" />
            </div>
          </fieldset>
          {erroForm && <p className="form-erro">{erroForm}</p>}
          <div className="form-actions">
            <button type="button" className="btn-cancelar" onClick={onFechar} disabled={salvando}>Cancelar</button>
            <button type="submit" className="btn-salvar" disabled={salvando}>
              {salvando ? "Salvando..." : reviewParaEditar ? "Salvar alterações" : "Adicionar Review"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ModalReviewInfo({ review, onFechar, onEditar, onDeletar }) {
  const [deletando, setDeletando] = useState(false);
  if (!review) return null;
  async function handleDeletar() {
    if (!window.confirm("Tem certeza que deseja excluir esta review?")) return;
    setDeletando(true);
    try { await onDeletar(review.id); onFechar(); } 
    catch { alert("Erro ao excluir. Tente novamente."); } 
    finally { setDeletando(false); }
  }
  return (
    <div className="modal-overlay" onClick={onFechar}>
      <div className="modal-info-box" onClick={(e) => e.stopPropagation()}>
        <button className="modal-fechar modal-fechar--info" onClick={onFechar} aria-label="Fechar">✕</button>
        <div className="info-banner">
          <img src={review.filmeBanner || review.filmePoster} alt={review.filmeTitulo} className="info-banner-img" onError={(e) => { e.target.src = "/placeholder-banner.jpg"; }} />
          <div className="info-banner-overlay" />
        </div>
        <div className="info-body">
          <div className="info-top">
            <img src={review.filmePoster} alt={review.filmeTitulo} className="info-poster" onError={(e) => { e.target.src = "/placeholder-poster.jpg"; }} />
            <div className="info-meta">
              <h2 className="info-titulo">{review.filmeTitulo}{review.filmeDuracao && <span className="info-duracao"> ({review.filmeDuracao})</span>}</h2>
              <p className="info-sub">
                {review.filmeAno && <span>{review.filmeAno}</span>}
                {review.diretor && <span> · by {review.diretor}</span>}
                {review.filmeGenero && <span> · Gênero: {review.filmeGenero}</span>}
              </p>
              <SeletorEstrelas valor={review.nota} readonly />
            </div>
          </div>
          <div className="info-review-secao">
            <h3 className="info-review-titulo">Minha Review</h3>
            <p className="info-review-texto">{review.texto}</p>
          </div>
          <div className="info-acoes">
            <button className="btn-editar" onClick={() => onEditar(review)}>Editar</button>
            <button className="btn-deletar" onClick={handleDeletar} disabled={deletando}>{deletando ? "Excluindo..." : "Excluir"}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- COMPONENTE PRINCIPAL ---

export default function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  const [modalAdicionar, setModalAdicionar] = useState(false);
  const [reviewParaEditar, setReviewParaEditar] = useState(null);
  const [reviewSelecionada, setReviewSelecionada] = useState(null);

  const navigate = useNavigate();

  // Função centralizada para pegar o cabeçalho de autenticação
  const getAuthHeaders = () => ({
    headers: { "x-access-token": localStorage.getItem("token") }
  });

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    setErro(null);
    try {
      // AJUSTE: Enviando o token para buscar a lista
      const { data } = await axios.get(`${API_BASE}/reviews?_sort=data&_order=desc`, getAuthHeaders());
      setReviews(data);
    } catch (err) {
      if (err.response?.status === 401) {
        navigate("/"); // Redireciona se o token for inválido
      }
      setErro("Não foi possível carregar as reviews.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  async function salvarReview(form, id) {
    try {
      // AJUSTE: Enviando o token para Criar/Editar
      if (id) {
        await axios.put(`${API_BASE}/reviews/${id}`, form, getAuthHeaders());
      } else {
        await axios.post(`${API_BASE}/reviews`, form, getAuthHeaders());
      }
      await fetchReviews();
    } catch (err) {
      console.error("Erro ao salvar review:", err);
      throw err;
    }
  }

  async function deletarReview(id) {
    try {
      // AJUSTE: Enviando o token para Deletar
      await axios.delete(`${API_BASE}/reviews/${id}`, getAuthHeaders());
      await fetchReviews();
    } catch (err) {
      console.error("Erro ao deletar:", err);
      throw err;
    }
  }

  function abrirEdicao(review) {
    setReviewSelecionada(null);
    setReviewParaEditar(review);
    setModalAdicionar(true);
  }

  return (
    <div className="reviews-page">
      <nav className="navbar">
        <Link to="/home" className="logo">CineLog</Link>
        <div className="nav-actions">
           <button
            className="btn-adicionar"
            onClick={() => { setReviewParaEditar(null); setModalAdicionar(true); }}
          >
            + Adicionar Review
          </button>
        </div>
      </nav>

      <main className="reviews-main">
        {loading ? (
          <div className="reviews-grid">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="review-card-skeleton" />
            ))}
          </div>
        ) : erro ? (
          <div className="estado-erro">
            <p>{erro}</p>
            <button className="btn-retry" onClick={fetchReviews}>Tentar novamente</button>
          </div>
        ) : reviews.length === 0 ? (
          <div className="estado-vazio">
            <span className="estado-vazio-icon">🎬</span>
            <p>Você ainda não escreveu nenhuma review.</p>
            <button className="btn-adicionar" onClick={() => setModalAdicionar(true)}>
              + Adicionar sua primeira review
            </button>
          </div>
        ) : (
          <div className="reviews-grid">
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} onClick={setReviewSelecionada} />
            ))}
          </div>
        )}
      </main>

      <ModalAdicionarReview
        aberto={modalAdicionar}
        onFechar={() => { setModalAdicionar(false); setReviewParaEditar(null); }}
        onSalvar={salvarReview}
        reviewParaEditar={reviewParaEditar}
      />

      <ModalReviewInfo
        review={reviewSelecionada}
        onFechar={() => setReviewSelecionada(null)}
        onEditar={abrirEdicao}
        onDeletar={deletarReview}
      />
    </div>
  );
}