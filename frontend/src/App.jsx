import { Route, Routes, useLocation } from "react-router-dom";
import Header from "./components/Header";
import BookList from "./pages/BookList";
import BookDetail from "./pages/BookDetail";
import AuthForm from "./pages/AuthForm";
import { API_URL } from "./api";

export default function App() {
  const location = useLocation();

  return (
    <>
      {/* keyed on the query string so the search box reflects the current search */}
      <Header key={location.search} />
      <Routes>
        <Route path="/" element={<BookList />} />
        <Route path="/books/:isbn" element={<BookDetail />} />
        <Route path="/login" element={<AuthForm mode="login" />} />
        <Route path="/register" element={<AuthForm mode="register" />} />
        <Route path="*" element={<main className="page"><p className="empty">Pagina non trovata.</p></main>} />
      </Routes>
      <footer className="footer">
        Stoà · recensioni di filosofia e psicologia ·{" "}
        <a href={`${API_URL}/api-docs`} target="_blank" rel="noreferrer">API</a>
        {" · "}
        <a href="https://github.com/marcoparis/expressBookReviews" target="_blank" rel="noreferrer">Codice su GitHub</a>
      </footer>
    </>
  );
}
