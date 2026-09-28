import React from "react";
import { Navbar } from "./components/spydy";
import { HERO_DATA } from "./data/spidermanData";

export default function App() {
  return (
    <div className="w-full min-h-screen bg-white text-gray-900 overflow-x-hidden font-['Outfit',sans-serif]">
      <Navbar />
      <div className="flex flex-col items-center justify-center min-h-screen text-center px-4 pt-20">
        <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-shadow-hero">
          <span className="text-red-600">{HERO_DATA.firstName}</span>{" "}
          <span className="text-black">{HERO_DATA.lastName}</span>
        </h1>
        <p className="mt-4 text-gray-600 font-mono tracking-widest uppercase text-sm">
          {HERO_DATA.tagline}
        </p>
      </div>
    </div>
  );
}
