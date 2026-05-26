const fetch = require("node-fetch");

const API_URL = "http://localhost:4000";

const TOKEN = process.env.TEST_TOKEN || "";

async function pair(body) {
  const res = await fetch(`${API_URL}/pair`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${TOKEN}`,
    },
    body: JSON.stringify(body),
  });
  return res.json();
}

async function getFoods(params = "") {
  const res = await fetch(`${API_URL}/foods${params}`, {
    headers: { Authorization: `Bearer ${TOKEN}` },
  });
  return res.json();
}

async function getDrinks(params = "") {
  const res = await fetch(`${API_URL}/drinks${params}`, {
    headers: { Authorization: `Bearer ${TOKEN}` },
  });
  return res.json();
}

async function contact(body) {
  const res = await fetch(`${API_URL}/contact`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json();
}

function drinkNames(data) {
  return data.data.pairings.map((p) => p.drink?.id).sort();
}

function foodNames(data) {
  return data.data.pairings.map((p) => p.food?.id).sort();
}

/* -------- BASIC PAIRING -------- */

describe("Basic pairing — foodId", () => {
  test("pizza returns lager and red_wine", async () => {
    const data = await pair({ foodId: "pizza" });
    expect(data.success).toBe(true);
    expect(drinkNames(data)).toEqual(["lager", "red_wine"].sort());
  });

  test("risotto returns white_wine and champagne", async () => {
    const data = await pair({ foodId: "risotto" });
    expect(data.success).toBe(true);
    expect(drinkNames(data)).toEqual(["champagne", "white_wine"].sort());
  });

  test("fries returns lager and cider", async () => {
    const data = await pair({ foodId: "fries" });
    expect(data.success).toBe(true);
    expect(drinkNames(data)).toEqual(["cider", "lager"].sort());
  });
});

describe("Basic pairing — drinkId", () => {
  test("lager returns 14 foods", async () => {
    const data = await pair({ drinkId: "lager" });
    expect(data.success).toBe(true);
    expect(data.data.pairings.length).toBe(14);
  });

  test("rose_wine returns salad and grilled_salmon", async () => {
    const data = await pair({ drinkId: "rose_wine" });
    expect(data.success).toBe(true);
    expect(foodNames(data)).toEqual(["grilled_salmon", "salad"].sort());
  });
});

/* -------- VALIDATION ERRORS -------- */

describe("Validation errors", () => {
  test("no foodId or drinkId returns 422", async () => {
    const data = await pair({});
    expect(data.success).toBe(false);
    expect(data.error.code).toBe("VALIDATION_ERROR");
  });

  test("both foodId and drinkId returns 422", async () => {
    const data = await pair({ foodId: "pizza", drinkId: "lager" });
    expect(data.success).toBe(false);
    expect(data.error.code).toBe("VALIDATION_ERROR");
  });

  test("non-existent foodId returns 404", async () => {
    const data = await pair({ foodId: "unicorn_steak" });
    expect(data.success).toBe(false);
    expect(data.error.code).toBe("NOT_FOUND");
  });

  test("non-existent drinkId returns 404", async () => {
    const data = await pair({ drinkId: "magic_juice" });
    expect(data.success).toBe(false);
    expect(data.error.code).toBe("NOT_FOUND");
  });
});

/* -------- DIETARY FILTERING -------- */

describe("Dietary filtering — foodId branch (filters drinks)", () => {
  test("pizza + vegan returns lager and red_wine (both vegan)", async () => {
    const data = await pair({ foodId: "pizza", dietary: ["vegan"] });
    expect(data.success).toBe(true);
    expect(drinkNames(data)).toEqual(["lager", "red_wine"].sort());
  });

  test("fries + celiac/gluten-free returns only cider", async () => {
    const data = await pair({ foodId: "fries", dietary: ["celiac / gluten-free"] });
    expect(data.success).toBe(true);
    expect(drinkNames(data)).toEqual(["cider"]);
  });

  test("ramen + halal returns lager and sake", async () => {
    const data = await pair({ foodId: "ramen", dietary: ["halal"] });
    expect(data.success).toBe(true);
    expect(drinkNames(data)).toEqual(["lager", "sake"].sort());
  });
});

describe("Dietary filtering — drinkId branch (filters foods)", () => {
  test("lager + vegan returns fries and curry", async () => {
    const data = await pair({ drinkId: "lager", dietary: ["vegan"] });
    expect(data.success).toBe(true);
    expect(foodNames(data)).toEqual(["curry", "fries"].sort());
  });

  test("lager + pescatarian returns fish_and_chips and sushi", async () => {
    const data = await pair({ drinkId: "lager", dietary: ["pescatarian"] });
    expect(data.success).toBe(true);
    expect(foodNames(data)).toEqual(["fish_and_chips", "sushi"].sort());
  });

  test("white_wine + vegetarian returns pasta, salad, omelette, risotto", async () => {
    const data = await pair({ drinkId: "white_wine", dietary: ["vegetarian"] });
    expect(data.success).toBe(true);
    expect(foodNames(data)).toEqual(["omelette", "pasta", "risotto", "salad"].sort());
  });

  test("rose_wine + pescatarian returns only grilled_salmon", async () => {
    const data = await pair({ drinkId: "rose_wine", dietary: ["pescatarian"] });
    expect(data.success).toBe(true);
    expect(foodNames(data)).toEqual(["grilled_salmon"]);
  });
});

/* -------- ALCOHOL TYPES FILTERING -------- */

describe("AlcoholTypes filtering", () => {
  test("pizza + Beer returns only lager", async () => {
    const data = await pair({ foodId: "pizza", alcoholTypes: ["Beer"] });
    expect(data.success).toBe(true);
    expect(drinkNames(data)).toEqual(["lager"]);
  });

  test("steak + Whiskey / Bourbon returns only whiskey", async () => {
    const data = await pair({ foodId: "steak", alcoholTypes: ["Whiskey / Bourbon"] });
    expect(data.success).toBe(true);
    expect(drinkNames(data)).toEqual(["whiskey"]);
  });

  test("curry + Beer returns lager and ipa", async () => {
    const data = await pair({ foodId: "curry", alcoholTypes: ["Beer"] });
    expect(data.success).toBe(true);
    expect(drinkNames(data)).toEqual(["ipa", "lager"].sort());
  });

  test("tacos + Cocktails returns only margarita", async () => {
    const data = await pair({ foodId: "tacos", alcoholTypes: ["Cocktails"] });
    expect(data.success).toBe(true);
    expect(drinkNames(data)).toEqual(["margarita"]);
  });

  test("risotto + Sparkling Wine / Champagne returns champagne and white_wine", async () => {
    const data = await pair({ foodId: "risotto", alcoholTypes: ["Sparkling Wine / Champagne"] });
    expect(data.success).toBe(true);
    expect(drinkNames(data)).toEqual(["champagne", "white_wine"].sort());
  });
});

/* -------- FLAVORS FILTERING -------- */

describe("Flavors filtering", () => {
  test("pizza + dry returns only red_wine", async () => {
    const data = await pair({ foodId: "pizza", flavors: ["dry"] });
    expect(data.success).toBe(true);
    expect(drinkNames(data)).toEqual(["red_wine"]);
  });

  test("fries + sweet returns only cider", async () => {
    const data = await pair({ foodId: "fries", flavors: ["sweet"] });
    expect(data.success).toBe(true);
    expect(drinkNames(data)).toEqual(["cider"]);
  });

  test("nachos + sour / tart returns only margarita", async () => {
    const data = await pair({ foodId: "nachos", flavors: ["sour / tart"] });
    expect(data.success).toBe(true);
    expect(drinkNames(data)).toEqual(["margarita"]);
  });

  test("pasta + earthy returns only red_wine", async () => {
    const data = await pair({ foodId: "pasta", flavors: ["earthy"] });
    expect(data.success).toBe(true);
    expect(drinkNames(data)).toEqual(["red_wine"]);
  });

  test("pancakes + bitter returns empty", async () => {
    const data = await pair({ foodId: "pancakes", flavors: ["bitter"] });
    expect(data.success).toBe(true);
    expect(data.data.pairings.length).toBe(0);
  });
});

/* -------- COMBINED FILTERING -------- */

describe("Combined filtering", () => {
  test("curry + vegan + Beer returns lager and ipa", async () => {
    const data = await pair({ foodId: "curry", dietary: ["vegan"], alcoholTypes: ["Beer"] });
    expect(data.success).toBe(true);
    expect(drinkNames(data)).toEqual(["ipa", "lager"].sort());
  });

  test("pizza + vegan + dry returns only red_wine", async () => {
    const data = await pair({ foodId: "pizza", dietary: ["vegan"], flavors: ["dry"] });
    expect(data.success).toBe(true);
    expect(drinkNames(data)).toEqual(["red_wine"]);
  });

  test("fries + celiac/gluten-free + Beer returns only cider", async () => {
    const data = await pair({ foodId: "fries", dietary: ["celiac / gluten-free"], alcoholTypes: ["Beer"] });
    expect(data.success).toBe(true);
    expect(drinkNames(data)).toEqual(["cider"]);
  });

  test("steak + vegan + Beer returns empty", async () => {
    const data = await pair({ foodId: "steak", dietary: ["vegan"], alcoholTypes: ["Beer"] });
    expect(data.success).toBe(true);
    expect(data.data.pairings.length).toBe(0);
  });

  test("burger + halal + Beer returns lager and ipa", async () => {
    const data = await pair({ foodId: "burger", dietary: ["halal"], alcoholTypes: ["Beer"] });
    expect(data.success).toBe(true);
    expect(drinkNames(data)).toEqual(["ipa", "lager"].sort());
  });
});

/* -------- SEARCH -------- */

describe("Search endpoints", () => {
  test("GET /foods?search=pizza returns pizza", async () => {
    const data = await getFoods("?search=pizza");
    expect(data.success).toBe(true);
    expect(data.data.items[0].id).toBe("pizza");
  });

  test("GET /foods?search=xyz returns empty", async () => {
    const data = await getFoods("?search=xyz");
    expect(data.success).toBe(true);
    expect(data.data.items.length).toBe(0);
  });

  test("GET /drinks?category=beer returns 4 drinks", async () => {
    const data = await getDrinks("?category=beer");
    expect(data.success).toBe(true);
    expect(data.data.items.length).toBe(4);
  });
});

/* -------- CONTACT -------- */

describe("Contact form", () => {
  test("valid contact message returns success", async () => {
    const data = await contact({ name: "Test", email: "test@test.com", message: "Hello" });
    expect(data.success).toBe(true);
  });

  test("missing name returns 422", async () => {
    const data = await contact({ email: "test@test.com", message: "Hello" });
    expect(data.success).toBe(false);
    expect(data.error.code).toBe("VALIDATION_ERROR");
  });

  test("missing email returns 422", async () => {
    const data = await contact({ name: "Test", message: "Hello" });
    expect(data.success).toBe(false);
    expect(data.error.code).toBe("VALIDATION_ERROR");
  });

  test("missing message returns 422", async () => {
    const data = await contact({ name: "Test", email: "test@test.com" });
    expect(data.success).toBe(false);
    expect(data.error.code).toBe("VALIDATION_ERROR");
  });
});