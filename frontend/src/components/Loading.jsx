import { useEffect, useState } from "react";
import { LoaderCircle } from "lucide-react";

const SLOW_AFTER_MS = 4000;

export default function Loading({ label = "Loading..." }) {
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
          The free server is waking up after a period of inactivity: this can take up to a minute.
        </p>
      )}
    </div>
  );
}
