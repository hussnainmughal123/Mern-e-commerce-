const Product = require('../models/Product');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

// @desc    Get all products (supports search, category filter, pagination)
// @route   GET /api/products?search=&category=&page=&limit=
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
  const { search, category, page = 1, limit = 100 } = req.query;

  const query = {};

  if (search) {
    query.name = { $regex: search, $options: 'i' };
  }

  if (category && category !== 'All') {
    query.category = category;
  }

  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.max(parseInt(limit, 10) || 100, 1);
  const skip = (pageNum - 1) * limitNum;

  const [products, total] = await Promise.all([
    Product.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
    Product.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    count: products.length,
    total,
    page: pageNum,
    totalPages: Math.ceil(total / limitNum),
    data: products,
  });
});

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  res.status(200).json({ success: true, data: product });
});

// @desc    Create a product
// @route   POST /api/products
// @access  Admin
const createProduct = asyncHandler(async (req, res) => {
  const { name, category, price, description, imageUrl, stock } = req.body;

  const product = await Product.create({ name, category, price, description, imageUrl, stock });

  res.status(201).json({ success: true, data: product });
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Admin
const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  res.status(200).json({ success: true, data: product });
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Admin
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);

  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  res.status(200).json({ success: true, data: {} });
});

// @desc    Get dashboard stats (total products, total categories, out of stock)
// @route   GET /api/products/stats/summary
// @access  Admin
const getStats = asyncHandler(async (req, res) => {
  const totalProducts = await Product.countDocuments();
  const categories = await Product.distinct('category');
  const outOfStock = await Product.countDocuments({ stock: { $lte: 0 } });

  res.status(200).json({
    success: true,
    data: {
      totalProducts,
      totalCategories: categories.length,
      outOfStock,
    },
  });
});

// @desc    Get distinct categories (for filter dropdown)
// @route   GET /api/products/categories/list
// @access  Public
const getCategories = asyncHandler(async (req, res) => {
  const categories = await Product.distinct('category');
  res.status(200).json({ success: true, data: categories });
});

module.exports = {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getStats,
  getCategories,
};
