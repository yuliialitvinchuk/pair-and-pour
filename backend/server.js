const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");
const rateLimit = require("express-rate-limit");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const { ipKeyGenerator } = rateLimit;

const app = express();
const PORT = Number(process.env.PORT) || 4000;

/* ---------------- CORS ---------------- */

app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS?.split(",").map((s) => s.trim()) || [
      "http://localhost:3000",
    ],
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

/* ---------------- FIREBASE ADMIN ---------------- */

if (!admin.apps.length) {
  if (
    !process.env.FIREBASE_PROJECT_ID ||
    !process.env.FIREBASE_CLIENT_EMAIL ||
    !process.env.FIREBASE_PRIVATE_KEY
  ) {
    throw new Error(
      "Missing Firebase env vars: FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY"
    );
  }

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    }),
  });
}

const db = admin.firestore();

/* ---------------- HELPERS ---------------- */

function sendError(res, status, code, message, details) {
  return res.status(status).json({
    success: false,
    error: {
      code,
      message,
      ...(details ? { details } : {}),
    },
  });
}

function parsePositiveInt(value, fallback) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : fallback;
}

// Strips accents so "rose" matches "Rosé Wine"
function normalize(str) {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

/* ---------------- AUTH ---------------- */

async function requireAuth(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return sendError(res, 401, "MISSING_TOKEN", "Bearer token required.");
  }

  try {
    const token = header.split(" ")[1];
    req.user = await admin.auth().verifyIdToken(token);
    return next();
  } catch (e) {
    const code =
      e.code === "auth/id-token-expired" ? "TOKEN_EXPIRED" : "INVALID_TOKEN";

    return sendError(res, 401, code, "Authentication failed.");
  }
}

/* ---------------- RATE LIMITS ---------------- */

const foodsLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 60,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    return sendError(res, 429, "RATE_LIMITED", "Too many requests.");
  },
});

const drinksLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 60,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    return sendError(res, 429, "RATE_LIMITED", "Too many requests.");
  },
});

const pairLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user?.uid || ipKeyGenerator(req),
  handler: (_req, res) => {
    return sendError(res, 429, "RATE_LIMITED", "Too many requests.");
  },
});

/* ---------------- ROUTES ---------------- */

app.get("/foods", requireAuth, foodsLimiter, async (req, res) => {
  try {
    const search = normalize(String(req.query.search || "").trim());
    const dietary = String(req.query.dietary || "").toLowerCase().trim();
    const limit = parsePositiveInt(req.query.limit, 20);
    const offset = parsePositiveInt(req.query.offset, 0);

    const snapshot = await db.collection("foods").get();

    let items = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    if (search) {
      items = items.filter((item) =>
        normalize(String(item.name || "")).startsWith(search)
      );
    }

    if (dietary) {
      items = items.filter((item) => {
        const values = Array.isArray(item.dietary) ? item.dietary : [];
        return values.map((v) => String(v).toLowerCase()).includes(dietary);
      });
    }

    const total = items.length;
    const paginated = items.slice(offset, offset + limit);

    return res.json({
      success: true,
      data: {
        items: paginated,
        total,
        limit,
        offset,
      },
    });
  } catch (error) {
    console.error("GET /foods failed:", error);
    return sendError(
      res,
      500,
      "INTERNAL_ERROR",
      "Failed to fetch foods.",
      error.message
    );
  }
});

