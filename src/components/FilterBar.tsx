import React from "react";

export const FilterBar = () => {
  return (
    <div className="border rounded flex my-4">
      <div className="border p-1 inline-block">Date Filter</div>
      <div className="border p-1 inline-block">Genre Filter</div>
      <div className="border p-1 inline-block ml-auto">Search bar</div>
    </div>
  );
};
