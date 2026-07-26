const express = require("express");

const { verifyToken } = require("../middlewares/authMiddleware");

const router = express.Router();

const multer = require("multer");
const {
  getProductSitemapCtrl,
  getLastProductsCtrl,
  getProductsCtrl,
  getAllProductsCtrl,
  getSingleProductCtrl,
  getProductByIdCtrl,   // added
  rejectProductCtrl,
  acceptProductCtrl,
  createProductCtrl,
  updateProductCtrl,    // added
  createAIProductCtrl,
} = require("../controllers/productController");
const upload = multer({ dest: "/tmp/images/" });

/* ================= PUBLIC ROUTES ================= */
router.get("/", getProductSitemapCtrl);
router.get("/getlastProducts", getLastProductsCtrl);
router.get("/getproducts", getProductsCtrl);
router.get("/getallproducts", getAllProductsCtrl);
router.get("/:slug", getSingleProductCtrl);

/* ================= PROTECTED ROUTES ================= */
router.use(verifyToken);

// Admin lookup by id — ignores accepted status, used by the edit screen.
// Safe to place here: "/admin/:id" is two path segments, so it never
// collides with the single-segment "/:slug" route above.
router.get("/admin/:id", getProductByIdCtrl);

router.post(
  "/createaiproduct",
  upload.fields([
    { name: "mainImage", maxCount: 1 },
    { name: "galleryImages", maxCount: 10 }, // was "gallery" — didn't match createAIProductAPI or createAIProductCtrl, which both use galleryImages
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

// Update — same id-in-body pattern as /delete and /acceptproduct below
router.post(
  "/updateproduct",
  upload.fields([
    { name: "mainImage", maxCount: 1 },
    { name: "gallery", maxCount: 10 },
  ]),
  updateProductCtrl
);

router.post("/delete", rejectProductCtrl);
router.post("/acceptproduct", acceptProductCtrl);

module.exports = router;