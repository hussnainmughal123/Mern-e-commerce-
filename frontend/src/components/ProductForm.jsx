import { useState, useEffect } from "react";

const EMPTY_FORM = {
  name: "",
  category: "",
  brand: "",
  price: "",
  description: "",
  imageUrl: "",
  stock: "",
};

// Cloudinary unsigned upload config — see /mnt/skills or project notes for setup details
const CLOUDINARY_CLOUD_NAME = "esfameei";
const CLOUDINARY_UPLOAD_PRESET = "ml_default";

const ProductForm = ({ initialData, onSubmit, onCancel, submitting }) => {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name || "",
        category: initialData.category || "",
        brand: initialData.brand || "",
        price: initialData.price ?? "",
        description: initialData.description || "",
        imageUrl: initialData.imageUrl || "",
        stock: initialData.stock ?? "",
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setErrors({});
    setUploadError("");
  }, [initialData]);

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Product name is required.";
    else if (form.name.trim().length > 120) newErrors.name = "Name must be under 120 characters.";

    if (!form.category.trim()) newErrors.category = "Category is required.";

    if (form.price === "" || isNaN(form.price)) newErrors.price = "Enter a valid price.";
    else if (Number(form.price) < 0) newErrors.price = "Price cannot be negative.";

    if (!form.description.trim()) newErrors.description = "Description is required.";
    else if (form.description.trim().length > 500)
      newErrors.description = "Description must be under 500 characters.";

    if (!form.imageUrl.trim()) newErrors.imageUrl = "Please upload a product photo.";

    if (form.stock === "" || isNaN(form.stock)) newErrors.stock = "Enter a valid stock quantity.";
    else if (Number(form.stock) < 0) newErrors.stock = "Stock cannot be negative.";
    else if (!Number.isInteger(Number(form.stock))) newErrors.stock = "Stock must be a whole number.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handlePhotoSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setUploadError("Please choose an image file.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setUploadError("Image must be under 10MB.");
      return;
    }

    setUploadError("");
    setUploading(true);

    try {
      const data = new FormData();
      data.append("file", file);
      data.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: "POST", body: data }
      );

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result?.error?.message || "Upload failed. Please try again.");
      }

      handleChange("imageUrl", result.secure_url);
    } catch (err) {
      setUploadError(err.message || "Upload failed. Please try again.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      name: form.name.trim(),
      category: form.category.trim(),
      brand: form.brand.trim(),
      price: Number(form.price),
      description: form.description.trim(),
      imageUrl: form.imageUrl.trim(),
      stock: Number(form.stock),
    });
  };

  return (
    <form className="product-form" onSubmit={handleSubmit} noValidate>
      <div className="form-group">
        <label htmlFor="name">Product Name *</label>
        <input
          id="name"
          type="text"
          value={form.name}
          onChange={(e) => handleChange("name", e.target.value)}
          className={errors.name ? "input-error" : ""}
        />
        {errors.name && <span className="field-error">{errors.name}</span>}
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="category">Category *</label>
          <input
            id="category"
            type="text"
            placeholder="e.g. Electronics"
            value={form.category}
            onChange={(e) => handleChange("category", e.target.value)}
            className={errors.category ? "input-error" : ""}
          />
          {errors.category && <span className="field-error">{errors.category}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="brand">Brand</label>
          <input
            id="brand"
            type="text"
            placeholder="e.g. JBL"
            value={form.brand}
            onChange={(e) => handleChange("brand", e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="price">Price ($) *</label>
          <input
            id="price"
            type="number"
            step="0.01"
            min="0"
            value={form.price}
            onChange={(e) => handleChange("price", e.target.value)}
            className={errors.price ? "input-error" : ""}
          />
          {errors.price && <span className="field-error">{errors.price}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="stock">Stock Quantity *</label>
          <input
            id="stock"
            type="number"
            min="0"
            step="1"
            value={form.stock}
            onChange={(e) => handleChange("stock", e.target.value)}
            className={errors.stock ? "input-error" : ""}
          />
          {errors.stock && <span className="field-error">{errors.stock}</span>}
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="photo">Product Photo *</label>

        {form.imageUrl && (
          <div style={{ marginBottom: 10 }}>
            <img
              src={form.imageUrl}
              alt="Product preview"
              style={{ width: 120, height: 120, objectFit: "cover", borderRadius: 8 }}
            />
          </div>
        )}

        <input
          id="photo"
          type="file"
          accept="image/*"
          onChange={handlePhotoSelect}
          disabled={uploading}
        />

        {uploading && <span className="field-error" style={{ color: "var(--color-text-muted)" }}>Uploading photo...</span>}
        {uploadError && <span className="field-error">{uploadError}</span>}
        {errors.imageUrl && <span className="field-error">{errors.imageUrl}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="description">Short Description *</label>
        <textarea
          id="description"
          rows={3}
          maxLength={500}
          value={form.description}
          onChange={(e) => handleChange("description", e.target.value)}
          className={errors.description ? "input-error" : ""}
        />
        <span className="char-count">{form.description.length}/500</span>
        {errors.description && <span className="field-error">{errors.description}</span>}
      </div>

      <div className="form-actions">
        <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={submitting}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={submitting || uploading}>
          {submitting ? "Saving..." : initialData ? "Update Product" : "Add Product"}
        </button>
      </div>
    </form>
  );
};

export default ProductForm;
