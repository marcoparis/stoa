import { useEffect, useState } from "react";
import { LoaderCircle } from "lucide-react";

const SLOW_AFTER_MS = 4000;

export default function Loading({ label = "Caricamento..." }) {
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setSlow(true), SLOW_AFTER_MS);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="loading" role="status">
      <LoaderCircle className="spin" size={32} />
      <p>{label}</p>
      {slow && (
        <p className="loading-hint">
          Il server gratuito si sta risvegliando dopo un periodo di inattività: può servire fino a un minuto.
        </p>
      )}
    </div>
  );
}
