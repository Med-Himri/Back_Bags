const express = require("express");
const connectDB = require("./config/config");

const app = express();
const cors = require("cors");

const allowedOrigins = ["http://localhost:3000","https://zackluxury.vercel.app","https://www.zackluxury.com","https://zackluxury.com"];
//
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));

require("dotenv").config();
const PORT = 5000;

connectDB();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const userRoutes = require("./routes/user.routes");
const productsRouter = require("./routes/product.routes");

app.use("/api/user", userRoutes);
app.use("/api/product", productsRouter);
app.listen(PORT || process.env.PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