app.get("/drinks", requireAuth, drinksLimiter, async (req, res) => {
  try {
    const search = normalize(String(req.query.search || "").trim());
    const category = String(req.query.category || "").toLowerCase().trim();
    const limit = parsePositiveInt(req.query.limit, 20);
    const offset = parsePositiveInt(req.query.offset, 0);

    const snapshot = await db.collection("alcohols").get();

    let items = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    if (search) {
      items = items.filter((item) =>
        normalize(String(item.name || "")).startsWith(search)
      );
    }

    if (category) {
      items = items.filter((item) => {
        const itemCategory = String(item.category || "").toLowerCase();
        const itemType = String(item.type || "").toLowerCase();
        return itemCategory === category || itemType === category;
      });
    }

    const total = items.length;
    const paginated = items.slice(offset, offset + limit);

    return res.json({
      success: true,
      data: {
        items: paginated,
        total,
        limit,
        offset,
      },
    });
  } catch (error) {
    console.error("GET /drinks failed:", error);
    return sendError(
      res,
      500,
      "INTERNAL_ERROR",
      "Failed to fetch drinks.",
      error.message
    );
  }
});

app.post("/pair", requireAuth, pairLimiter, async (req, res) => {
  try {
    const { foodId, drinkId, dietary, alcoholNotes, flavors } = req.body || {};

    const dietaryArray = Array.isArray(dietary)
      ? dietary.map((d) => String(d).toLowerCase().trim()).filter(Boolean)
      : [];

    const alcoholNotesArray = Array.isArray(alcoholNotes)
      ? alcoholNotes.map((d) => String(d).toLowerCase().trim()).filter(Boolean)
      : [];

    const ALCOHOL_NOTE_IDS = {
      "light & bubbling": ["champagne", "lager", "cider", "mimosa"],
      "fresh & zesty": ["white_wine", "rose_wine", "gin", "tequila", "vodka", "margarita", "martini", "mojito"],
      "rich & warming": ["red_wine", "whiskey", "rum", "old_fashioned"],
      "sweet & bold": ["sangria", "bloody_mary", "mimosa", "mojito"],
      "earthy & traditional": ["sake", "ipa", "stout", "negroni"],
    };

    const flavorsArray = Array.isArray(flavors)
      ? flavors.map((d) => String(d).toLowerCase().trim()).filter(Boolean)
      : [];

    if (!foodId && !drinkId) {
      return sendError(
        res,
        422,
        "VALIDATION_ERROR",
        "Provide foodId or drinkId."
      );
    }

    if (foodId && drinkId) {
      return sendError(
        res,
        422,
        "VALIDATION_ERROR",
        "Provide either foodId or drinkId, not both."
      );
    }

    if (foodId) {
      const foodDoc = await db.collection("foods").doc(String(foodId)).get();

      if (!foodDoc.exists) {
        return sendError(
          res,
          404,
          "NOT_FOUND",
          `Food '${foodId}' does not exist.`
        );
      }

      const pairingsSnap = await db
        .collection("pairings")
        .where("foodId", "==", String(foodId))
        .get();

      let pairings = await Promise.all(
        pairingsSnap.docs.map(async (doc) => {
          const pairing = doc.data();
          const alcoholId = pairing.alcoholId;

          if (!alcoholId) return null;

          const alcoholDoc = await db.collection("alcohols").doc(alcoholId).get();

          if (!alcoholDoc.exists) return null;

          return {
            drink: {
              id: alcoholDoc.id,
              ...alcoholDoc.data(),
            },
            score: pairing.score ?? null,
            reason: pairing.reason ?? null,
          };
        })
      );

      pairings = pairings.filter(Boolean);

      if (dietaryArray.length > 0) {
        pairings = pairings.filter((item) => {
          const drinkDietary = Array.isArray(item.drink?.dietary)
            ? item.drink.dietary.map((v) => String(v).toLowerCase().trim())
            : [];
          return dietaryArray.every((d) => drinkDietary.includes(d));
        });
      }

      if (alcoholNotesArray.length > 0) {
        const allowedIds = new Set(
          alcoholNotesArray.flatMap((note) => ALCOHOL_NOTE_IDS[note] ?? [])
        );
        pairings = pairings.filter((item) => allowedIds.has(item.drink?.id));
      }

      if (flavorsArray.length > 0) {
        pairings = pairings.filter((item) => {
          const drinkFlavors = Array.isArray(item.drink?.flavors)
            ? item.drink.flavors.map((v) => String(v).toLowerCase().trim())
            : [];
          return flavorsArray.some((f) => drinkFlavors.includes(f));
        });
      }

      return res.json({
        success: true,
        data: { pairings },
      });
    }

    if (drinkId) {
      const drinkDoc = await db.collection("alcohols").doc(String(drinkId)).get();

      if (!drinkDoc.exists) {
        return sendError(
          res,
          404,
          "NOT_FOUND",
          `Drink '${drinkId}' does not exist.`
        );
      }

      const pairingsSnap = await db
        .collection("pairings")
        .where("alcoholId", "==", String(drinkId))
        .get();

      let pairings = await Promise.all(
        pairingsSnap.docs.map(async (doc) => {
          const pairing = doc.data();
          const pairedFoodId = pairing.foodId;

          if (!pairedFoodId) return null;

          const foodDoc = await db.collection("foods").doc(pairedFoodId).get();

          if (!foodDoc.exists) return null;

          return {
            food: {
              id: foodDoc.id,
              ...foodDoc.data(),
            },
            score: pairing.score ?? null,
            reason: pairing.reason ?? null,
          };
        })
      );

      pairings = pairings.filter(Boolean);

      if (dietaryArray.length > 0) {
        pairings = pairings.filter((item) => {
          const foodDietary = Array.isArray(item.food?.dietary)
            ? item.food.dietary.map((v) => String(v).toLowerCase().trim())
            : [];
          return dietaryArray.every((d) => foodDietary.includes(d));
        });
      }

      if (flavorsArray.length > 0) {
        pairings = pairings.filter((item) => {
          const foodFlavors = Array.isArray(item.food?.flavors)
            ? item.food.flavors.map((v) => String(v).toLowerCase().trim())
            : [];
          return flavorsArray.some((f) => foodFlavors.includes(f));
        });
      }

      return res.json({
        success: true,
        data: { pairings },
      });
    }

    return sendError(res, 422, "VALIDATION_ERROR", "Invalid request.");
  } catch (error) {
    console.error("POST /pair failed:", error);
    return sendError(
      res,
      500,
      "INTERNAL_ERROR",
      "Failed to fetch pairings.",
      error.message
    );
  }
});

