import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

type Drink = {
  id: number;
  name: string;
  img: string;
  pairings: string[];
};

const DRINKS: Drink[] = [
  {
    id: 1,
    name: "Cabernet Sauvignon",
    img: "/drinks/cabernetsauvignon.png",
    pairings: [
      "Grilled Ribeye — Bold tannins match the char and richness perfectly.",
      "Aged Cheddar — Firm acidity cuts through the creamy sharpness.",
      "Lamb Chops — Herbaceous notes mirror the roasted herb crusting.",
    ],
  },
  {
    id: 2,
    name: "Chardonnay",
    img: "/drinks/chardonnay.png",
    pairings: [
      "Grilled Salmon — Buttery oak echoes the natural richness of the fish.",
      "Lobster Bisque — Creamy weight matches the wine's full body.",
      "Mushroom Risotto — Earthy depth complements the toasty oak notes.",
    ],
  },
  {
    id: 3,
    name: "Craft Lager",
    img: "/drinks/craftlager.png",
    pairings: [
      "Fish Tacos — Crisp carbonation cuts through the fried coating.",
      "Spicy Curry — Light body soothes the heat beautifully.",
      "Grilled Sausages — Malt sweetness complements the smoky char.",
    ],
  },
  {
    id: 4,
    name: "Beer",
    img: "/drinks/beer.png",
    pairings: [
      "Cheeseburger — Hoppy bitterness balances rich beef and melted cheese.",
      "BBQ Ribs — Malty sweetness complements the smoky glaze.",
      "Spicy Wings — Carbonation cools the heat between bites.",
    ],
  },
  {
    id: 5,
    name: "Gin and Tonic",
    img: "/drinks/ginandtonic.png",
    pairings: [
      "Smoked Salmon — Herbaceous botanicals echo the delicate brine.",
      "Oysters — Citrus and juniper amplify the oceanic freshness.",
      "Cucumber Canapés — Bright, clean botanicals match the crispness.",
    ],
  },
  {
    id: 6,
    name: "Pinot Noir",
    img: "/drinks/pinotnoir.png",
    pairings: [
      "Duck Breast — Cherry fruit notes complement the rich, gamey meat.",
      "Mushroom Risotto — Earthy undertones deepen savory umami flavors.",
      "Grilled Salmon — Silky tannins pair without overpowering the fish.",
    ],
  },
  {
    id: 7,
    name: "Port Wine",
    img: "/drinks/portwine.png",
    pairings: [
      "Dark Chocolate Truffles — Rich dried fruit mirrors the cocoa depth.",
      "Blue Cheese — Sweetness provides a classic sweet-salty contrast.",
      "Aged Gouda — Caramel complexity echoes the wine's nuttiness.",
    ],
  },
  {
    id: 8,
    name: "Prosecco",
    img: "/drinks/prosecco.png",
    pairings: [
      "Oysters — Effervescence enhances the briny oceanic freshness.",
      "Prosciutto & Melon — Bubbles cut through cured salt and sweetness.",
      "Light Sushi — Fine mousse cleanses the palate between delicate bites.",
    ],
  },
  {
    id: 9,
    name: "Sake",
    img: "/drinks/sake.png",
    pairings: [
      "Sushi & Sashimi — Clean umami harmonizes with the delicate fish.",
      "Steamed Dumplings — Subtle grain notes balance the savory filling.",
      "Miso Soup — Fermented depth echoes the broth's complexity.",
    ],
  },
  {
    id: 10,
    name: "Sauvignon Blanc",
    img: "/drinks/sauvignonblanc.png",
    pairings: [
      "Grilled Asparagus — Herbaceous notes mirror the vegetal freshness.",
      "Goat Cheese Salad — Bright acidity cuts through the creamy tang.",
      "Fresh Oysters — Mineral crispness echoes the ocean's salinity.",
    ],
  },
  {
    id: 11,
    name: "Tequila",
    img: "/drinks/tequila.png",
    pairings: [
      "Street Tacos — Agave earthiness matches the smoky, spiced meat.",
      "Spicy Guacamole — Bright agave contrasts the creamy avocado.",
      "Grilled Shrimp — Citrus notes lift the char and seasoning.",
    ],
  },
  {
    id: 12,
    name: "Whisky",
    img: "/drinks/whisky.png",
    pairings: [
      "Smoked Brisket — Peaty warmth mirrors the deep smoke and bark.",
      "Aged Gouda — Caramel and vanilla notes echo the nuttiness.",
      "Dark Chocolate — Smoky depth complements the bittersweet cocoa.",
    ],
  },
];

export default function DrinkSelection() {
  const [selectedDrink, setSelectedDrink] = useState<Drink | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  if (selectedDrink) {
    return (
      <div className="pair-page">
        <div className="pair-card">
          <h1 className="pair-title">Pairings for: {selectedDrink.name}</h1>
          <ul className="result-list">
            {selectedDrink.pairings.map((p) => (
              <li key={p} className="result-item">{p}</li>
            ))}
          </ul>
          <button
            className="button primary"
            style={{ marginTop: 24 }}
            onClick={() => setSelectedDrink(null)}
            type="button"
          >
            Try another drink
          </button>
          <button
            className="button primary"
            style={{ marginTop: 12 }}
            onClick={() => navigate("/pair/food")}
            type="button"
          >
            Try food pairings
          </button>
          {user ? (
            <button
              className="button primary"
              style={{ marginTop: 12 }}
              onClick={() => navigate("/pair/drink")}
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
    <div className="card drink-page">
      <h1>Drink Selection</h1>
      <p>Click a drink to see food pairing recommendations.</p>
      <div className="grid">
        {DRINKS.map((drink) => (
          <button
            key={drink.id}
            className="tile"
            onClick={() => setSelectedDrink(drink)}
            type="button"
          >
            <div className="tileImage">
              <img
                className="tileIcon"
                src={drink.img}
                alt={drink.name}
                loading="lazy"
              />
            </div>
            <div className="tileName">{drink.name}</div>
          </button>
        ))}
      </div>
      <div style={{ marginTop: 32, textAlign: "center" }}>
        {user ? (
          <button
            className="button primary"
            onClick={() => navigate("/pair/drink")}
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
