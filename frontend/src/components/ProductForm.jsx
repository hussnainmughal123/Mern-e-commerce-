import { useState, useEffect } from "react";

const EMPTY_FORM = {
  name: "",
  category: "",
  brand: "",
  price: "",
  originalPrice: "",
  description: "",
  imageUrl: "",
  images: [],
  variants: [],
  stock: "",
};

// Cloudinary unsigned upload config — see /mnt/skills or project notes for setup details
const CLOUDINARY_CLOUD_NAME = "esfameei";
const CLOUDINARY_UPLOAD_PRESET = "ml_default";

const uploadToCloudinary = async (file) => {
  const data = new FormData();
  data.append("file", file);
  data.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
    method: "POST",
    body: data,
  });

  const result = await res.json();
  if (!res.ok) {
    throw new Error(result?.error?.message || "Upload failed. Please try again.");
  }
  return result.secure_url;
};

const ProductForm = ({ initialData, onSubmit, onCancel, submitting }) => {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [galleryError, setGalleryError] = useState("");

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name || "",
        category: initialData.category || "",
        brand: initialData.brand || "",
        price: initialData.price ?? "",
        originalPrice: initialData.originalPrice ?? "",
        description: initialData.description || "",
        imageUrl: initialData.imageUrl || "",
        images: initialData.images || [],
        variants: initialData.variants || [],
        stock: initialData.stock ?? "",
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setErrors({});
    setUploadError("");
    setGalleryError("");
  }, [initialData]);

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Product name is required.";
    else if (form.name.trim().length > 120) newErrors.name = "Name must be under 120 characters.";

    if (!form.category.trim()) newErrors.category = "Category is required.";

    if (form.price === "" || isNaN(form.price)) newErrors.price = "Enter a valid price.";
    else if (Number(form.price) < 0) newErrors.price = "Price cannot be negative.";

    if (form.originalPrice !== "" && !isNaN(form.originalPrice)) {
      if (Number(form.originalPrice) <= Number(form.price)) {
        newErrors.originalPrice = "Original price must be higher than the current price.";
      }
    }

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
      const url = await uploadToCloudinary(file);
      handleChange("imageUrl", url);
    } catch (err) {
      setUploadError(err.message || "Upload failed. Please try again.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleGallerySelect = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (form.images.length + files.length > 6) {
      setGalleryError("You can add up to 6 additional photos.");
      e.target.value = "";
      return;
    }

    setGalleryError("");
    setUploadingGallery(true);

    try {
      const uploadedUrls = [];
      for (const file of files) {
        if (!file.type.startsWith("image/")) continue;
        if (file.size > 10 * 1024 * 1024) continue;
        const url = await uploadToCloudinary(file);
        uploadedUrls.push(url);
      }
      setForm((prev) => ({ ...prev, images: [...prev.images, ...uploadedUrls] }));
    } catch (err) {
      setGalleryError(err.message || "Upload failed. Please try again.");
    } finally {
      setUploadingGallery(false);
      e.target.value = "";
    }
  };

  const removeGalleryImage = (index) => {
    setForm((prev) => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
  };

  // ---------- Variant group + per-option stock management ----------
  const addVariantGroup = () => {
    setForm((prev) => ({ ...prev, variants: [...prev.variants, { name: "", options: [] }] }));
  };

  const removeVariantGroup = (groupIndex) => {
    setForm((prev) => ({ ...prev, variants: prev.variants.filter((_, i) => i !== groupIndex) }));
  };

  const updateVariantName = (groupIndex, name) => {
    setForm((prev) => ({
      ...prev,
      variants: prev.variants.map((v, i) => (i === groupIndex ? { ...v, name } : v)),
    }));
  };

  const addOption = (groupIndex) => {
    setForm((prev) => ({
      ...prev,
      variants: prev.variants.map((v, i) =>
        i === groupIndex ? { ...v, options: [...v.options, { value: "", stock: 0 }] } : v
      ),
    }));
  };

  const removeOption = (groupIndex, optionIndex) => {
    setForm((prev) => ({
      ...prev,
      variants: prev.variants.map((v, i) =>
        i === groupIndex ? { ...v, options: v.options.filter((_, oi) => oi !== optionIndex) } : v
      ),
    }));
  };

  const updateOptionValue = (groupIndex, optionIndex, value) => {
    setForm((prev) => ({
      ...prev,
      variants: prev.variants.map((v, i) =>
        i === groupIndex
          ? { ...v, options: v.options.map((o, oi) => (oi === optionIndex ? { ...o, value } : o)) }
          : v
      ),
    }));
  };

  const updateOptionStock = (groupIndex, optionIndex, stock) => {
    setForm((prev) => ({
      ...prev,
      variants: prev.variants.map((v, i) =>
        i === groupIndex
          ? {
              ...v,
              options: v.options.map((o, oi) =>
                oi === optionIndex ? { ...o, stock: stock === "" ? "" : Number(stock) } : o
              ),
            }
          : v
      ),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const cleanedVariants = form.variants
      .map((v) => ({
        name: v.name.trim(),
        options: v.options
          .filter((o) => o.value.trim())
          .map((o) => ({ value: o.value.trim(), stock: Number(o.stock) || 0 })),
      }))
      .filter((v) => v.name && v.options.length > 0);

    onSubmit({
      name: form.name.trim(),
      category: form.category.trim(),
      brand: form.brand.trim(),
      price: Number(form.price),
      originalPrice: form.originalPrice !== "" ? Number(form.originalPrice) : null,
      description: form.description.trim(),
      imageUrl: form.imageUrl.trim(),
      images: form.images,
      variants: cleanedVariants,
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
          <label htmlFor="originalPrice">Original Price ($, optional — for discount badge)</label>
          <input
            id="originalPrice"
            type="number"
            step="0.01"
            min="0"
            placeholder="e.g. 49.99"
            value={form.originalPrice}
            onChange={(e) => handleChange("originalPrice", e.target.value)}
            className={errors.originalPrice ? "input-error" : ""}
          />
          {errors.originalPrice && <span className="field-error">{errors.originalPrice}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="stock">Overall Stock Quantity *</label>
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
        <label htmlFor="photo">Main Product Photo *</label>

        {form.imageUrl && (
          <div style={{ marginBottom: 10 }}>
            <img
              src={form.imageUrl}
              alt="Product preview"
              style={{ width: 120, height: 120, objectFit: "cover", borderRadius: 8 }}
            />
          </div>
        )}

        <input id="photo" type="file" accept="image/*" onChange={handlePhotoSelect} disabled={uploading} />

        {uploading && <span className="field-error" style={{ color: "var(--color-text-muted)" }}>Uploading photo...</span>}
        {uploadError && <span className="field-error">{uploadError}</span>}
        {errors.imageUrl && <span className="field-error">{errors.imageUrl}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="gallery">Additional Photos (optional, up to 6)</label>

        {form.images.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
            {form.images.map((url, idx) => (
              <div key={url + idx} style={{ position: "relative" }}>
                <img
                  src={url}
                  alt={`Gallery ${idx + 1}`}
                  style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 8 }}
                />
                <button
                  type="button"
                  onClick={() => removeGalleryImage(idx)}
                  aria-label="Remove image"
                  style={{
                    position: "absolute",
                    top: -6,
                    right: -6,
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    border: "none",
                    background: "var(--color-danger)",
                    color: "#fff",
                    cursor: "pointer",
                    fontSize: 12,
                    lineHeight: 1,
                  }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        <input
          id="gallery"
          type="file"
          accept="image/*"
          multiple
          onChange={handleGallerySelect}
          disabled={uploadingGallery || form.images.length >= 6}
        />

        {uploadingGallery && (
          <span className="field-error" style={{ color: "var(--color-text-muted)" }}>
            Uploading photos...
          </span>
        )}
        {galleryError && <span className="field-error">{galleryError}</span>}
      </div>

      <div className="form-group">
        <label>Variants (optional — e.g. Size, Color — with stock per option)</label>
        {form.variants.map((variant, groupIndex) => (
          <div
            key={groupIndex}
            style={{
              border: "1px solid var(--color-border)",
              borderRadius: 10,
              padding: 12,
              marginBottom: 10,
            }}
          >
            <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
              <input
                type="text"
                placeholder="Variant name (e.g. Size)"
                value={variant.name}
                onChange={(e) => updateVariantName(groupIndex, e.target.value)}
                style={{ flex: 1 }}
              />
              <button
                type="button"
                className="btn btn-danger btn-small"
                onClick={() => removeVariantGroup(groupIndex)}
              >
                Remove Group
              </button>
            </div>

            {variant.options.map((option, optionIndex) => (
              <div key={optionIndex} style={{ display: "flex", gap: 8, marginBottom: 6, alignItems: "center" }}>
                <input
                  type="text"
                  placeholder="Option (e.g. Small)"
                  value={option.value}
                  onChange={(e) => updateOptionValue(groupIndex, optionIndex, e.target.value)}
                  style={{ flex: "2 1 140px" }}
                />
                <input
                  type="number"
                  min="0"
                  placeholder="Stock"
                  value={option.stock}
                  onChange={(e) => updateOptionStock(groupIndex, optionIndex, e.target.value)}
                  style={{ flex: "1 1 80px" }}
                />
                <button
                  type="button"
                  className="btn btn-secondary btn-small"
                  onClick={() => removeOption(groupIndex, optionIndex)}
                >
                  ✕
                </button>
              </div>
            ))}

            <button
              type="button"
              className="btn btn-secondary btn-small"
              onClick={() => addOption(groupIndex)}
              style={{ marginTop: 4 }}
            >
              + Add Option
            </button>
          </div>
        ))}
        <button type="button" className="btn btn-secondary btn-small" onClick={addVariantGroup}>
          + Add Variant Group
        </button>
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
        <button type="submit" className="btn btn-primary" disabled={submitting || uploading || uploadingGallery}>
          {submitting ? "Saving..." : initialData ? "Update Product" : "Add Product"}
        </button>
      </div>
    </form>
  );
};

export default ProductForm;
