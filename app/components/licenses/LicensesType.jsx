import React from 'react'
import ProfessionalImg from "@/public/assets/images/ProfessionalImg.webp";
import CommercialImg from "@/public/assets/images/CommercialImg.webp";
import IndustrialImg from "@/public/assets/images/IndustrialImg.webp";
import ETraderImg from "@/public/assets/images/E-TraderImg.webp";
import Image from 'next/image';

export default function LicensesType() {
  return (
    <div className="w-full flex items-center justify-center !bg-[#0B535F]">
      <div className="container max-w-[1240px] pb-5  px-4 md:py-9 relative">
        <h2 className="m-auto w-fit text-center">
          Types of Licenses
        </h2>
        <p className="text-center m-auto w-[100%] md:w-[80%] ">
            The first step to starting a business in Dubai is understanding your license type. Let’s get started!
        </p>
        <div className="grid  grid-cols-2 md:grid-cols-4  gap-2 relative">
          <div className="group max-w-[380px]   overflow-hidden rounded-md relative">
            <div className="site-card absolute inset-0 pointer-events-none"></div>
            <Image
                          src={ProfessionalImg}
                          alt="Description"
                          width={380}
                          height={280}
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 33vw"
                          quality={75}
                          formats={["image/webp"]}
                          style={{
                            objectFit: "cover",
                            display: "block",
                          }}
                        />
                        <h3 className="text-center absolute bottom-0 text-[0.9rem] md:text-[1.2rem] m-auto w-full mb-2 md:mb-5 text-[#fff] z-10 font-semibold">
                          Professional License
                        </h3>
                        <div className="w-full bg-gradient-to-b from-[rgba(0,0,0,0)] to-[rgba(0,0,0,0.8)] h-[100px] absolute bottom-0"></div>
          </div>

          <div className="group max-w-[380px]  overflow-hidden rounded-md relative">
            <div className="site-card absolute inset-0 pointer-events-none"></div>
            <Image
                          src={CommercialImg}
                          alt="Description"
                          width={380}
                          height={280}
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 33vw"
                          quality={75}
                          formats={["image/webp"]}
                          style={{
                            objectFit: "cover",
                            display: "block",
                          }}
                        />
                        <h3 className="text-center absolute bottom-0 text-[0.9rem] md:text-[1.2rem] m-auto w-full mb-2 md:mb-5 text-[#fff] z-10 font-semibold">
                          Commercial License
                        </h3>
                        <div className="w-full bg-gradient-to-b from-[rgba(0,0,0,0)] to-[rgba(0,0,0,0.8)] h-[100px] absolute bottom-0"></div>
          </div>
          
          <div className="group max-w-[380px] overflow-hidden rounded-md relative">
            <div className="site-card absolute inset-0 pointer-events-none"></div>
            <Image
                          src={IndustrialImg}
                          alt="Description"
                          width={380}
                          height={280}
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 33vw"
                          quality={75}
                          formats={["image/webp"]}
                          style={{
                            objectFit: "cover",
                            display: "block",
                          }}
                        />
                        <h3 className="text-center absolute bottom-0 text-[0.9rem] md:text-[1.2rem] m-auto w-full mb-2 md:mb-5 text-[#fff] z-10 font-semibold">
                          Industrial License
                        </h3>
                        <div className="w-full bg-gradient-to-b from-[rgba(0,0,0,0)] to-[rgba(0,0,0,0.8)] h-[100px] absolute bottom-0"></div>
          </div>
          <div className="group max-w-[380px] overflow-hidden rounded-md relative">
            <div className="site-card absolute inset-0 pointer-events-none"></div>
            <Image
                          src={ETraderImg}
                          alt="Description"
                          width={380}
                          height={280}
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 33vw"
                          quality={75}
                          formats={["image/webp"]}
                          style={{
                            objectFit: "cover",
                            display: "block",
                          }}
                        />
                        <h3 className="text-center absolute bottom-0 text-[0.9rem] md:text-[1.2rem] m-auto w-full mb-2 md:mb-5 text-[#fff] z-10 font-semibold">
                          E-Trader License
                        </h3>
                        <div className="w-full bg-gradient-to-b from-[rgba(0,0,0,0)] to-[rgba(0,0,0,0.8)] h-[100px] absolute bottom-0"></div>
          </div>
          </div>
        </div>
    </div>
  )
}