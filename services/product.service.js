const { Product } = require("../models/Product");

const createProduct = async ({
  title,
  slug,
  price,
  discountPrice,
  sku,
  stock,
  variants, // [{ color, size, sku, stock }] — leave empty/omit for simple products
  category,
  tags,
  brand,
  shortDescription,
  metaTitle,
  metaDescription,
  description,
  mainImage,
  gallery,
  user,
}) => {
  const product = await Product.create({
    title,
    slug,
    price,
    discountPrice,
    sku,
    stock,
    variants,
    category,
    tags,
    brand,
    shortDescription,
    metaTitle,
    metaDescription,
    description,
    mainImage,
    gallery,
    user,
  });

  return product;
};

module.exports = {
  createProduct,
};