import React from "react";
import "./App.css";

// Components
import { AlbumsContainer } from "./components/AlbumsContainer";
import { FilterBar } from "./components/FilterBar";
import { Header } from "./components/Header";
import { Navbar } from "./components/Navbar";

// Types
import { Album } from "./types";

// Test data
import { albums } from "./testData/albums";

function App() {
  return (
    <div>
      <Navbar />
      <div className="container mx-auto px-4 pt-8">
        <Header />
        <FilterBar />
      </div>
      <AlbumsContainer albums={albums} />
    </div>
  );
}

export default App;
