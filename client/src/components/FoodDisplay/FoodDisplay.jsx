import React, { useContext } from "react";
import "./FoodDisplay.css";
import { StoreContext } from "../../context/StoreContext";
import FoodItem from "../FoodItem/FoodItem";
import { useNavigate } from "react-router-dom";

const FoodDisplay = ({ category, limit }) => {
  const { food_list, searchQuery } = useContext(StoreContext);
  const navigate = useNavigate();

  const query = searchQuery.trim().toLowerCase();

  const filteredList = food_list.filter((item) => {
    const matchesCategory = category === "All" || category === item.category;
    const matchesSearch =
      !query ||
      item.name.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });

  const displayList = limit ? filteredList.slice(0, limit) : filteredList;
  const hasMore     = limit && filteredList.length > limit;

  return (
    <div className="food-display" id="food-display">
      <h2>
        {query
          ? `Results for "${searchQuery}" (${filteredList.length})`
          : "Top dishes near you"}
      </h2>

      {displayList.length === 0 ? (
        <div className="food-display-empty">
          <p>😕 No dishes found for "<b>{searchQuery}</b>"</p>
          <p>Try a different keyword or browse all categories.</p>
        </div>
      ) : (
        <div className="food-display-list">
          {displayList.map((item) => (
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

      {hasMore && (
        <div className="food-display-more">
          <button onClick={() => navigate("/menu")}>
            Explore Menu →
          </button>
        </div>
      )}
    </div>
  );
};

export default FoodDisplay;