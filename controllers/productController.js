const { Product } = require("../models/Product");
const User = require("../models/User");
const Staff = require("../models/Staff");
const ProductService = require("../services/product.service");
const { cloudinaryUploadImage } = require("../utils/cloudinary");

/** --------------------------------------------------
 * @desc    Create new product
 * @route   /api/product/addproduct
 * @method  POST
 * @access  Private (staff / admin)
 -------------------------------------------------- **/
exports.createProductCtrl = async (req, res) => {
  const {
    title,
    slug,
    price,
    discountPrice,
    sku,
    stock,
    variants, // optional: [{ color, size, sku, stock }] — omit for single-variant products
    category,
    tags,
    brand,
    shortDescription,
    metaTitle,
    metaDescription,
    description,
  } = req.body;
  console.log(req.body);

  const user = req.id;
  const files = req.files;

  try {
    let staff = await User.findById(user);
    if (!staff) {
      return res
        .status(403)
        .json({ message: "Access denied. Staff or admin only." });
    }

    if (!title || !price || !description || !files?.mainImage) {
      return res.status(400).json({
        message: "title, price, description and main image are required",
      });
    }

    // Upload main image
    const mainImageUpload = await cloudinaryUploadImage(
      files.mainImage[0].path
    );

    // Upload gallery images
    let galleryImages = [];
    if (files.gallery && files.gallery.length > 0) {
      for (const img of files.gallery) {
        const uploaded = await cloudinaryUploadImage(img.path);
        galleryImages.push({
          url: uploaded.secure_url,
          publicId: uploaded.public_id,
        });
      }
    }

    // Parse variants if sent as a JSON string (common with multipart/form-data)
    let parsedVariants = [];
    if (variants) {
      try {
        parsedVariants =
          typeof variants === "string" ? JSON.parse(variants) : variants;
      } catch (err) {
        console.error("Error parsing variants:", err);
      }
    }

    const newProduct = await ProductService.createProduct({
      title,
      slug,
      price,
      discountPrice,
      sku,
      stock,
      variants: parsedVariants, // e.g. [{ color: "Black", size: "M", sku: "ZK-001-BLK-M", stock: 12 }]
      category,
      tags,
      brand,
      shortDescription,
      metaTitle,
      metaDescription,
      description,
      user,
      mainImage: {
        url: mainImageUpload.secure_url,
        publicId: mainImageUpload.public_id,
      },
      gallery: galleryImages,
    });

    res.status(201).json({ product: newProduct });
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ message: "Error creating product", error });
  }
};

/* ================= GET ALL ACCEPTED PRODUCTS ================= */
exports.getAllProductsCtrl = async (req, res) => {
  try {
    const products = await Product.find({ accepted: true })
      .sort({ createdAt: -1 })
      .lean();

    if (!products.length) {
      return res.status(404).json({ message: "No products found" });
    }

    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Error fetching products", error });
  }
};

/* ================= GET SINGLE PRODUCT ================= */
exports.getSingleProductCtrl = async (req, res) => {
  try {
    const { slug } = req.params;

    if (!slug) {
      return res.status(400).json({ message: "Product slug is required" });
    }

    const product = await Product.findOne({ slug, accepted: true });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ message: "Internal Server Error", error });
  }
};

