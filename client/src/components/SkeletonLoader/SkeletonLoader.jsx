import React from "react";
import "./SkeletonLoader.css";

export const FoodCardSkeleton = () => (
  <div className="skeleton-card">
    <div className="skeleton skeleton-img" />
    <div className="skeleton-body">
      <div className="skeleton skeleton-title" />
      <div className="skeleton skeleton-desc" />
      <div className="skeleton skeleton-desc short" />
      <div className="skeleton skeleton-price" />
    </div>
  </div>
);

export const FoodGridSkeleton = ({ count = 8 }) => (
  <div className="skeleton-grid">
    {Array.from({ length: count }).map((_, i) => <FoodCardSkeleton key={i} />)}
  </div>
);