import { useEffect, useState } from "react";
import "./List.css";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const List = ({ url }) => {
  const [list,    setList]    = useState([]);
  const [search,  setSearch]  = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchList = async () => {
    const response = await axios.get(`${url}/api/food/list`);
    if (response.data.success) setList(response.data.data);
    else toast.error("Error fetching food list");
    setLoading(false);
  };

  const removeFood = async (foodId) => {
    if (!window.confirm("Delete this item?")) return;
    const response = await axios.post(`${url}/api/food/remove`, { id: foodId });
    if (response.data.success) { toast.success("Item deleted"); await fetchList(); }
    else toast.error("Error removing food item");
  };

  useEffect(() => { fetchList(); }, []);

  const filtered = list.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase()) ||
    item.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="list-page">

      {/* ── HEADER ─────────────────────────── */}
      <div className="list-header">
        <div>
          <h1>List Items</h1>
          <p>{list.length} total items</p>
        </div>
        <div className="list-search">
          <span>🔍</span>
          <input
            placeholder="Search by name or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && <button onClick={() => setSearch("")}>✕</button>}
        </div>
      </div>

      {/* ── TABLE ──────────────────────────── */}
      {loading ? (
        <div className="list-loading">
          <div className="list-spinner" />
          <p>Loading items...</p>
        </div>
      ) : (
        <div className="list-card">
          <table className="list-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={5} className="list-empty">No items found.</td></tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item._id} className="list-row">
                    <td>
                      <img
                        src={`${url}/images/${item.image}`}
                        alt={item.name}
                        className="list-img"
                      />
                    </td>
                    <td className="list-name">{item.name}</td>
                    <td><span className="list-cat-tag">{item.category}</span></td>
                    <td className="list-price">₹{item.price}</td>
                    <td>
                      <div className="list-actions">
                        <button
                          className="list-edit-btn"
                          onClick={() => navigate(`/edit?id=${item._id}`)}
                        >
                          ✏️ Edit
                        </button>
                        <button
                          className="list-del-btn"
                          onClick={() => removeFood(item._id)}
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default List;