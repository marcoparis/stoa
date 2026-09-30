import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { AUTHORS } from "../data/authors";

export default function Credits() {
  return (
    <main className="page">
      <Link to="/" className="back-link"><ArrowLeft size={16} /> Torna al catalogo</Link>
      <h1 className="credits-title">Crediti immagini</h1>
      <p className="muted">
        I ritratti degli autori provengono da Wikimedia Commons e sono usati secondo le rispettive licenze
        (ritagliati e convertiti in bianco e nero).
      </p>
      <div className="credits-table-wrapper">
        <table className="credits-table">
          <thead>
            <tr><th>Ritratto</th><th>Autore dell&apos;immagine</th><th>Licenza</th></tr>
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
