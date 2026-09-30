import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { MessageSquare } from "lucide-react";
import { getBooks, searchBooks } from "../api";
import BookCover from "../components/BookCover";
import Loading from "../components/Loading";

export default function BookList() {
  const [params] = useSearchParams();
  const query = params.get("q")?.trim() ?? "";
  const field = params.get("by") === "author" ? "author" : "title";

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
  const state =
    result.key !== requestKey
      ? { status: "loading" }
      : { status: result.error ? "error" : "done", books: result.books, error: result.error };

  return (
    <main className="page">
      <div className="page-heading">
        <h1>{query ? `Risultati per “${query}”` : "Catalogo"}</h1>
        {query && (
          <p className="muted">
            Ricerca per {field === "author" ? "autore" : "titolo"} · <Link to="/">mostra tutti i libri</Link>
          </p>
        )}
      </div>

      {state.status === "loading" && <Loading label="Carico i libri..." />}
      {state.status === "error" && <p className="alert alert-error">{state.error}</p>}
      {state.status === "done" && state.books.length === 0 && (
        <p className="empty">Nessun libro trovato. Prova con un altro termine.</p>
      )}

      {state.status === "done" && state.books.length > 0 && (
        <ul className="book-grid">
          {state.books.map((book) => {
            const reviewCount = Object.keys(book.reviews ?? {}).length;
            return (
              <li key={book.isbn}>
                <Link to={`/books/${book.isbn}`} className="book-card">
                  <BookCover isbn={book.isbn} title={book.title} author={book.author} />
                  <div className="book-card-body">
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
