import { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

const TMDB_KEY = "b04b3bee774c14e48850cbcb33a55d7d";

export default function App() {
  const [reviews, setReviews] = useState([]);
  const [modal, setModal] = useState(null); // 'add' ou 'edit'
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ title: "", rating: 5, comment: "", image: "" });

  const fetchReviews = async () => {
    try {
      const res = await axios.get("http://localhost:3000/reviews");
      setReviews(res.data);
    } catch (err) {
      console.error("Erro ao buscar dados:", err);
    }
  };
//
  useEffect(() => {
    fetchReviews();
  }, []);

  // Função para buscar a capa do filme usando a API do TMDB
  const buscarCapa = async () => {
    if (!form.title) return alert("Digite o nome do filme!");
    try {
      const res = await axios.get(
        `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_KEY}&query=${encodeURIComponent(form.title)}&language=pt-BR`
      );
      if (res.data.results.length > 0) {
        const posterPath = res.data.results[0].poster_path;
        const linkCompleto = `https://image.tmdb.org/t/p/w500${posterPath}`;
        setForm({ ...form, image: linkCompleto });
      } else {
        alert("Filme não encontrado.");
      }
    } catch (err) {
      alert("Erro ao buscar capa.");
    }
  };

  // Função para abrir o modal de edição carregando os dados
const handleEdit = (review) => {
  console.log("ID que está sendo editado:", review.id); // Adicione isso aqui!
  setEditingId(review.id);
  setForm({
    title: review.title,
    rating: review.rating,
    comment: review.comment,
    image: review.image
  });
  setModal("edit");
};

// Função para enviar os dados do formulário (tanto para criação quanto para edição)
  const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    if (modal === "edit") {
      console.log("Enviando PUT para o ID:", editingId);
      await axios.put(`http://localhost:3000/reviews/${editingId}`, form);
    } else {
      await axios.post("http://localhost:3000/reviews", form);
    }
    
    fecharModal();
    // Em vez de setTimeout, vamos apenas chamar a função e esperar
    await fetchReviews(); 
    
  } catch (err) {
    console.error("Erro na requisição:", err.response?.data || err.message);
    alert("Erro na comunicação com o servidor.");
  }
};

  const fecharModal = () => {
    setModal(null);
    setEditingId(null);
    setForm({ title: "", rating: 5, comment: "", image: "" });
  };

  const deleteReview = async (id) => {
    if (window.confirm("Excluir esta review?")) {
      await axios.delete(`http://localhost:3000/reviews/${id}`);
      fetchReviews();
    }
  };

  return (
    <div className="app">
      <nav className="navbar">
        <div className="navbar__logo">CineLog</div>
        <button className="navbar__add-btn" onClick={() => setModal("add")}>+ Add Review</button>
      </nav>

      <main className="main">
  {reviews.length === 0 ? (
    <div className="empty-state">
      <p>Nenhuma review por aqui ainda. Que tal adicionar o primeiro filme?</p>
    </div>
  ) : (
    <div className="reviews-grid">
      {reviews.map((r) => (
        <article key={r.id} className="card">
          <div className="card__poster">
            {r.image ? (
              <img 
                src={r.image.startsWith('http') ? r.image : `http://localhost:3000/uploads/${r.image}`} 
                alt={r.title} 
                className="card__image" 
                onError={(e) => { e.target.src = "https://via.placeholder.com/500x750?text=Erro+na+Capa"; }}
              />
            ) : (
              <span>Sem Capa</span>
            )}
          </div>
          <div className="card__body">
            <p className="card__title">{r.title}</p>
            <p className="card__stars">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</p>
            <p className="card__comment">{r.comment}</p>
          </div>
          <div className="card__actions">
            <button className="card__btn card__btn--edit" onClick={() => handleEdit(r)}>Editar</button>
            <button className="card__btn card__btn--delete" onClick={() => deleteReview(r.id)}>Excluir</button>
          </div>
        </article>
      ))}
    </div>
  )}
</main>

{/* Modal para adicionar/editar review */}

      {modal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2 className="modal__title">{modal === "edit" ? "Editar Review" : "Nova Review"}</h2>
            <form onSubmit={handleSubmit}>
              <div className="field">
                <label className="field__label">Nome do Filme</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input type="text" className="field__input" value={form.title} 
                    onChange={(e) => setForm({...form, title: e.target.value})} required />
                  <button type="button" className="navbar__add-btn" onClick={buscarCapa}>🔍</button>
                </div>
              </div>
              <div className="field">
                <label className="field__label">Capa (URL Automática)</label>
                <input type="text" className="field__input" value={form.image} 
                  onChange={(e) => setForm({...form, image: e.target.value})} />
              </div>
              <div className="field">
                <label className="field__label">Nota (1-5)</label>
                <input type="number" min="1" max="5" className="field__input" value={form.rating} 
                  onChange={(e) => setForm({...form, rating: parseInt(e.target.value)})} />
              </div>
              <div className="field">
                <label className="field__label">Comentário</label>
                <textarea className="field__textarea" value={form.comment} 
                  onChange={(e) => setForm({...form, comment: e.target.value})}></textarea>
              </div>
              <div className="modal__actions">
                <button type="button" className="modal__btn modal__btn--cancel" onClick={fecharModal}>Cancelar</button>
                <button type="submit" className="modal__btn modal__btn--submit">
                  {modal === "edit" ? "Atualizar" : "Salvar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}