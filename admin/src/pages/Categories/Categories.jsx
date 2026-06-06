import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "./Categories.css";

const Categories = ({ url }) => {
  const [categories, setCategories] = useState([]);
  const [form, setForm]             = useState({ name: "", order: "" });
  const [image, setImage]           = useState(null);
  const [editId, setEditId]         = useState(null);
  const [loading, setLoading]       = useState(false);

  const fetchCategories = async () => {
    const { data } = await axios.get(`${url}/api/category/all`);
    if (data.success) setCategories(data.data);
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error("Category name is required");
    setLoading(true);
    const formData = new FormData();
    formData.append("name",  form.name.trim());
    formData.append("order", form.order || 0);
    if (image) formData.append("image", image);
    try {
      if (editId) {
        const { data } = await axios.put(`${url}/api/category/update/${editId}`, formData);
        data.success ? toast.success("Category updated!") : toast.error(data.message);
      } else {
        const { data } = await axios.post(`${url}/api/category/add`, formData);
        data.success ? toast.success("Category added!") : toast.error(data.message);
      }
      setForm({ name: "", order: "" });
      setImage(null);
      setEditId(null);
      fetchCategories();
    } catch (err) {
      toast.error("Something went wrong");
    }
    setLoading(false);
  };

  const handleEdit = (cat) => {
    setEditId(cat._id);
    setForm({ name: cat.name, order: cat.order });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    const { data } = await axios.delete(`${url}/api/category/delete/${id}`);
    data.success ? toast.success("Category deleted") : toast.error(data.message);
    fetchCategories();
  };

  const handleToggle = async (cat) => {
    const formData = new FormData();
    formData.append("name",   cat.name);
    formData.append("order",  cat.order);
    formData.append("active", !cat.active);
    const { data } = await axios.put(`${url}/api/category/update/${cat._id}`, formData);
    if (data.success) {
      toast.success(`Category ${!cat.active ? "enabled" : "disabled"}`);
      fetchCategories();
    }
  };

  const cancelEdit = () => {
    setEditId(null);
    setForm({ name: "", order: "" });
    setImage(null);
  };

  return (
    <div className="categories-page">

      <div className="cat-form-card">
        <h2>{editId ? "✏️ Edit Category" : "➕ Add New Category"}</h2>
        <form onSubmit={handleSubmit} className="cat-form">
          <div className="cat-form-row">
            <div className="cat-field">
              <label>Category Name *</label>
              <input
                required
                placeholder="e.g. Biryani, Pizza, Burgers..."
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="cat-field">
              <label>Display Order</label>
              <input
                type="number"
                placeholder="0 = first"
                value={form.order}
                onChange={(e) => setForm({ ...form, order: e.target.value })}
              />
            </div>
          </div>

          <div className="cat-field">
            <label>Category Image</label>
            <div className="cat-image-upload">
              <input type="file" accept="image/*" id="cat-image"
                onChange={(e) => setImage(e.target.files[0])} />
              <label htmlFor="cat-image" className="cat-image-label">
                {image ? (
                  <img src={URL.createObjectURL(image)} alt="preview" />
                ) : (
                  <div className="cat-image-placeholder">
                    <span>📷</span>
                    <p>Click to upload image</p>
                  </div>
                )}
              </label>
            </div>
          </div>

          <div className="cat-form-actions">
            <button type="submit" className="cat-btn-save" disabled={loading}>
              {loading ? "Saving..." : editId ? "Update Category" : "Add Category"}
            </button>
            {editId && (
              <button type="button" className="cat-btn-cancel" onClick={cancelEdit}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="cat-list-card">
        <div className="cat-list-header">
          <h2>All Categories</h2>
          <span className="cat-count">{categories.length} total</span>
        </div>
        {categories.length === 0 ? (
          <div className="cat-empty"><p>No categories yet. Add one above.</p></div>
        ) : (
          <div className="cat-table-wrap">
            <table className="cat-table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Name</th>
                  <th>Order</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat) => (
                  <tr key={cat._id} className={!cat.active ? "cat-row-inactive" : ""}>
                    <td>
                      <div className="cat-thumb">
                        {cat.image
                          ? <img src={`${url}/images/${cat.image}`} alt={cat.name} />
                          : <span className="cat-no-img">🍽️</span>
                        }
                      </div>
                    </td>
                    <td className="cat-name">{cat.name}</td>
                    <td className="cat-order">{cat.order}</td>
                    <td>
                      <button
                        className={`cat-toggle ${cat.active ? "active" : "inactive"}`}
                        onClick={() => handleToggle(cat)}
                      >
                        {cat.active ? "✅ Active" : "❌ Hidden"}
                      </button>
                    </td>
                    <td className="cat-actions">
                      <button className="cat-btn-edit" onClick={() => handleEdit(cat)}>✏️ Edit</button>
                      <button className="cat-btn-delete" onClick={() => handleDelete(cat._id, cat.name)}>🗑️ Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};

export default Categories;