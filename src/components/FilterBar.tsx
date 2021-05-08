import React from "react";

interface FilterBarProps {
  updateDateFilter: (date: Date) => void;
}

export const FilterBar = (props: FilterBarProps) => {
  return (
    <div className="border rounded flex mt-12">
      <label>
        Date Filter:
        <input
          type="month"
          min="2018-03"
          value="2018-05"
          className="mx-12"
        ></input>
      </label>

      <div className="border p-1 inline-block">Genre Filter</div>
      <div className="border p-1 inline-block ml-auto">Search bar</div>
    </div>
  );
};
