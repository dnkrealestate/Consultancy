import Image from "next/image";
import BannerHome from "./components/BannerHome";
import ResturantChar from "@/public/assets/banner/restaurant-char.webp";
import ResturantMain from "@/public/assets/banner/restaurant-main.webp";
import FactoryMain from "@/public/assets/banner/factory-main.webp";
import FactoryChar from "@/public/assets/banner/factory-char.webp";
import EcommerceMain from "@/public/assets/banner/ecommerce-main.webp";
import EcommerceChar from "@/public/assets/banner/ecommerce-char.webp";
import ZoneExplore from "./components/zone/ZoneExplore";
import ServicesSection from "./components/services/ServicesSection";

export default function Home() {
  const slidesData = [
    {
      background: ResturantChar,
      image: ResturantMain,
      title: "Ready to Launch",
      title2: "Your Restaurant Business in Dubai?",
      title3: "Restaurant License"
    },
    {
      background: FactoryChar,
      image: FactoryMain,
      title: "Ready to Launch",
      title2: "Your Industrial Business in Dubai?",
      title3: "Industrial License"
    },
    {
      background: EcommerceChar,
      image: EcommerceMain,
      title: "Ready to Launch",
      title2: "Your E-commerce Business in Dubai?",
      title3: "E-commerce License"
    },
  ];

  return (
    <>
      <BannerHome slides={slidesData} />
      <ZoneExplore />
      <ServicesSection />
    </>
  );
}
