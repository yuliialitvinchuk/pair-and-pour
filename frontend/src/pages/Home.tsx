import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="card hero">
      <h1 className="hero-title">Pair &amp; Pour</h1>

      <p className="hero-sub">
        Find the perfect drink for your food — or the perfect food for your
        drink.
      </p>

      <div className="image-buttons">
        <Link to="/foods" className="image-card">
          <img src="/frontpagefood.png" alt="Food pairing" />
          <span>Start with Food</span>
        </Link>

        <div className="image-divider">or</div>

        <Link to="/drinks" className="image-card">
          <img src="/frontpagedrink.png" alt="Drink pairing" />
          <span>Start with Drink</span>
        </Link>
      </div>

      {!user && (
        <div className="hero-cta">
          <Link to="/login" className="button primary hero-cta-btn">
            Log in to unlock more pairings &amp; personalisation
          </Link>
          <p className="muted" style={{ marginTop: "10px" }}>
            No account? <Link to="/signup">Sign up free</Link>
          </p>
        </div>
      )}
    </div>
  );
}