console.log("Debug route registered: /debug/seed-check");

app.get("/debug/seed-check", async (_req, res) => {
  try {
    const [foodsSnap, alcoholsSnap, pairingsSnap] = await Promise.all([
      db.collection("foods").get(),
      db.collection("alcohols").get(),
      db.collection("pairings").get(),
    ]);

    return res.json({
      success: true,
      data: {
        foodsCount: foodsSnap.size,
        alcoholsCount: alcoholsSnap.size,
        pairingsCount: pairingsSnap.size,
      },
    });
  } catch (error) {
    console.error("GET /debug/seed-check failed:", error);
    return sendError(
      res,
      500,
      "INTERNAL_ERROR",
      "Failed to check seed data.",
      error.message
    );
  }
});

/* ---------------- CONTACT (public) ---------------- */

app.post("/contact", async (req, res) => {
  try {
    const { name, email, message } = req.body || {};

    if (!name || !email || !message) {
      return sendError(res, 422, "VALIDATION_ERROR", "All fields are required");
    }

    await db.collection("contactMessages").add({
      name: String(name).trim(),
      email: String(email).trim(),
      message: String(message).trim(),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return res.json({
      success: true,
      data: { message: "Message sent successfully" },
    });
  } catch (error) {
    console.error("POST /contact failed:", error);
    return sendError(res, 500, "INTERNAL_ERROR", "Failed to send message", error.message);
  }
});

/* ---------------- 404 ---------------- */

app.use((req, res) => {
  return sendError(res, 404, "NOT_FOUND", `Route '${req.path}' does not exist.`);
});

/* ---------------- SERVER ---------------- */

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});