"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

export const BannerHome = ({ slides }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [slides.length]);

  return (
    <div className="banner w-full bg-[#0B535F] flex items-center justify-center">
      <div className="container max-w-[1240px] px-4 items-center overflow-hidden relative">
        <div className="grid md:grid-cols-2">
          {/* Left Text Section */}
          <motion.div
            initial={{ x: -200, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="z-10 w-fit banner-h1 pt-[3rem] sm:pt-[5rem] md:py-[8rem] md:pb-0"
          >
            <h1>Empower Your Dreams, Start Your Business Today in Dubai</h1>
            <p className="text-[#fff]">
              Launch your business in Dubai, a global hub for innovation and
              growth, with world-class infrastructure and business-friendly
              policies ensuring your success.
            </p>
            <button onClick={() => {}} className="site-btn1">
              Request callback
            </button>
          </motion.div>

          {/* Right Slide Section */}
          <motion.div
            initial={{ x: 200, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="z-10"
          >
            <div className="slider-container relative">
              {slides?.map((slide, index) => (
                <div
                  key={index}
                  className={`slide ${index === currentIndex ? "active" : ""}`}
                  style={{
                    "--local-rotation":
                      index === currentIndex ? "0deg" : "-180deg",
                    "--local-scale": index === currentIndex ? "1" : "0",
                  }}
                >
                  {/* Background Image */}
                  <div className="slide-background">
                    <Image
                      src={slide.background}
                      alt="Background"
                      width={500}
                      height={300}
                      className="object-cover"
                    />
                  </div>

                  {/* Main Image */}
                  <div className="slide-content">
                    <Image
                      src={slide.image}
                      alt="Main"
                      width={500}
                      height={300}
                      className="object-contain"
                    />
                  </div>

                  {/* Label */}
                  <div className="absolute z-10 flex align-middle w-full">
                    <div className="bg-[#fff] rounded-full mt-2 px-10 w-fit m-auto mb-[-5px]">
                      <p className="!text-[#000] !mb-0 py-1 relative">
                        {slide.title3}
                      </p>
                    </div>
                  </div>

                  {/* Card Info */}
                  <div className="cardbox">
                    <h3 className="text-[#fff] text-[0.6rem] md:text-[0.9rem]">
                      {slide.title}
                    </h3>
                    <h3 className="text-[#fff] text-[0.6rem] md:text-[0.9rem]">
                      {slide.title2}
                    </h3>
                    <button className="py-1 px-3 bg-[#fff] text-[#000] hover:text-[#fff] hover:bg-[#000] mt-2 rounded-sm text-[0.7rem] md:text-[0.9rem]">
                      Schedule Meet
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Overlay for mobile */}
        {/* <div className="bg-[#00000066] w-full h-full absolute left-0 top-0 z-0 sm:hidden"></div> */}
      </div>
    </div>
  );
};

export default BannerHome;
