import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { AUTHORS } from "../data/authors";

export default function Credits() {
  return (
    <main className="page">
      <Link to="/" className="back-link"><ArrowLeft size={16} /> Back to the catalog</Link>
      <h1 className="credits-title">Image credits</h1>
      <p className="muted">
        The author portraits come from Wikimedia Commons and are used under their respective licenses
        (cropped and converted to black and white).
      </p>
      <div className="credits-table-wrapper">
        <table className="credits-table">
          <thead>
            <tr><th>Portrait</th><th>Image author</th><th>License</th></tr>
          </thead>
          <tbody>
            {Object.entries(AUTHORS).map(([name, { credit }]) => (
              <tr key={name}>
                <td><a href={credit.source} target="_blank" rel="noreferrer">{name}</a></td>
                <td>{credit.author}</td>
                <td>{credit.license}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
