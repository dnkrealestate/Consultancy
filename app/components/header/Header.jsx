"use client";

import React, { useEffect, useState } from "react";
import { IoMenu, IoClose } from "react-icons/io5";
import { FaFacebookF, FaInstagram, FaLinkedin } from "react-icons/fa";
import { MdCall } from "react-icons/md";
import { RiWhatsappFill } from "react-icons/ri";
import Link from "next/link";
import { usePathname } from "next/navigation";

export const Header = () => {
  const [nav, setNav] = useState(true);
  const pathname = usePathname(); // ✅ replaces useLocation()

   useEffect(() => {
     const handleScroll = () => {
       const header = document.querySelector("header");
       if (header) {
         header.classList.toggle("sticky", window.scrollY > 0);
       }
     };
     window.addEventListener("scroll", handleScroll);
     return () => window.removeEventListener("scroll", handleScroll);
   }, []);
  
  // nav menu button
  const handleNav = () => {
    setNav(!nav);
  };

  return (
    <>
      <header>
        <div className="header flex container items-center justify-between h-15 max-w-[1240px] mx-auto px-4 py-2">
          {/* Left Logo & Menu */}
          <div className="left-block flex items-center justify-center gap-4 md:gap-0">
            <div onClick={handleNav}>
              {!nav ? (
                <IoClose className="menu-btn" />
              ) : (
                <IoMenu className="menu-btn" />
              )}
            </div>
            <Link href="/">
              <div className="w-[full] h-[45px] flex items-center justify-start cursor-pointer">
                <h1 className="text-white text-[2rem] font-semibold">LOGO</h1>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <div className="right-block left-block flex items-center justify-center">
            <nav>
              <ul className="items-center justify-center gap-4">
                {[
                  { href: "/", label: "Home" },
                  { href: "/licensing", label: "Licensing" },
                  { href: "/blog", label: "Guide" },
                  { href: "/service", label: "Service" },
                  { href: "/workspace", label: "Workspace" },
                  { href: "/visa", label: "Visa" },
                  { href: "/contact", label: "Contact" },
                ].map((item) => (
                  <li
                    key={item.href}
                    className={`relative inline-flex items-center justify-center group m-2 ${
                      pathname === item.href ? "activeHead" : ""
                    }`}
                  >
                    <Link href={item.href}>
                      <p className="group-hover:text-[#18A4A0] transition duration-200 ease-out">
                        {item.label}
                      </p>
                      <span
                        className={
                          "absolute bottom-0 left-0 w-full h-0.5 bg-[#18A4A0] rounded origin-bottom-right transform transition duration-200 ease-out scale-x-0 group-hover:scale-x-100 group-hover:origin-bottom-left"
                        }
                      ></span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Socials */}
            <div className="socials flex items-center justify-center">
              <ul className="items-center justify-center gap-4 pr-2 border-r border-white hidden md:flex">
                <li className="group">
                  <a
                    href="https://www.facebook.com/dnkrealestate1/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FaFacebookF className="group-hover:text-[#18A4A0] text-xl transition duration-200 ease-out" />
                  </a>
                </li>
                <li className="group">
                  <a
                    href="https://www.instagram.com/dnk_re/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FaInstagram className="group-hover:text-[#18A4A0] text-xl transition duration-200 ease-out" />
                  </a>
                </li>
                <li className="group">
                  <a
                    href="https://www.linkedin.com/company/dnkrealestate/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FaLinkedin className="group-hover:text-[#18A4A0] text-xl transition duration-200 ease-out" />
                  </a>
                </li>
              </ul>
              <ul className="pl-2 flex items-center gap-4">
                <li className="group">
                  <a href="tel:+971555769195">
                    <MdCall className="group-hover:text-[#18A4A0] text-xl transition duration-200 ease-out" />
                  </a>
                </li>
                <li className="group">
                  <a
                    href="https://wa.me/+971555769195?text=Hello,"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <RiWhatsappFill className="group-hover:text-[#18A4A0] text-xl transition duration-200 ease-out" />
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </header>

      <nav
        className={
          !nav
            ? "fixed left-0 top-[55px] w-[60%] bg-[#040406] h-full ease-in-out duration-500 slide-bar"
            : "fixed left-[-100%] slide-bar top-15 h-full"
        }
      >
        <ul className="uppercase p-4">
          {[
            { href: "/", label: "Home" },
            { href: "/licensing", label: "Licensing" },
            { href: "/blog", label: "Guide" },
            { href: "/service", label: "Service" },
            { href: "/workspace", label: "Workspace" },
            { href: "/visa", label: "Visa" },
            { href: "/contact", label: "Contact" },
          ].map((item) => (
            <li
              key={item.href}
              className={`text-white border-b border-gray-100 p-3 cursor-pointer group hover:bg-[#0F0F1A] ${
                pathname === item.href ? "activeHead" : ""
              }`}
            >
              <Link href={item.href}>
                <p className="transform group-hover:translate-x-2 transition-transform ease-in duration-200 text-sm font-semibold">
                  {item.label}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
};

export default Header;
