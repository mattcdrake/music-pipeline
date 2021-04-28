import React from "react";
import "./App.css";

import { Header } from "./components/Header";
import { Navbar } from "./components/Navbar";

function App() {
  return (
    <div>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <Header />
      </div>
    </div>
  );
}

export default App;
