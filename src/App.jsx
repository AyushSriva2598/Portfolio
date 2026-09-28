import React from "react";
import { Navbar, Hero, About, Skills } from "./components/spydy";

export default function App() {
  return (
    <div className="w-full min-h-screen bg-white text-gray-900 overflow-x-hidden font-['Outfit',sans-serif]">
      <Navbar />
      <Hero />
      <About />
      <Skills />
    </div>
  );
}
