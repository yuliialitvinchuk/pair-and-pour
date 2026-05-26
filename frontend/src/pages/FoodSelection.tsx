import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

type Food = {
  id: number;
  name: string;
  img: string;
  pairings: string[];
};

const FOODS: Food[] = [
  {
    id: 1,
    name: "Tacos",
    img: "/foods/tacos.png",
    pairings: [
      "Tequila Blanco — Agave's earthiness matches the char and spice.",
      "Craft Lager — Light carbonation cools the heat beautifully.",
      "Sangria — Fruity acidity complements smoky meat perfectly.",
    ],
  },
  {
    id: 2,
    name: "Sushi",
    img: "/foods/sushi.png",
    pairings: [
      "Sake — Clean umami character elevates the delicate fish.",
      "Dry Riesling — Bright acidity mirrors the tang of pickled ginger.",
      "Prosecco — Fine bubbles refresh the palate between bites.",
    ],
  },
  {
    id: 3,
    name: "Dumplings",
    img: "/foods/dumplings.png",
    pairings: [
      "Sake — Subtle grain notes balance the savory pork filling.",
      "Craft Lager — Crisp carbonation cuts through rich wrappers.",
      "Pinot Noir — Light tannins complement the delicate filling.",
    ],
  },
  {
    id: 4,
    name: "Salmon",
    img: "/foods/salmon.png",
    pairings: [
      "Chardonnay — Buttery oak notes mirror the richness of the fish.",
      "Pinot Noir — Silky tannins pair elegantly without overpowering.",
      "Sauvignon Blanc — Citrus crispness lifts the natural sweetness.",
    ],
  },
  {
    id: 5,
    name: "Oysters",
    img: "/foods/oysters.png",
    pairings: [
      "Prosecco — Fine bubbles enhance the briny, oceanic freshness.",
      "Sauvignon Blanc — Mineral crispness echoes the sea.",
      "Gin and Tonic — Herbaceous botanicals complement the brininess.",
    ],
  },
  {
    id: 6,
    name: "Curry",
    img: "/foods/curry.png",
    pairings: [
      "Craft Lager — Light carbonation soothes the heat perfectly.",
      "Dry Riesling — Off-dry sweetness tames bold spice beautifully.",
      "Beer — Malt sweetness balances the aromatic complexity.",
    ],
  },
  {
    id: 7,
    name: "Burger",
    img: "/foods/burger.png",
    pairings: [
      "Beer — Hoppy bitterness cuts through rich beef and cheese.",
      "Cabernet Sauvignon — Bold tannins stand up to the richness.",
      "Whisky — Smoky warmth pairs with caramelized beef flavors.",
    ],
  },
  {
    id: 8,
    name: "Cheese",
    img: "/foods/cheese.png",
    pairings: [
      "Cabernet Sauvignon — Firm tannins harmonize with aged complexity.",
      "Port Wine — Sweetness contrasts beautifully with salty blues.",
      "Prosecco — Effervescence cleanses the palate between bites.",
    ],
  },
  {
    id: 9,
    name: "Chocolate Dessert",
    img: "/foods/dessert.png",
    pairings: [
      "Port Wine — Rich dried fruit notes mirror dark chocolate depth.",
      "Whisky — Smoky caramel warmth complements bittersweet cocoa.",
      "Stout — Roasted malt echoes the deep chocolate intensity.",
    ],
  },
  {
    id: 10,
    name: "Pizza",
    img: "/foods/pizza.png",
    pairings: [
      "Craft Lager — Crisp and refreshing against tomato and melted cheese.",
      "Pinot Noir — Bright cherry notes complement the tomato base.",
      "Beer — Malty body balances the savory toppings perfectly.",
    ],
  },
  {
    id: 11,
    name: "Ramen",
    img: "/foods/ramen.png",
    pairings: [
      "Sake — Umami-rich notes deepen the complexity of the broth.",
      "Craft Lager — Effervescence cuts through the fatty richness.",
      "Whisky Highball — Sparkling whisky lifts the bold soy-based broth.",
    ],
  },
  {
    id: 12,
    name: "Pasta",
    img: "/foods/pasta.png",
    pairings: [
      "Chardonnay — Creamy oak pairs beautifully with white sauce.",
      "Pinot Noir — Earthy, light body matches tomato-based sauces.",
      "Prosecco — Lively bubbles cut through rich carbonara.",
    ],
  },
];

export default function FoodSelection() {
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  if (selectedFood) {
    return (
      <div className="pair-page">
        <div className="pair-card">
          <h1 className="pair-title">Pairings for: {selectedFood.name}</h1>
          <ul className="result-list">
            {selectedFood.pairings.map((p) => (
              <li key={p} className="result-item">{p}</li>
            ))}
          </ul>
          <button
            className="button primary"
            style={{ marginTop: 24 }}
            onClick={() => setSelectedFood(null)}
            type="button"
          >
            Try another dish
          </button>
          <button
            className="button primary"
            style={{ marginTop: 12 }}
            onClick={() => navigate("/drinks")}
            type="button"
          >
            Try drink pairings
          </button>
          {user ? (
            <button
              className="button primary"
              style={{ marginTop: 12 }}
              onClick={() => navigate("/pair/food")}
              type="button"
            >
              Get personalised pairings
            </button>
          ) : (
            <Link to="/login" className="button primary" style={{ marginTop: 12, display: "block", textAlign: "center" }}>
              Sign in to unlock personalised pairings
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="card food-page">
      <h1>Food Selection</h1>
      <p>Click a dish to see drink pairing recommendations.</p>
      <div className="grid">
        {FOODS.map((food) => (
          <button
            key={food.id}
            className="tile"
            onClick={() => setSelectedFood(food)}
            type="button"
          >
            <div className="tileImage">
              <img
                className="tileIcon"
                src={food.img}
                alt={food.name}
                loading="lazy"
              />
            </div>
            <div className="tileName">{food.name}</div>
          </button>
        ))}
      </div>
      <div style={{ marginTop: 32, textAlign: "center" }}>
        {user ? (
          <button
            className="button primary"
            onClick={() => navigate("/pair/food")}
            type="button"
          >
            Get personalised pairings
          </button>
        ) : (
          <Link to="/login" className="button primary" style={{ display: "inline-block" }}>
            Sign in to unlock personalised pairings
          </Link>
        )}
      </div>
    </div>
  );
}