import React, { useContext, useState, useEffect, useRef } from "react";
import "./Menu.css";
import { StoreContext } from "../../context/StoreContext";
import FoodItem from "../../components/FoodItem/FoodItem";
import { FoodGridSkeleton } from "../../components/SkeletonLoader/SkeletonLoader";
import axios from "axios";

const API = import.meta.env.VITE_SERVER_URL || "http://localhost:4000";
const SORT_OPTIONS = ["Default", "Price: Low to High", "Price: High to Low"];

const Menu = () => {
  const { food_list = [] } = useContext(StoreContext);
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("Default");
  const [loading, setLoading] = useState(true);
  const [categoryList, setCategoryList] = useState([]);
  const categoryRefs = useRef({});

  useEffect(() => {
    axios.get(`${API}/api/category/list`)
      .then(({ data }) => {
        if (data.success) setCategoryList(data.data.map((c) => c.name));
      })
      .catch(() => setCategoryList([]));
  }, []);

  useEffect(() => {
    if (food_list.length > 0) setLoading(false);
  }, [food_list]);

  const filtered = food_list
    .filter((item) => {
      const q = search.toLowerCase();
      return (
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      if (sort === "Price: Low to High") return a.price - b.price;
      if (sort === "Price: High to Low") return b.price - a.price;
      return 0;
    });

  const categories = ["All", ...categoryList];

  const getItemsByCategory = (cat) =>
    cat === "All" ? filtered : filtered.filter((i) => i.category === cat);

  const scrollToCategory = (name) => {
    setActiveCategory(name);
    categoryRefs.current[name]?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <div className="menu-page">
      {/* 🔍 Sticky Top Bar */}
      <div className="menu-top-bar">
        <div className="menu-search">
          <span>🔍</span>
          <input
            type="text"
            placeholder="Search dishes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && <button onClick={() => setSearch("")}>✕</button>}
        </div>

        <div className="menu-filters">
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            {SORT_OPTIONS.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="menu-layout">
        {/* 📂 Sticky Sidebar */}
        <aside className="menu-sidebar">
          <p className="menu-sidebar-title">CATEGORIES</p>
          {categories.map((cat) => (
            <button
              key={cat}
              className={`menu-cat-btn ${
                activeCategory === cat ? "active" : ""
              }`}
              onClick={() => scrollToCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </aside>

        {/* 🍽 Content */}
        <div className="menu-content">
          {loading ? (
            <FoodGridSkeleton count={8} />
          ) : (
            categories.map((cat) => {
              const items = getItemsByCategory(cat);
              if (cat !== "All" && items.length === 0) return null;

              return (
                <div
                  key={cat}
                  ref={(el) => (categoryRefs.current[cat] = el)}
                  className="menu-section"
                >
                  <h2 className="menu-section-title">{cat}</h2>

                  {items.length === 0 ? (
                    <p className="menu-empty">No items found.</p>
                  ) : (
                    <div className="menu-grid">
                      {items.map((item) => (
                        <FoodItem
                          key={item._id}
                          id={item._id}
                          name={item.name}
                          description={item.description}
                          price={item.price}
                          image={item.image}
                          category={item.category}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default Menu;