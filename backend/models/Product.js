const mongoose = require('mongoose');

const variantOptionSchema = new mongoose.Schema(
  {
    value: { type: String, required: true, trim: true }, // e.g. "Small", "Red"
    stock: { type: Number, default: 0, min: 0 },
  },
  { _id: false }
);

const variantGroupSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true }, // e.g. "Size", "Color"
    options: {
      type: [variantOptionSchema],
      validate: [(opts) => opts.length > 0, 'A variant must have at least one option'],
    },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [120, 'Product name cannot exceed 120 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    brand: {
      type: String,
      trim: true,
      default: '',
      maxlength: [60, 'Brand name cannot exceed 60 characters'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    originalPrice: {
      type: Number,
      default: null,
      min: [0, 'Original price cannot be negative'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    imageUrl: {
      type: String,
      required: [true, 'Image URL is required'],
      trim: true,
    },
    images: {
      type: [String],
      default: [],
    },
    variants: {
      type: [variantGroupSchema],
      default: [],
    },
    stock: {
      type: Number,
      required: [true, 'Stock quantity is required'],
      min: [0, 'Stock cannot be negative'],
      default: 0,
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    numReviews: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

productSchema.index({ name: 'text' });

module.exports = mongoose.model('Product', productSchema);
