import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Landmark, LogOut, Search, UserRound } from "lucide-react";
import { useAuth } from "../auth/useAuth";

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [query, setQuery] = useState(params.get("q") ?? "");
  const [field, setField] = useState(params.get("by") ?? "title");

  const handleSearch = (e) => {
    e.preventDefault();
    const q = query.trim();
    navigate(q ? `/?${new URLSearchParams({ q, by: field })}` : "/");
  };

  return (
    <header className="header">
      <Link to="/" className="brand" onClick={() => setQuery("")}>
        <Landmark size={26} />
        <span>Stoà</span>
      </Link>

      <form className="search" onSubmit={handleSearch} role="search">
        <select value={field} onChange={(e) => setField(e.target.value)} aria-label="Cerca per">
          <option value="title">Titolo</option>
          <option value="author">Autore</option>
        </select>
        <input
          type="search"
          placeholder={field === "title" ? "Cerca un titolo..." : "Cerca un autore..."}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Testo da cercare"
        />
        <button type="submit" aria-label="Cerca">
          <Search size={18} />
        </button>
      </form>

      <div className="user-area">
        {user ? (
          <>
            <span className="user-name">
              <UserRound size={18} /> {user.username}
            </span>
            <button className="link-button" onClick={logout}>
              <LogOut size={16} /> Esci
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="link-button">Accedi</Link>
            <Link to="/register" className="button-small">Registrati</Link>
          </>
        )}
      </div>
    </header>
  );
}
