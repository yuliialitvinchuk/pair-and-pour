import { useEffect, useState } from "react";
import { Routes, Route, Link } from "react-router-dom";
import { auth } from "./firebase";
import { signOut, onAuthStateChanged, User } from "firebase/auth";
import ForgotPassword from "./pages/ForgotPassword";
import RequireAuth from "./components/RequireAuth";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import PairFood from "./pages/PairFood";
import PairDrink from "./pages/PairDrink";
import CustomizePreferences from "./pages/CustomizePreference";
import FoodSelection from "./pages/FoodSelection";
import DrinkSelection from "./pages/DrinkSelection";
import ContactUs from "./pages/ContactUs";

function App() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    return onAuthStateChanged(auth, setUser);
  }, []);

  return (
    <div>
      <header className="topbar">
        <Link to="/">Pair & Pour</Link>

        <nav>
          <Link to="/foods">Foods</Link>
          <Link to="/drinks">Drinks</Link>
          <Link to="/contact">Contact Us</Link>
          {user ? (
            <>
              <Link to="/dashboard">Dashboard</Link>
              <button onClick={() => signOut(auth)}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/signup">Signup</Link>
            </>
          )}
        </nav>
      </header>

      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/foods" element={<FoodSelection />} />
          <Route path="/drinks" element={<DrinkSelection />} />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
          <Route path="/pair/food" element={<RequireAuth><PairFood /></RequireAuth>} />
          <Route path="/pair/drink" element={<RequireAuth><PairDrink /></RequireAuth>} />
          <Route path="/customize" element={<RequireAuth><CustomizePreferences /></RequireAuth>} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;