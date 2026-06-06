import React, { useState, useEffect } from "react";
import "./Add.css";
import { assets } from "../../assets/assets";
import axios from "axios";
import { toast } from "react-toastify";

const Add = ({ url }) => {
  const [image,      setImage]      = useState(false);
  const [categories, setCategories] = useState([]);
  const [loading,    setLoading]    = useState(false);
  const [data, setData] = useState({
    name: "", description: "", price: "", category: "",
  });

  useEffect(() => {
    axios.get(`${url}/api/category/list`).then(({ data }) => {
      if (data.success) setCategories(data.data);
    });
  }, []);

  const onChangeHandler = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    if (!image) return toast.error("Please upload a food image");
    setLoading(true);
    const formData = new FormData();
    formData.append("name",        data.name);
    formData.append("category",    data.category);
    formData.append("description", data.description);
    formData.append("price",       Number(data.price));
    formData.append("image",       image);
    const response = await axios.post(`${url}/api/food/add`, formData);
    if (response.data.success) {
      setData({ name: "", description: "", price: "", category: "" });
      setImage(false);
      toast.success("Food item added successfully!");
    } else {
      toast.error(response.data.message);
    }
    setLoading(false);
  };

  return (
    <div className="add-page">
      <div className="add-header">
        <h1>Add New Item</h1>
        <p>Fill in the details to add a new food item to your menu</p>
      </div>

      <form onSubmit={onSubmitHandler} className="add-form">

        {/* ── IMAGE ──────────────────────── */}
        <div className="add-card">
          <h2>Food Image</h2>
          <label htmlFor="image" className="add-image-label">
            {image ? (
              <img src={URL.createObjectURL(image)} alt="preview" className="add-image-preview" />
            ) : (
              <div className="add-image-placeholder">
                <img src={assets.upload_area} alt="" />
                <p>Click to upload image</p>
                <span>PNG, JPG up to 5MB</span>
              </div>
            )}
          </label>
          <input onChange={(e) => setImage(e.target.files[0])}
            type="file" id="image" accept="image/*" hidden />
          {image && (
            <button type="button" className="add-remove-img"
              onClick={() => setImage(false)}>✕ Remove image</button>
          )}
        </div>

        {/* ── DETAILS ────────────────────── */}
        <div className="add-card">
          <h2>Item Details</h2>
          <div className="add-field">
            <label>Item Name *</label>
            <input required name="name" value={data.name}
              placeholder="e.g. Margherita Pizza"
              onChange={onChangeHandler} />
          </div>
          <div className="add-field">
            <label>Description *</label>
            <textarea required name="description" value={data.description}
              rows={4} placeholder="Describe the food item..."
              onChange={onChangeHandler} />
          </div>
          <div className="add-row">
            <div className="add-field">
              <label>Category *</label>
              <select required name="category" value={data.category} onChange={onChangeHandler}>
                <option value="">-- Select category --</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat.name}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div className="add-field">
              <label>Price (₹) *</label>
              <input required type="number" name="price" value={data.price}
                placeholder="e.g. 250" onChange={onChangeHandler} />
            </div>
          </div>
        </div>

        <button type="submit" className="add-submit-btn" disabled={loading}>
          {loading ? "Adding..." : "➕ Add Food Item"}
        </button>

      </form>
    </div>
  );
};

export default Add;
{/* <option value="Salad">Salad</option>
                <option value="Rolls">Rolls</option>
                <option value="Deserts">Deserts</option>
                <option value="Sandwich">Sandwich</option>
                <option value="Cake">Cake</option>
                <option value="Pure Veg">Pure Veg</option>
                <option value="Pasta">Pasta</option>
                <option value="Noodles">Noodles</option>
                <option value="Biryani">Biryani</option>
                <option value="Pizza">Pizza</option>
                <option value="Burgers">Burgers</option>
                <option value="Beverages">Drinks</option> */}