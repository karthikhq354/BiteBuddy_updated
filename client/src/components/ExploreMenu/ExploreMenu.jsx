import React, { useState, useEffect } from "react";
import "./ExploreMenu.css";
import axios from "axios";

const API = import.meta.env.VITE_SERVER_URL || "http://localhost:4000";

const ExploreMenu = ({ category, setCategory }) => {
  const [menuList, setMenuList] = useState([]);

  useEffect(() => {
    axios.get(`${API}/api/category/list`).then(({ data }) => {
      if (data.success) setMenuList(data.data);
    }).catch(() => setMenuList([]));
  }, []);

  return (
    <div id="explore-menu" className="explore-menu">
      <h1>Explore our menu</h1>
      <p className="explore-menu-text">
        Explore a wide variety of cuisines crafted to satisfy every craving.
      </p>
      <div className="explore-menu-list">
        {menuList.map((item) => (
          <div key={item._id} className="explore-menu-list-item"
            onClick={() => setCategory((prev) => prev === item.name ? "All" : item.name)}>
            <div className={`explore-menu-img-wrap ${category === item.name ? "active" : ""}`}>
              {item.image
                ? <img src={`${API}/images/${item.image}`} alt={item.name} />
                : <span style={{fontSize:"32px"}}>🍽️</span>
              }
            </div>
            <p>{item.name}</p>
          </div>
        ))}
      </div>
      <hr />
    </div>
  );
};

export default ExploreMenu;