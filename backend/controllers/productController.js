const Product = require('../models/Product');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

// @desc    Get all products (supports search, category/brand/rating filter, sorting, pagination)
// @route   GET /api/products?search=&category=&brand=&minRating=&sort=&page=&limit=
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
  const { search, category, brand, minRating, sort, page = 1, limit = 12 } = req.query;

  const query = {};

  if (search) {
    query.name = { $regex: search, $options: 'i' };
  }

  if (category && category !== 'All') {
    query.category = category;
  }

  if (brand && brand !== 'All') {
    query.brand = brand;
  }

  if (minRating) {
    query.averageRating = { $gte: Number(minRating) };
  }

  const sortOptions = {
    newest: { createdAt: -1 },
    oldest: { createdAt: 1 },
    price_asc: { price: 1 },
    price_desc: { price: -1 },
    name_asc: { name: 1 },
    name_desc: { name: -1 },
    rating_desc: { averageRating: -1 },
  };
  const sortBy = sortOptions[sort] || sortOptions.newest;

  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.max(parseInt(limit, 10) || 12, 1);
  const skip = (pageNum - 1) * limitNum;

  const [products, total] = await Promise.all([
    Product.find(query).sort(sortBy).skip(skip).limit(limitNum),
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
  const { name, category, brand, price, description, imageUrl, stock } = req.body;

  const product = await Product.create({ name, category, brand, price, description, imageUrl, stock });

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

// @desc    Delete multiple products at once
// @route   DELETE /api/products/bulk
// @access  Admin
const bulkDeleteProducts = asyncHandler(async (req, res) => {
  const { ids } = req.body;

  if (!Array.isArray(ids) || ids.length === 0) {
    throw new ApiError(400, 'Please provide an array of product ids to delete');
  }

  const result = await Product.deleteMany({ _id: { $in: ids } });

  res.status(200).json({ success: true, data: { deletedCount: result.deletedCount } });
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

// @desc    Get distinct brands (for filter dropdown)
// @route   GET /api/products/brands/list
// @access  Public
const getBrands = asyncHandler(async (req, res) => {
  const brands = await Product.distinct('brand');
  res.status(200).json({ success: true, data: brands.filter(Boolean) });
});

module.exports = {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  bulkDeleteProducts,
  getStats,
  getCategories,
  getBrands,
};
