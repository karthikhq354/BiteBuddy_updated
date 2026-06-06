import { useState, useEffect } from "react";
import "./Edit.css";
import axios from "axios";
import { toast } from "react-toastify";

// ── EDIT FOOD PAGE (Admin) ────────────────────────────────
// Route: /edit?id=<foodId>
// Pre-fills the form with the existing food item data.
// Only sends fields that actually changed to the backend.

const Edit = ({ url }) => {
  const [image, setImage]     = useState(null);   // new image file (optional)
  const [loading, setLoading] = useState(true);
  const [data, setData]       = useState({
    id: "",
    name: "",
    description: "",
    price: "",
    category: "",
  });

  // ── LOAD EXISTING FOOD DATA ───────────────────────────
  // Read the ?id= param from the URL, fetch the item, pre-fill the form
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const foodId = params.get("id");

    if (!foodId) {
      toast.error("No food ID provided");
      setLoading(false);
      return;
    }

    const fetchFood = async () => {
      try {
        const response = await axios.get(`${url}/api/food/list`);
        if (response.data.success) {
          const food = response.data.data.find((f) => f._id === foodId);
          if (food) {
            setData({
              id:          food._id,
              name:        food.name,
              description: food.description,
              price:       food.price,
              category:    food.category,
            });
          } else {
            toast.error("Food item not found");
          }
        }
      } catch (err) {
        toast.error("Failed to load food item");
      } finally {
        setLoading(false);
      }
    };

    fetchFood();
  }, [url]);

  // ── FORM CHANGE HANDLER ───────────────────────────────
  const onChangeHandler = (event) => {
    const { name, value } = event.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  // ── SUBMIT HANDLER ────────────────────────────────────
  const onSubmitHandler = async (event) => {
    event.preventDefault();

    const formData = new FormData();
    formData.append("id",          data.id);
    formData.append("name",        data.name);
    formData.append("description", data.description);
    formData.append("price",       Number(data.price));
    formData.append("category",    data.category);

    // Only attach image if the admin chose a new one
    if (image) {
      formData.append("image", image);
    }

    const response = await axios.post(`${url}/api/food/edit`, formData);
    if (response.data.success) {
      toast.success("Food item updated!");
      // Redirect back to list after 1.5s
      setTimeout(() => (window.location.href = "/list"), 1500);
    } else {
      toast.error(response.data.message);
    }
  };

  if (loading) return <p style={{ padding: "40px" }}>Loading...</p>;

  return (
    <div className="edit add">
      <form onSubmit={onSubmitHandler} className="flex-col">

        {/* ── IMAGE ──────────────────────────────────── */}
        <div className="add-img-upload flex-col">
          <p>Food Image</p>
          <label className="image-area" htmlFor="image">
            <img
              width={120}
              src={
                image
                  ? URL.createObjectURL(image)
                  : `${url}/images/${data.id}` // show current image as fallback
              }
              alt=""
              onError={(e) => { e.target.style.display = "none"; }}
            />
            <span className="edit-image-hint">Click to change image (optional)</span>
          </label>
          <input
            onChange={(e) => setImage(e.target.files[0])}
            type="file"
            id="image"
            hidden
            accept="image/*"
          />
        </div>

        {/* ── NAME ──────────────────────────────────── */}
        <div className="add-product-name flex-col">
          <p>Product Name</p>
          <input
            onChange={onChangeHandler}
            value={data.name}
            required
            type="text"
            name="name"
            placeholder="Product name"
          />
        </div>

        {/* ── DESCRIPTION ──────────────────────────── */}
        <div className="add-product-description flex-col">
          <p>Description</p>
          <textarea
            onChange={onChangeHandler}
            value={data.description}
            name="description"
            rows="6"
            placeholder="Product description"
            required
          />
        </div>

        {/* ── CATEGORY + PRICE ─────────────────────── */}
        <div className="add-category-price">
          <div className="add-category flex-col">
            <p>Category</p>
            <select onChange={onChangeHandler} name="category" value={data.category}>
              <option value="Salad">Salad</option>
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
                <option value="Beverages">Drinks</option>
            </select>
          </div>
          <div className="add-price flex-col">
            <p>Price</p>
            <input
              onChange={onChangeHandler}
              value={data.price}
              required
              type="number"
              name="price"
              placeholder="₹"
            />
          </div>
        </div>

        <button type="submit" className="add-btn">SAVE CHANGES</button>
      </form>
    </div>
  );
};

export default Edit;