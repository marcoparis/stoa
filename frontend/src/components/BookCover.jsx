const PALETTES = {
  Stoicismo: ["#2c3e5c", "#5b7399"],
  "Filosofia antica": ["#7a3b2a", "#b8694c"],
  "Filosofia moderna": ["#1f2a44", "#3d4f7a"],
  Esistenzialismo: ["#2e2e33", "#5c5c66"],
  Psicologia: ["#1f4a4a", "#3f8080"],
};
const FALLBACK = ["#3a3f4b", "#6b7280"];

export default function BookCover({ title, author, category, size = "md" }) {
  const [from, to] = PALETTES[category] ?? FALLBACK;
  return (
    <div className={`book-cover book-cover-${size}`} style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}>
      <span className="book-cover-title">{title}</span>
      <span className="book-cover-author">{author}</span>
    </div>
  );
}
