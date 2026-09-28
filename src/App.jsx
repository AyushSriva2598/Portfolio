import React from "react";
import { Navbar, Hero } from "./components/spydy";

export default function App() {
  return (
    <div className="w-full min-h-screen bg-white text-gray-900 overflow-x-hidden font-['Outfit',sans-serif]">
      <Navbar />
      <Hero />
    </div>
  );
}
