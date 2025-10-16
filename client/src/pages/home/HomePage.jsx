import { useState } from "react";
import HeroSection from "./sections/HeroSection.jsx";
import CategoriesSection from "./sections/CategoriesSection.jsx";
import FeaturedProductsSection from "./sections/FeaturedProductsSection.jsx";
import "./home.css";

export default function HomePage() {
  const [showScrollTop, setShowScrollTop] = useState(false);

  return (
    <div className="home-page">
      <HeroSection onScrollToggle={setShowScrollTop} />
      <CategoriesSection />
      <FeaturedProductsSection />
    </div>
  );
}