/* ================= GET PRODUCTS (ADMIN LIST) ================= */
exports.getProductsCtrl = async (req, res) => {
  try {
    const products = await Product.find()
      .select("title mainImage accepted")
      .lean();

    if (!products.length) {
      return res.status(404).json({ message: "No products found" });
    }

    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ================= SITEMAP ================= */
exports.getProductSitemapCtrl = async (req, res) => {
  try {
    // Only approved (accepted) products should be indexable
    const products = await Product.find({ accepted: true })
      .select("slug updatedAt")
      .lean();

    if (!products.length) {
      return res.status(404).json({ message: "No products found" });
    }

    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ================= LAST PRODUCTS ================= */
exports.getLastProductsCtrl = async (req, res) => {
  try {
    const products = await Product.find({ accepted: true })
      .select("title mainImage shortDescription price")
      .sort({ _id: -1 })
      .limit(3)
      .lean();

    if (!products.length) {
      return res.status(404).json({ message: "No products found" });
    }

    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching last products:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

/* ================= REJECT PRODUCT ================= */
exports.rejectProductCtrl = async (req, res) => {
  try {
    const { id } = req.body;

    const deletedProduct = await Product.findOneAndDelete({ _id: id });

    if (!deletedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({
      message: "Product deleted successfully",
      deletedProduct,
    });
  } catch (error) {
    res.status(500).json({ message: "Error deleting product", error });
  }
};

/* ================= ACCEPT PRODUCT ================= */
exports.acceptProductCtrl = async (req, res) => {
  try {
    const { id } = req.body;

    const updatedProduct = await Product.findOneAndUpdate(
      { _id: id },
      { accepted: true },
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({
      message: "Product accepted successfully",
      updatedProduct,
    });
  } catch (error) {
    res.status(500).json({ message: "Error accepting product", error });
  }
};

/* ================= GET PRODUCT BY ID (ADMIN — no accepted filter) ================= */
// @route GET /api/product/admin/:id
// Used by the edit-product CMS screen, which needs to load a product
// regardless of its approval status.
exports.getProductByIdCtrl = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json(product);
  } catch (error) {
    console.error("Error fetching product by id:", error);
    res.status(500).json({ message: "Internal Server Error", error });
  }
};

/* ================= UPDATE PRODUCT (ADMIN / STAFF) ================= */
// @route POST /api/product/updateproduct
// Follows the same id-in-body pattern as acceptProductCtrl/rejectProductCtrl,
// rather than a RESTful PATCH /:id — kept consistent with the rest of this API.
exports.updateProductCtrl = async (req, res) => {
  const {
    id,
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
  } = req.body;

  const user = req.id;
  const files = req.files;

  try {
    const staff = await User.findById(user);
    if (!staff) {
      return res
        .status(403)
        .json({ message: "Access denied. Staff or admin only." });
    }

    if (!id) {
      return res.status(400).json({ message: "Product id is required" });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Replace the main image only if a new one was uploaded
    if (files?.mainImage) {
      const uploaded = await cloudinaryUploadImage(files.mainImage[0].path);
      product.mainImage = { url: uploaded.secure_url, publicId: uploaded.public_id };
    }

    // Append any newly uploaded gallery images (existing ones stay untouched)
    if (files?.gallery && files.gallery.length > 0) {
      for (const img of files.gallery) {
        const uploaded = await cloudinaryUploadImage(img.path);
        product.gallery.push({ url: uploaded.secure_url, publicId: uploaded.public_id });
      }
    }

    // Parse variants if sent as a JSON string (same pattern as create)
    if (variants !== undefined) {
      try {
        product.variants =
          typeof variants === "string" ? JSON.parse(variants) : variants;
      } catch (err) {
        console.error("Error parsing variants:", err);
      }
    }

    // Only overwrite fields that were actually sent — lets the frontend
    // send a partial update without wiping other fields to blank
    if (title !== undefined) product.title = title;
    if (slug !== undefined) product.slug = slug;
    if (price !== undefined) product.price = price;
    if (discountPrice !== undefined) product.discountPrice = discountPrice;
    if (sku !== undefined) product.sku = sku;
    if (stock !== undefined) product.stock = stock;
    if (category !== undefined) product.category = category;
    if (tags !== undefined) {
      product.tags =
        typeof tags === "string"
          ? tags.split(",").map((t) => t.trim()).filter(Boolean)
          : tags;
    }
    if (brand !== undefined) product.brand = brand;
    if (shortDescription !== undefined) product.shortDescription = shortDescription;
    if (metaTitle !== undefined) product.metaTitle = metaTitle;
    if (metaDescription !== undefined) product.metaDescription = metaDescription;
    if (description !== undefined) product.description = description;

    await product.save();

    res.status(200).json({ message: "Product updated successfully", product });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ message: "Error updating product", error });
  }
};

exports.createAIProductCtrl = async (req, res) => {
  const { productName, price, discountPrice, galleryMeta } = req.body;
  const user = req.id; // or req.user._id depending on your auth middleware

  const mainImageFile =
    req.files && req.files["mainImage"] ? req.files["mainImage"][0] : null;

  const galleryImageFiles =
    req.files && req.files["galleryImages"] ? req.files["galleryImages"] : [];

  try {
    if (!productName || !price || !mainImageFile) {
      return res.status(400).json({
        error: "Product name, price, and main image are required!",
      });
    }

    // Upload the main image FIRST — we need its hosted URL to send to the
    // vision model. Previously the AI call happened before this upload,
    // which only "worked" because the model never actually looked at the
    // image at all (it was text-only).
    const uploadedMainImage = await cloudinaryUploadImage(mainImageFile.path);

    // Pull recent products for internal linking (SEO cross-sell)
    const recentProducts = await Product.find()
      .sort({ createdAt: -1 })
      .limit(5);
    const internalLinks = recentProducts.map((prod) => {
      return `https://www.zackluxury.com/product/${prod.slug}`;
    });

    const linksPrompt =
      internalLinks.length > 0
        ? `\n- INTERNAL LINKS: You MUST naturally integrate 1 or 2 of the following links into the product description text to cross-sell other items:\n  ${internalLinks.join(
            "\n  "
          )}`
        : "";

    const systemPrompt = `
    You are an expert eCommerce copywriter and SEO specialist for "Zack Luxury", a premium B2C boutique selling women's fashion products — including handbags, shoes, wallets, and accessories.
    You will be shown a product photo. Base your category, tags, and description on what the image ACTUALLY shows — do not assume or default to any single category.

    CATEGORY & VISUAL ANALYSIS REQUIREMENTS:
    - Look at the image carefully before deciding on a category. Common categories: Handbags, Totes, Clutches, Wallets, Heels, Flats, Sandals, Boots, Sneakers, Jewelry, Scarves, Sunglasses, Belts.
    - If the image shows a SINGLE product type, return that one category (e.g., "Heels").
    - If the image shows a genuine MIX of two product types in the same shot (e.g., a bag styled next to shoes), return both separated by " & " (e.g., "Handbags & Heels") — only do this when the image truly contains multiple distinct product types, not just one product with multiple parts (a shoe with a heel is still just "Heels", not two categories).
    - Never default to "Handbags" out of habit — pick whatever the photo actually shows.
    - Tags should reflect what's visually true: material/finish visible in the photo (e.g., "patent leather", "suede"), color, style (e.g., "pointed-toe", "block-heel", "top-handle"), and use case.

    CONTENT & SEO REQUIREMENTS:
    - Slug Quality: Mentally correct any spelling or grammatical errors in the provided product name before basing the slug on it — the slug should read clean and professional even if the input name has typos.
    - Focus Keyword Integration: You MUST naturally weave a relevant phrase describing the ACTUAL product category (e.g., "premium women's handbag" for a bag, "elegant women's heels" for shoes, "statement accessory" for jewelry) into the description — match the phrase to what the product genuinely is, along with LSI keywords related to the specific product (e.g., leather goods, everyday carry, evening bag for a bag; comfort fit, pointed-toe, block heel for shoes).
    - Tone & Audience: Write specifically for the retail consumer (fashion-conscious women, gift shoppers). STRICTLY AVOID B2B terminology like "wholesale", "bulk", "export", or "commercial accounts".
    - Accuracy: Do NOT claim the product is handmade, artisanal, or one-of-a-kind unless that is explicitly true for this item — describe materials and craftsmanship in general, honest terms instead.
    - HTML Description: Write a rich, persuasive, and detailed product description in valid HTML.
      * Start with a captivating introductory paragraph (using <p>) that helps the customer visualize wearing or using the piece.
      * Use <h2> for main sections (e.g., "Why You'll Love It", "Styling Tips", "Materials & Care"). DO NOT use <h1> tags.
      * Use an elegant <ul>/<li> list for "Key Features" or "Product Specifications".
      * Use a <table> for "Dimensions & Care Instructions" (e.g., Material, Dimensions, Closure Type, Care).
      * Use <strong> to highlight important benefits and features.
    - Short Description: Write a catchy 1-2 sentence summary (plain text, no HTML) that will appear right under the product price. This must drive immediate "add-to-cart" clicks.
    - Brand Voice: Emphasize Zack Luxury's focus on timeless style, quality materials, and considered design — confident and modern, not overstated.
    ${linksPrompt}

    You MUST return ONLY a valid JSON object. Ensure all HTML inside the "description" value is properly string-escaped (e.g., escape double quotes inside HTML tags like <table class=\\"details\\">) to prevent JSON parsing errors. Use the following strict structure:
    {
      "slug": "url-friendly-slug-for-the-title",
      "description": "The full HTML formatted product description here",
      "shortDescription": "Catchy 1-2 sentence short description (max 150 chars)",
      "metaTitle": "SEO optimized meta title (max 60 chars)",
      "metaDescription": "SEO optimized meta description (max 160 chars)",
      "category": "The single most accurate category based on what the IMAGE actually shows (see category rules above)",
      "tags": ["tag1", "tag2", "tag3", "tag4"]
    }
  `;

    const apiKey = process.env.GROQ_API_KEY;
    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          // llama-3.3-70b-versatile was deprecated by Groq on June 17, 2026,
          // and it was text-only anyway. qwen/qwen3.6-27b is Groq's current
          // vision-capable model — it can see the actual product photo.
          model: "qwen/qwen3.6-27b",
          // This model has a "thinking" mode that was interfering with JSON
          // mode (thinking content mixed into the output, breaking JSON.parse).
          // "none" skips the reasoning step entirely — appropriate here since
          // this is straightforward classification/copywriting, not math or
          // complex multi-step logic. reasoning_format: "hidden" is a backup
          // that strips any reasoning text even if some gets generated.
          reasoning_effort: "none",
          reasoning_format: "hidden",
          messages: [
            { role: "system", content: systemPrompt },
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: `The product name provided by the user is: "${productName}". Look at the attached photo and base the category, tags, and description on what it actually shows.`,
                },
                {
                  type: "image_url",
                  image_url: { url: uploadedMainImage.secure_url },
                },
              ],
            },
          ],
          response_format: { type: "json_object" },
          temperature: 0.7,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Groq API Error:", data);
      return res.status(response.status).json({
        message: "Error from Groq API",
        error: data.error?.message || "Unknown error",
      });
    }

    const responseText = data.choices[0].message.content;

    // Defensive parsing: qwen3.6-27b has a "thinking" mode and can sometimes
    // wrap the JSON with reasoning text (e.g. <think>...</think>) even in
    // JSON mode. Extract just the {...} block before parsing.
    let aiData;
    try {
      aiData = JSON.parse(responseText);
    } catch (parseErr) {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error("Could not extract JSON from AI response:", responseText);
        return res.status(500).json({
          message: "AI response was not valid JSON",
          error: parseErr.message,
        });
      }
      aiData = JSON.parse(jsonMatch[0]);
    }

    // Parsing Gallery Meta
    let parsedGalleryMeta = [];
    if (galleryMeta) {
      try {
        parsedGalleryMeta = JSON.parse(galleryMeta);
      } catch (err) {
        console.error("Error parsing galleryMeta:", err);
      }
    }

    // Upload Gallery Images to Cloudinary
    let uploadedGallery = [];
    if (galleryImageFiles.length > 0) {
      const uploadPromises = galleryImageFiles.map((file) =>
        cloudinaryUploadImage(file.path)
      );
      const results = await Promise.all(uploadPromises);

      uploadedGallery = results.map((result, i) => ({
        url: result.secure_url,
        publicId: result.public_id,
        alt: parsedGalleryMeta[i]?.alt || productName,
      }));
    }

    // Create the Product in MongoDB
    const newProduct = await Product.create({
      title: productName, // title is written by you, not AI-generated
      slug: aiData.slug,
      description: aiData.description,
      shortDescription: aiData.shortDescription,
      price: Number(price),
      discountPrice: discountPrice ? Number(discountPrice) : undefined,
      category: aiData.category,
      tags: aiData.tags,
      metaTitle: aiData.metaTitle,
      metaDescription: aiData.metaDescription,
      user: user,
      mainImage: {
        url: uploadedMainImage.secure_url,
        publicId: uploadedMainImage.public_id,
      },
      gallery: uploadedGallery,
      accepted: false, // requires admin approval before going live
    });

    res.status(201).json({
      message: "AI Product generated and saved successfully for Zack Luxury",
      product: newProduct,
    });
  } catch (error) {
    console.error("Error creating AI product:", error);
    res.status(500).json({
      message: "Error creating AI product",
      error: error.message || error,
    });
  }
};