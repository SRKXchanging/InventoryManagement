"use client";

import React, { useState, useEffect, useCallback, useTransition } from "react";
import {
  Package,
  PlusCircle,
  Search,
  Trash2,
  Edit3,
  AlertTriangle,
  CheckCircle2,
  X,
  Minus,
  Plus,
  RefreshCw,
  Boxes,
  Layers,
  AlertCircle,
} from "lucide-react";

interface Product {
  id: string;
  name: string;
  sku: string | null;
  quantity: number;
  createdAt: string;
  updatedAt: string;
}

export default function InventoryDashboard() {
  // Products state
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [, startTransition] = useTransition();

  // New product form state
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [quantity, setQuantity] = useState<number | string>(0);
  const [formErrors, setFormErrors] = useState<{
    name?: string;
    quantity?: string;
  }>({});
  const [submitting, setSubmitting] = useState(false);

  // Edit modal state
  const [editModalProduct, setEditModalProduct] = useState<Product | null>(null);
  const [editName, setEditName] = useState("");
  const [editSku, setEditSku] = useState("");
  const [editQuantity, setEditQuantity] = useState<number | string>(0);
  const [editErrors, setEditErrors] = useState<{
    name?: string;
    quantity?: string;
  }>({});
  const [updating, setUpdating] = useState(false);

  // Delete modal state
  const [deleteModalProduct, setDeleteModalProduct] = useState<Product | null>(
    null
  );
  const [deleting, setDeleting] = useState(false);

  // Toast notification state
  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const showToast = useCallback(
    (message: string, type: "success" | "error" = "success") => {
      setToast({ message, type });
      setTimeout(() => {
        setToast((current) => (current?.message === message ? null : current));
      }, 4000);
    },
    []
  );

  // Fetch products (supports search query)
  const fetchProducts = useCallback(
    async (query = "") => {
      try {
        setLoading(true);
        const url = query.trim()
          ? `/api/products/search?q=${encodeURIComponent(query.trim())}`
          : "/api/products";
        const res = await fetch(url);
        if (!res.ok) {
          throw new Error("Failed to load inventory data");
        }
        const data = await res.json();
        setProducts(data);
      } catch (err: unknown) {
        console.error("fetchProducts error:", err);
        showToast("Error loading products", "error");
      } finally {
        setLoading(false);
      }
    },
    [showToast]
  );

  // Initial load
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Handle Search input change with debouncing
  useEffect(() => {
    const handler = setTimeout(() => {
      startTransition(() => {
        fetchProducts(searchQuery);
      });
    }, 250);

    return () => clearTimeout(handler);
  }, [searchQuery, fetchProducts]);

  // Validate Add Product form
  const validateAddForm = () => {
    const errors: { name?: string; quantity?: string } = {};

    if (!name.trim()) {
      errors.name = "Product name cannot be empty";
    }

    if (quantity === "" || quantity === null || quantity === undefined) {
      errors.quantity = "Quantity must be an integer";
    } else {
      const parsed = Number(quantity);
      if (!Number.isInteger(parsed)) {
        errors.quantity = "Quantity must be a valid integer";
      } else if (parsed < 0) {
        errors.quantity = "Quantity cannot be negative";
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Add Product Submit
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateAddForm()) return;

    try {
      setSubmitting(true);
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          sku: sku.trim() || null,
          quantity: Number(quantity),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        showToast(data.error || "Failed to create product", "error");
        return;
      }

      showToast(`Added "${data.name}" to inventory!`);
      // Reset form
      setName("");
      setSku("");
      setQuantity(0);
      setFormErrors({});
      // Refresh list
      fetchProducts(searchQuery);
    } catch (err) {
      console.error("handleAddProduct error:", err);
      showToast("Network error creating product", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Quick Inline Quantity Increment / Decrement
  const handleQuickQuantityAdjust = async (
    product: Product,
    delta: number
  ) => {
    const newQty = product.quantity + delta;
    if (newQty < 0) return;

    // Optimistic update
    setProducts((prev) =>
      prev.map((p) => (p.id === product.id ? { ...p, quantity: newQty } : p))
    );

    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: newQty }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Update failed");
      }
    } catch (err) {
      console.error("handleQuickQuantityAdjust error:", err);
      showToast("Failed to update quantity", "error");
      // Rollback on error
      fetchProducts(searchQuery);
    }
  };

  // Open Edit Modal
  const openEditModal = (product: Product) => {
    setEditModalProduct(product);
    setEditName(product.name);
    setEditSku(product.sku || "");
    setEditQuantity(product.quantity);
    setEditErrors({});
  };

  // Close Edit Modal
  const closeEditModal = () => {
    setEditModalProduct(null);
    setEditErrors({});
  };

  // Validate Edit Form
  const validateEditForm = () => {
    const errors: { name?: string; quantity?: string } = {};

    if (!editName.trim()) {
      errors.name = "Product name cannot be empty";
    }

    if (
      editQuantity === "" ||
      editQuantity === null ||
      editQuantity === undefined
    ) {
      errors.quantity = "Quantity must be an integer";
    } else {
      const parsed = Number(editQuantity);
      if (!Number.isInteger(parsed)) {
        errors.quantity = "Quantity must be a valid integer";
      } else if (parsed < 0) {
        errors.quantity = "Quantity cannot be negative";
      }
    }

    setEditErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle Edit Submit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editModalProduct || !validateEditForm()) return;

    try {
      setUpdating(true);
      const res = await fetch(`/api/products/${editModalProduct.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName.trim(),
          sku: editSku.trim() || null,
          quantity: Number(editQuantity),
        }),
      });

      const updated = await res.json();

      if (!res.ok) {
        showToast(updated.error || "Failed to update product", "error");
        return;
      }

      showToast(`Updated "${updated.name}" successfully!`);
      closeEditModal();
      fetchProducts(searchQuery);
    } catch (err) {
      console.error("handleEditSubmit error:", err);
      showToast("Network error updating product", "error");
    } finally {
      setUpdating(false);
    }
  };

  // Open Delete Modal
  const openDeleteModal = (product: Product) => {
    setDeleteModalProduct(product);
  };

  // Confirm Delete
  const confirmDelete = async () => {
    if (!deleteModalProduct) return;

    try {
      setDeleting(true);
      const res = await fetch(`/api/products/${deleteModalProduct.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errorData = await res.json();
        showToast(errorData.error || "Failed to delete product", "error");
        return;
      }

      showToast(`Deleted "${deleteModalProduct.name}" from inventory.`);
      setDeleteModalProduct(null);
      fetchProducts(searchQuery);
    } catch (err) {
      console.error("confirmDelete error:", err);
      showToast("Network error deleting product", "error");
    } finally {
      setDeleting(false);
    }
  };

  // Metrics Calculations
  const totalProducts = products.length;
  const totalUnits = products.reduce((acc, curr) => acc + curr.quantity, 0);
  const lowStockCount = products.filter(
    (p) => p.quantity > 0 && p.quantity < 5
  ).length;
  const outOfStockCount = products.filter((p) => p.quantity === 0).length;

  return (
    <div className="container">
      {/* Header */}
      <header className="app-header">
        <div className="brand">
          <div className="brand-icon">
            <Package size={24} />
          </div>
          <div>
            <h1 className="brand-title">Inventory Tracker</h1>
            <p className="brand-subtitle">
              Real-time Stock Management with Local SQLite Persistence
            </p>
          </div>
        </div>

        <div className="status-badge" id="db-status-badge">
          <span className="pulse-dot" />
          <span>SQLite Database Connected</span>
        </div>
      </header>

      {/* Toast Alert */}
      {toast && (
        <div
          className={`toast-notice ${toast.type}`}
          role="alert"
          id="status-toast"
        >
          {toast.type === "success" ? (
            <CheckCircle2 size={18} />
          ) : (
            <AlertCircle size={18} />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Stats Ribbon */}
      <div className="stats-grid">
        <div className="stat-card" id="stat-total-products">
          <div className="stat-icon-wrapper stat-icon-indigo">
            <Boxes size={20} />
          </div>
          <div>
            <div className="stat-value">{totalProducts}</div>
            <div className="stat-label">Total Products</div>
          </div>
        </div>

        <div className="stat-card" id="stat-total-units">
          <div className="stat-icon-wrapper stat-icon-cyan">
            <Layers size={20} />
          </div>
          <div>
            <div className="stat-value">{totalUnits}</div>
            <div className="stat-label">Total Units in Stock</div>
          </div>
        </div>

        <div className="stat-card" id="stat-low-stock">
          <div className="stat-icon-wrapper stat-icon-amber">
            <AlertTriangle size={20} />
          </div>
          <div>
            <div className="stat-value">{lowStockCount}</div>
            <div className="stat-label">Low Stock (&lt; 5)</div>
          </div>
        </div>

        <div className="stat-card" id="stat-out-of-stock">
          <div className="stat-icon-wrapper stat-icon-rose">
            <AlertCircle size={20} />
          </div>
          <div>
            <div className="stat-value">{outOfStockCount}</div>
            <div className="stat-label">Out of Stock</div>
          </div>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="layout-grid">
        {/* Left Column: Add Product Form */}
        <section className="card" aria-labelledby="add-product-title">
          <div className="card-title-row">
            <PlusCircle className="card-title-icon" size={20} />
            <h2 id="add-product-title" className="card-title">
              Add New Product
            </h2>
          </div>

          <form onSubmit={handleAddProduct} noValidate id="add-product-form">
            {/* Product Name */}
            <div className="form-group">
              <label htmlFor="product-name" className="form-label">
                Product Name <span className="required-mark">*</span>
              </label>
              <input
                id="product-name"
                name="name"
                type="text"
                placeholder="e.g. Mechanical Keyboard"
                className={`input-field ${
                  formErrors.name ? "input-error" : ""
                }`}
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (formErrors.name) {
                    setFormErrors((prev) => ({ ...prev, name: undefined }));
                  }
                }}
              />
              {formErrors.name && (
                <div className="error-message" id="error-product-name">
                  <AlertCircle size={14} />
                  <span>{formErrors.name}</span>
                </div>
              )}
            </div>

            {/* SKU */}
            <div className="form-group">
              <label htmlFor="product-sku" className="form-label">
                SKU <span className="optional-mark">(optional)</span>
              </label>
              <input
                id="product-sku"
                name="sku"
                type="text"
                placeholder="e.g. KB-MECH-01"
                className="input-field"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
              />
              <div className="field-help">
                Unique identifier for stock tracking
              </div>
            </div>

            {/* Quantity */}
            <div className="form-group">
              <label htmlFor="product-quantity" className="form-label">
                Initial Quantity <span className="required-mark">*</span>
              </label>
              <div className="stepper-wrapper">
                <button
                  type="button"
                  className="stepper-btn"
                  id="btn-decrement-qty"
                  aria-label="Decrease quantity"
                  onClick={() => {
                    const current = Number(quantity) || 0;
                    if (current > 0) {
                      setQuantity(current - 1);
                      if (formErrors.quantity) {
                        setFormErrors((prev) => ({
                          ...prev,
                          quantity: undefined,
                        }));
                      }
                    }
                  }}
                >
                  <Minus size={16} />
                </button>
                <input
                  id="product-quantity"
                  name="quantity"
                  type="number"
                  min="0"
                  step="1"
                  className={`input-field stepper-input ${
                    formErrors.quantity ? "input-error" : ""
                  }`}
                  value={quantity}
                  onChange={(e) => {
                    setQuantity(e.target.value);
                    if (formErrors.quantity) {
                      setFormErrors((prev) => ({
                        ...prev,
                        quantity: undefined,
                      }));
                    }
                  }}
                />
                <button
                  type="button"
                  className="stepper-btn"
                  id="btn-increment-qty"
                  aria-label="Increase quantity"
                  onClick={() => {
                    const current = Number(quantity) || 0;
                    setQuantity(current + 1);
                    if (formErrors.quantity) {
                      setFormErrors((prev) => ({
                        ...prev,
                        quantity: undefined,
                      }));
                    }
                  }}
                >
                  <Plus size={16} />
                </button>
              </div>
              {formErrors.quantity && (
                <div className="error-message" id="error-product-quantity">
                  <AlertCircle size={14} />
                  <span>{formErrors.quantity}</span>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="btn btn-primary"
              id="btn-submit-add-product"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <span className="spinner" />
                  <span>Adding Product...</span>
                </>
              ) : (
                <>
                  <Plus size={18} />
                  <span>Add Product</span>
                </>
              )}
            </button>
          </form>
        </section>

        {/* Right Column: Inventory Table */}
        <section className="card" aria-labelledby="inventory-table-title">
          <div className="card-title-row">
            <Boxes className="card-title-icon" size={20} />
            <h2 id="inventory-table-title" className="card-title">
              Product Inventory
            </h2>
          </div>

          {/* Search Bar & Filter Summary */}
          <div className="search-controls">
            <div className="search-box">
              <Search className="search-icon" size={16} />
              <input
                id="search-input"
                type="text"
                className="search-input"
                placeholder="Search by product name or SKU..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  type="button"
                  className="search-clear-btn"
                  id="btn-clear-search"
                  aria-label="Clear search"
                  onClick={() => setSearchQuery("")}
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <div className="search-info">
              {loading ? (
                <span>Loading inventory...</span>
              ) : (
                <span>
                  Showing <strong>{products.length}</strong>{" "}
                  {products.length === 1 ? "product" : "products"}
                </span>
              )}
            </div>
          </div>

          {/* Table Container */}
          <div className="table-container">
            {loading && products.length === 0 ? (
              <div className="empty-state">
                <RefreshCw size={28} className="spinner" />
                <p style={{ marginTop: "1rem", color: "var(--text-secondary)" }}>
                  Fetching inventory from SQLite...
                </p>
              </div>
            ) : products.length === 0 ? (
              <div className="empty-state" id="inventory-empty-state">
                <div className="empty-icon-wrap">
                  <Package size={28} />
                </div>
                <div className="empty-title">
                  {searchQuery ? "No matching products found" : "No products yet"}
                </div>
                <p className="empty-desc">
                  {searchQuery
                    ? `No product matches "${searchQuery}". Try a different keyword or clear the search filter.`
                    : "Your inventory is currently empty. Use the form on the left to add your first product."}
                </p>
                {searchQuery && (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    id="btn-empty-clear-search"
                    onClick={() => setSearchQuery("")}
                  >
                    Clear Search Filter
                  </button>
                )}
              </div>
            ) : (
              <table className="inventory-table" id="inventory-products-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>SKU</th>
                    <th>Quantity</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => {
                    const isOutOfStock = product.quantity === 0;
                    const isLowStock =
                      product.quantity > 0 && product.quantity < 5;

                    return (
                      <tr key={product.id} id={`product-row-${product.id}`}>
                        {/* Name Column */}
                        <td>
                          <span className="product-name">{product.name}</span>
                        </td>

                        {/* SKU Column */}
                        <td>
                          {product.sku ? (
                            <span className="product-sku-tag">
                              {product.sku}
                            </span>
                          ) : (
                            <span className="product-sku-empty">—</span>
                          )}
                        </td>

                        {/* Quantity Column */}
                        <td>
                          <div className="qty-badge-group">
                            {/* Quick Stepper */}
                            <div className="quick-stepper">
                              <button
                                type="button"
                                className="stepper-mini-btn"
                                aria-label={`Decrease quantity of ${product.name}`}
                                disabled={product.quantity <= 0}
                                onClick={() =>
                                  handleQuickQuantityAdjust(product, -1)
                                }
                              >
                                <Minus size={13} />
                              </button>
                              <span className="qty-pill">{product.quantity}</span>
                              <button
                                type="button"
                                className="stepper-mini-btn"
                                aria-label={`Increase quantity of ${product.name}`}
                                onClick={() =>
                                  handleQuickQuantityAdjust(product, 1)
                                }
                              >
                                <Plus size={13} />
                              </button>
                            </div>

                            {/* Status Tag */}
                            {isOutOfStock ? (
                              <span className="stock-tag out-of-stock">
                                Out of Stock
                              </span>
                            ) : isLowStock ? (
                              <span className="stock-tag low-stock">
                                Low Stock
                              </span>
                            ) : (
                              <span className="stock-tag in-stock">
                                In Stock
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Actions Column */}
                        <td>
                          <div className="actions-cell">
                            <button
                              type="button"
                              className="btn-icon-action"
                              id={`btn-edit-${product.id}`}
                              aria-label={`Edit ${product.name}`}
                              title="Edit product"
                              onClick={() => openEditModal(product)}
                            >
                              <Edit3 size={16} />
                            </button>
                            <button
                              type="button"
                              className="btn-icon-action danger"
                              id={`btn-delete-${product.id}`}
                              aria-label={`Delete ${product.name}`}
                              title="Delete product"
                              onClick={() => openDeleteModal(product)}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </div>

      {/* Edit Product Modal */}
      {editModalProduct && (
        <div
          className="modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-modal-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeEditModal();
          }}
        >
          <div className="modal-content">
            <div className="modal-header">
              <h3 id="edit-modal-title" className="modal-title">
                Edit Product
              </h3>
              <button
                type="button"
                className="modal-close-btn"
                id="btn-close-edit-modal"
                aria-label="Close edit dialog"
                onClick={closeEditModal}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} noValidate id="edit-product-form">
              <div className="modal-body">
                {/* Edit Name */}
                <div className="form-group">
                  <label htmlFor="edit-name" className="form-label">
                    Product Name <span className="required-mark">*</span>
                  </label>
                  <input
                    id="edit-name"
                    type="text"
                    className={`input-field ${
                      editErrors.name ? "input-error" : ""
                    }`}
                    value={editName}
                    onChange={(e) => {
                      setEditName(e.target.value);
                      if (editErrors.name) {
                        setEditErrors((prev) => ({ ...prev, name: undefined }));
                      }
                    }}
                  />
                  {editErrors.name && (
                    <div className="error-message">
                      <AlertCircle size={14} />
                      <span>{editErrors.name}</span>
                    </div>
                  )}
                </div>

                {/* Edit SKU */}
                <div className="form-group">
                  <label htmlFor="edit-sku" className="form-label">
                    SKU <span className="optional-mark">(optional)</span>
                  </label>
                  <input
                    id="edit-sku"
                    type="text"
                    className="input-field"
                    value={editSku}
                    onChange={(e) => setEditSku(e.target.value)}
                  />
                </div>

                {/* Edit Quantity */}
                <div className="form-group">
                  <label htmlFor="edit-quantity" className="form-label">
                    Quantity <span className="required-mark">*</span>
                  </label>
                  <div className="stepper-wrapper">
                    <button
                      type="button"
                      className="stepper-btn"
                      aria-label="Decrease edit quantity"
                      onClick={() => {
                        const current = Number(editQuantity) || 0;
                        if (current > 0) {
                          setEditQuantity(current - 1);
                          if (editErrors.quantity) {
                            setEditErrors((prev) => ({
                              ...prev,
                              quantity: undefined,
                            }));
                          }
                        }
                      }}
                    >
                      <Minus size={16} />
                    </button>
                    <input
                      id="edit-quantity"
                      type="number"
                      min="0"
                      step="1"
                      className={`input-field stepper-input ${
                        editErrors.quantity ? "input-error" : ""
                      }`}
                      value={editQuantity}
                      onChange={(e) => {
                        setEditQuantity(e.target.value);
                        if (editErrors.quantity) {
                          setEditErrors((prev) => ({
                            ...prev,
                            quantity: undefined,
                          }));
                        }
                      }}
                    />
                    <button
                      type="button"
                      className="stepper-btn"
                      aria-label="Increase edit quantity"
                      onClick={() => {
                        const current = Number(editQuantity) || 0;
                        setEditQuantity(current + 1);
                        if (editErrors.quantity) {
                          setEditErrors((prev) => ({
                            ...prev,
                            quantity: undefined,
                          }));
                        }
                      }}
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  {editErrors.quantity && (
                    <div className="error-message">
                      <AlertCircle size={14} />
                      <span>{editErrors.quantity}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  id="btn-cancel-edit"
                  onClick={closeEditModal}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  id="btn-save-edit"
                  style={{ width: "auto" }}
                  disabled={updating}
                >
                  {updating ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalProduct && (
        <div
          className="modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-modal-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) setDeleteModalProduct(null);
          }}
        >
          <div className="modal-content">
            <div className="modal-header">
              <h3 id="delete-modal-title" className="modal-title">
                Confirm Product Deletion
              </h3>
              <button
                type="button"
                className="modal-close-btn"
                id="btn-close-delete-modal"
                aria-label="Close delete dialog"
                onClick={() => setDeleteModalProduct(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              <div
                style={{
                  display: "flex",
                  gap: "1rem",
                  alignItems: "flex-start",
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: "50%",
                    background: "rgba(244, 63, 94, 0.15)",
                    color: "#fb7185",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <AlertTriangle size={22} />
                </div>
                <div>
                  <p style={{ color: "#ffffff", fontWeight: 600, fontSize: "0.95rem" }}>
                    Are you sure you want to delete this product?
                  </p>
                  <p
                    style={{
                      color: "var(--text-secondary)",
                      fontSize: "0.85rem",
                      marginTop: "0.4rem",
                    }}
                  >
                    <strong>&ldquo;{deleteModalProduct.name}&rdquo;</strong>{" "}
                    {deleteModalProduct.sku ? `(SKU: ${deleteModalProduct.sku})` : ""}{" "}
                    will be permanently removed from SQLite database storage. This
                    action cannot be undone.
                  </p>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                id="btn-cancel-delete"
                onClick={() => setDeleteModalProduct(null)}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger"
                id="btn-confirm-delete"
                onClick={confirmDelete}
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Delete Product"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
