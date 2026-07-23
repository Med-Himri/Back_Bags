const express = require("express");

const { verifyToken } = require("../middlewares/authMiddleware");

const router = express.Router();

const multer = require("multer");
const { getProductSitemapCtrl, getLastProductsCtrl, getProductsCtrl, getAllProductsCtrl, getSingleProductCtrl, rejectProductCtrl, acceptProductCtrl, createProductCtrl, createAIProductCtrl } = require("../controllers/productController");
const upload = multer({ dest: "/tmp/images/" });

/* ================= PUBLIC ROUTES ================= */
router.get("/", getProductSitemapCtrl);
router.get("/getlastProducts", getLastProductsCtrl);
router.get("/getproducts", getProductsCtrl);
router.get("/getallproducts", getAllProductsCtrl);
router.get("/:slug", getSingleProductCtrl);

/* ================= PROTECTED ROUTES ================= */
router.use(verifyToken);
router.post(
  "/createaiproduct",
  upload.fields([
    { name: "mainImage", maxCount: 1 },
    { name: "gallery", maxCount: 10 },
  ]),
  createAIProductCtrl
);
router.post(
  "/addproduct",
  upload.fields([
    { name: "mainImage", maxCount: 1 },
    { name: "gallery", maxCount: 10 },
  ]),
  createProductCtrl
);

router.post("/delete", rejectProductCtrl);
router.post("/acceptproduct", acceptProductCtrl);

module.exports = router;
