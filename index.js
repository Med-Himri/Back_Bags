// Load env vars FIRST, before anything that might read process.env at import time
// (e.g. your ./config/config.js probably reads MONGODB_URI when required)
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/config");

const app = express();

const allowedOrigins = [
  "http://localhost:3000",
  "https://front-bags.vercel.app",   // <-- removed trailing slash, this was the bug
  "https://www.zackluxury.com",
  "https://zackluxury.com",
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"], // added PATCH (your orders/products routes use it), trimmed the stray whitespace on OPTIONS
  allowedHeaders: ["Content-Type", "Authorization"],
};

// A single cors(corsOptions) call handles preflight (OPTIONS) AND actual
// requests consistently. The separate app.options('*', cors()) with no
// options was applying a different, wide-open CORS policy just for
// preflight — redundant now, and safer to remove so there's only one
// source of truth for what's allowed.
app.use(cors(corsOptions));

const PORT = process.env.PORT || 5000; // let the platform (Vercel) assign its own port in production

connectDB();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const userRoutes = require("./routes/user.routes");
const productsRouter = require("./routes/product.routes");

app.use("/api/user", userRoutes);
app.use("/api/product", productsRouter);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Required for Vercel's serverless Node runtime to actually use this Express
// app to handle requests — without this export, app.listen() alone may not
// be enough depending on your vercel.json / build setup.
module.exports = app;