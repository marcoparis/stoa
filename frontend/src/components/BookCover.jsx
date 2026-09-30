const PALETTES = [
  ["#1e3a5f", "#3b6ea5"],
  ["#5b2a3c", "#a24a6b"],
  ["#2f4f3a", "#5f8f6b"],
  ["#4a3b1e", "#a07b3a"],
  ["#3a2f5b", "#6f5fa8"],
  ["#1f4a4a", "#3f8f8f"],
];

export default function BookCover({ isbn, title, author, size = "md" }) {
  const [from, to] = PALETTES[Number(isbn) % PALETTES.length || 0];
  return (
    <div className={`book-cover book-cover-${size}`} style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}>
      <span className="book-cover-title">{title}</span>
      <span className="book-cover-author">{author}</span>
    </div>
  );
}
