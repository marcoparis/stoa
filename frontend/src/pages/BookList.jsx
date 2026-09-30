import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { MessageSquare } from "lucide-react";
import { getBooks, searchBooks } from "../api";
import BookCover from "../components/BookCover";
import Loading from "../components/Loading";

export default function BookList() {
  const [params, setParams] = useSearchParams();
  const query = params.get("q")?.trim() ?? "";
  const field = params.get("by") === "author" ? "author" : "title";
  const category = params.get("cat") ?? "";

  const requestKey = `${field}:${query}`;
  const [result, setResult] = useState({ key: null, books: [], error: null });

  useEffect(() => {
    let cancelled = false;
    (query ? searchBooks(field, query) : getBooks())
      .then((books) => !cancelled && setResult({ key: requestKey, books, error: null }))
      .catch((error) => !cancelled && setResult({ key: requestKey, books: [], error: error.message }));
    return () => {
      cancelled = true;
    };
  }, [query, field, requestKey]);

  // results belonging to a previous search are treated as still loading
  const loading = result.key !== requestKey;
  const categories = [...new Set(result.books.map((b) => b.category).filter(Boolean))];
  const books = category ? result.books.filter((b) => b.category === category) : result.books;

  const selectCategory = (value) => {
    const next = new URLSearchParams(params);
    if (value) next.set("cat", value);
    else next.delete("cat");
    setParams(next);
  };

  return (
    <main className="page">
      {query ? (
        <div className="page-heading">
          <h1>Risultati per “{query}”</h1>
          <p className="muted">
            Ricerca per {field === "author" ? "autore" : "titolo"} · <Link to="/">mostra tutti i libri</Link>
          </p>
        </div>
      ) : (
        <div className="intro">
          <h1>Libri che insegnano a vivere</h1>
          <p>
            Stoici, classici, Kant, Nietzsche, esistenzialisti e grandi nomi della psicologia. Leggi le recensioni dei
            lettori e aggiungi la tua.
          </p>
        </div>
      )}

      {!loading && !result.error && categories.length > 1 && (
        <div className="filters" role="group" aria-label="Filtra per corrente">
          <button className={`chip ${!category ? "active" : ""}`} onClick={() => selectCategory("")}>Tutti</button>
          {categories.map((c) => (
            <button key={c} className={`chip ${category === c ? "active" : ""}`} onClick={() => selectCategory(c)}>
              {c}
            </button>
          ))}
        </div>
      )}

      {loading && <Loading label="Carico i libri..." />}
      {!loading && result.error && <p className="alert alert-error">{result.error}</p>}
      {!loading && !result.error && books.length === 0 && (
        <p className="empty">Nessun libro trovato. Prova con un altro termine.</p>
      )}

      {!loading && books.length > 0 && (
        <ul className="book-grid">
          {books.map((book) => {
            const reviewCount = Object.keys(book.reviews ?? {}).length;
            return (
              <li key={book.isbn}>
                <Link to={`/books/${book.isbn}`} className="book-card">
                  <BookCover title={book.title} author={book.author} category={book.category} />
                  <div className="book-card-body">
                    {book.category && <span className="category-label">{book.category}</span>}
                    <h2>{book.title}</h2>
                    <p className="muted">{book.author}</p>
                    <p className="review-count">
                      <MessageSquare size={15} /> {reviewCount} {reviewCount === 1 ? "recensione" : "recensioni"}
                    </p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
