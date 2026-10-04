import { useCallback, useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { getBook, saveReview, deleteReview } from "../api";
import { useAuth } from "../auth/useAuth";
import BookCover from "../components/BookCover";
import Loading from "../components/Loading";

const MAX_REVIEW_LENGTH = 1000;

export default function BookDetail() {
  const { isbn } = useParams();
  const location = useLocation();
  const { user, token, logout } = useAuth();

  const [book, setBook] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [draft, setDraft] = useState("");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const myReview = user ? book?.reviews?.[user.username] : undefined;

  useEffect(() => {
    let cancelled = false;
    getBook(isbn)
      .then((b) => !cancelled && setBook(b))
      .catch((err) => !cancelled && setLoadError(err.message));
    return () => {
      cancelled = true;
    };
  }, [isbn]);

  const handleAuthError = useCallback(
    (err) => {
      if (err.status === 401 || err.status === 403) {
        logout();
        setFeedback({ type: "error", text: "Your session has expired: please log in again." });
      } else {
        setFeedback({ type: "error", text: err.message });
      }
    },
    [logout],
  );

  const startEditing = () => {
    setDraft(myReview ?? "");
    setEditing(true);
    setFeedback(null);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);
    try {
      const { message, reviews } = await saveReview(isbn, draft.trim(), token);
      setBook((b) => ({ ...b, reviews }));
      setEditing(false);
      setFeedback({ type: "success", text: message });
    } catch (err) {
      handleAuthError(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Do you really want to delete your review?")) return;
    setSaving(true);
    setFeedback(null);
    try {
      const { message, reviews } = await deleteReview(isbn, token);
      setBook((b) => ({ ...b, reviews }));
      setFeedback({ type: "success", text: message });
    } catch (err) {
      handleAuthError(err);
    } finally {
      setSaving(false);
    }
  };

  if (loadError) {
    return (
      <main className="page">
        <p className="alert alert-error">{loadError}</p>
        <Link to="/" className="back-link"><ArrowLeft size={16} /> Back to the catalog</Link>
      </main>
    );
  }

  if (!book) {
    return (
      <main className="page">
        <Loading label="Loading the book..." />
      </main>
    );
  }

  const reviews = Object.entries(book.reviews ?? {});

  return (
    <main className="page">
      <Link to="/" className="back-link"><ArrowLeft size={16} /> Back to the catalog</Link>

      <section className="book-detail">
        <BookCover title={book.title} author={book.author} category={book.category} size="lg" />
        <div className="book-info">
          <p className="muted small">
            {[book.category, book.year].filter(Boolean).join(" · ")}
          </p>
          <h1>{book.title}</h1>
          <p className="book-author">
            by <Link to={`/?${new URLSearchParams({ q: book.author, by: "author" })}`}>{book.author}</Link>
          </p>
          {book.description && <p className="book-description">{book.description}</p>}
        </div>
      </section>

      <section className="reviews">
        <h2>Reviews ({reviews.length})</h2>

        {feedback && <p className={`alert alert-${feedback.type}`} role="status">{feedback.text}</p>}

        {!user && (
          <p className="alert alert-info">
            <Link to="/login" state={{ from: location.pathname }}>Log in</Link> or{" "}
            <Link to="/register" state={{ from: location.pathname }}>sign up</Link> to write a review.
          </p>
        )}

        {user && !editing && (
          <div className="my-review-actions">
            <button className="button" onClick={startEditing} disabled={saving}>
              <Pencil size={16} /> {myReview ? "Edit your review" : "Write a review"}
            </button>
            {myReview && (
              <button className="button button-danger" onClick={handleDelete} disabled={saving}>
                <Trash2 size={16} /> Delete
              </button>
            )}
          </div>
        )}

        {user && editing && (
          <form className="review-form" onSubmit={handleSave}>
            <label htmlFor="review">Your review</label>
            <textarea
              id="review"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              maxLength={MAX_REVIEW_LENGTH}
              rows={5}
              required
              autoFocus
            />
            <div className="review-form-footer">
              <span className="muted small">{draft.length}/{MAX_REVIEW_LENGTH}</span>
              <div className="my-review-actions">
                <button type="button" className="button button-secondary" onClick={() => setEditing(false)}>
                  Cancel
                </button>
                <button type="submit" className="button" disabled={saving || !draft.trim()}>
                  {saving ? "Saving..." : "Publish"}
                </button>
              </div>
            </div>
          </form>
        )}

        {reviews.length === 0 ? (
          <p className="empty">No reviews yet: write the first one!</p>
        ) : (
          <ul className="review-list">
            {reviews.map(([username, text]) => (
              <li key={username} className={`review ${username === user?.username ? "review-mine" : ""}`}>
                <p className="review-author">
                  {username}
                  {username === user?.username && <span className="badge">you</span>}
                </p>
                <p className="review-text">{text}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
