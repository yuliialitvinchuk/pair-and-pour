// The main screen after login. 
// Shows a greeting, lets the user navigate to the app's core features (food/drink pairing, preferences), 
// and displays basic account info with a logout button.

import { Link } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

// Use displayName if it exists and isn't just the email
// Otherwise extract the part before @ from the email
// Fall back to "there" if nothing is available → "Welcome back, there!"
export default function Dashboard() {
  const { user } = useAuth();
  const displayName =
    user?.displayName && user.displayName !== user.email
      ? user.displayName
      : user?.email?.split("@")[0] ?? "there";

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Welcome back, {displayName}!</h1>
          <p className="dashboard-email">{user?.email}</p>
        </div>
      </div>

      <p className="section-label">What would you like to pair today?</p>
      {/* Three navigation cards linking to the main features of the app.*/}
      <div className="action-grid">
        <Link to="/pair/food" className="action-card">
          <div className="action-card-label">Pair with Food</div>
          <div className="action-card-desc">
            Choose a dish and find the perfect drink to complement it
          </div>
        </Link>

        <Link to="/pair/drink" className="action-card">
          <div className="action-card-label">Pair with Alcohol</div>
          <div className="action-card-desc">
            Start with a drink and discover ideal food matches
          </div>
        </Link>

        <Link to="/customize" className="action-card">
          <div className="action-card-label">Customize My Pairing</div>
          <div className="action-card-desc">
            Set dietary restrictions, flavor preferences, and alcohol notes
          </div>
        </Link>
      </div>

    </div>
  );
}