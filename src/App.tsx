import React from "react";
import "./App.css";

// Components
import { AlbumsContainer } from "./components/AlbumsContainer";
import { FilterBar } from "./components/FilterBar";
import { Header } from "./components/Header";
import { Navbar } from "./components/Navbar";

// Types
import { Album } from "./types";

function App() {
  const albums: Album[] = [];
  for (let i = 0; i < 10; ++i) {
    albums.push({
      artist: "Opeth",
      title: "Ghost Reveries",
      releaseDate: new Date(),
      coverURL: new URL(
        "https://upload.wikimedia.org/wikipedia/en/5/52/Ghost_Reveries_%28Opeth%29_album_cover.jpg"
      ),
    });
  }

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
