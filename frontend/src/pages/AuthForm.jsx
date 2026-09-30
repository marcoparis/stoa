import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";

const COPY = {
  login: {
    title: "Accedi",
    submit: "Accedi",
    busy: "Accesso in corso...",
    switchText: "Non hai un account?",
    switchLink: "Registrati",
    switchTo: "/register",
  },
  register: {
    title: "Crea un account",
    submit: "Registrati",
    busy: "Registrazione in corso...",
    switchText: "Hai già un account?",
    switchLink: "Accedi",
    switchTo: "/login",
  },
};

export default function AuthForm({ mode }) {
  const { user, login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from ?? "/";
  const copy = COPY[mode];

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to={redirectTo} replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await (mode === "login" ? login : register)(username.trim(), password);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <main className="page page-narrow">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>{copy.title}</h1>

        {error && <p className="alert alert-error" role="alert">{error}</p>}

        <label htmlFor="username">Username</label>
        <input
          id="username"
          autoComplete="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          {...(mode === "register" && { pattern: "[a-zA-Z0-9_.\\-]{3,30}", minLength: 3, maxLength: 30 })}
        />
        {mode === "register" && <p className="hint">3-30 caratteri: lettere, numeri, punto, trattino o underscore.</p>}

        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          {...(mode === "register" && { minLength: 6, maxLength: 72 })}
        />
        {mode === "register" && <p className="hint">Almeno 6 caratteri.</p>}

        <button type="submit" className="button button-block" disabled={busy}>
          {busy ? copy.busy : copy.submit}
        </button>

        <p className="auth-switch">
          {copy.switchText}{" "}
          <Link to={copy.switchTo} state={location.state}>{copy.switchLink}</Link>
        </p>
      </form>
    </main>
  );
}
