import { authorPortrait } from "../data/authors";

const PALETTES = {
  Stoicism: ["#2c3e5c", "#5b7399"],
  "Ancient philosophy": ["#7a3b2a", "#b8694c"],
  "Modern philosophy": ["#1f2a44", "#3d4f7a"],
  Existentialism: ["#2e2e33", "#5c5c66"],
  Psychology: ["#1f4a4a", "#3f8080"],
};
const FALLBACK = ["#3a3f4b", "#6b7280"];

export default function BookCover({ title, author, category, size = "md" }) {
  const [from, to] = PALETTES[category] ?? FALLBACK;
  const portrait = authorPortrait(author);

  return (
    <div className={`book-cover book-cover-${size}`} style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}>
      {portrait && <img className="book-cover-portrait" src={portrait} alt={`Portrait of ${author}`} loading="lazy" />}
      <div
        className="book-cover-text"
        style={portrait ? { background: `linear-gradient(to top, ${from} 0%, ${from}e6 40%, ${from}00 100%)` } : undefined}
      >
        <span className="book-cover-title">{title}</span>
        <span className="book-cover-author">{author}</span>
      </div>
    </div>
  );
}
