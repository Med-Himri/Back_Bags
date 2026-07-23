const mongoose = require("mongoose");

// Variant sub-schema — for products sold in multiple colors/sizes.
// Leave `variants` as an empty array for simple, single-version products.
const VariantSchema = new mongoose.Schema(
  {
    color: { type: String, trim: true, default: "" },
    size: { type: String, trim: true, default: "" },
    sku: { type: String, trim: true, default: "" },
    stock: { type: Number, default: 0, min: 0 },
  },
  { _id: true }
);

// Product schema
const ProductSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 200,
    },
    slug: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    shortDescription: {
      type: String,
      required: false,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
    },
    discountPrice: {
      type: Number,
      required: false,
    },
    sku: {
      type: String,
      required: false,
      trim: true,
    },
    // Simple flag — used for products with no variants (single version, no color/size options).
    // For variant products, availability is derived from the variants' stock counts instead.
    stock: {
      type: String,
      enum: ["in_stock", "out_of_stock"],
      default: "in_stock",
    },
    // Color/size options with their own stock counts. Leave empty for simple products.
    variants: {
      type: [VariantSchema],
      default: [],
    },
    category: {
      type: String,
      required: false,
      trim: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    brand: {
      type: String,
      required: false,
      trim: true,
    },
    metaTitle: {
      type: String,
      required: false,
      trim: true,
    },
    metaDescription: {
      type: String,
      required: false,
      trim: true,
    },
    user: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: "User",
    },
    mainImage: {
      type: Object,
      default: { url: "", publicId: null },
    },
    gallery: {
      type: [Object],
      default: [],
    },
    accepted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Total stock across all variants — 0 if this product has no variants defined.
ProductSchema.virtual("totalVariantStock").get(function () {
  return this.variants.reduce((sum, v) => sum + v.stock, 0);
});

// Single source of truth for "is this in stock right now" — checks variants
// if any exist, otherwise falls back to the simple in_stock/out_of_stock flag.
ProductSchema.virtual("isInStock").get(function () {
  if (this.variants && this.variants.length > 0) {
    return this.totalVariantStock > 0;
  }
  return this.stock === "in_stock";
});

// Product model
const Product = mongoose.model("Product", ProductSchema);

module.exports = {
  Product,
};