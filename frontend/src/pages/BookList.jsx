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
          <h1>Results for “{query}”</h1>
          <p className="muted">
            Search by {field === "author" ? "author" : "title"} · <Link to="/">show all books</Link>
          </p>
        </div>
      ) : (
        <div className="intro">
          <h1>Books that teach you how to live</h1>
          <p>
            Stoics, classics, Kant, Nietzsche, existentialists and great names in psychology. Read the readers'
            reviews and add your own.
          </p>
        </div>
      )}

      {!loading && !result.error && categories.length > 1 && (
        <div className="filters" role="group" aria-label="Filter by school of thought">
          <button className={`chip ${!category ? "active" : ""}`} onClick={() => selectCategory("")}>All</button>
          {categories.map((c) => (
            <button key={c} className={`chip ${category === c ? "active" : ""}`} onClick={() => selectCategory(c)}>
              {c}
            </button>
          ))}
        </div>
      )}

      {loading && <Loading label="Loading books..." />}
      {!loading && result.error && <p className="alert alert-error">{result.error}</p>}
      {!loading && !result.error && books.length === 0 && (
        <p className="empty">No books found. Try another term.</p>
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
                      <MessageSquare size={15} /> {reviewCount} {reviewCount === 1 ? "review" : "reviews"}
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
