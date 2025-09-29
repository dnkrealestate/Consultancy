import Image from 'next/image';
import React from 'react'
import MainlandImg from "@/public/assets/images/Mainland License.webp";
import FreeZoneImg from "@/public/assets/images/Free zone license.webp"; 
import OffshoreImg from "@/public/assets/images/offshore license.webp";

export default function ZoneExplore() {
  return (
    <div className="w-full flex items-center justify-center !bg-[#0B535F]">
      <div className="container max-w-[1240px] pb-5  px-4 md:py-9 relative">
        <h2 className="m-auto w-fit text-center">
          What opportunities do you want to explore?
        </h2>
        <p className="text-center m-auto w-[100%] md:w-[80%]">
          Lawman Consultants is your go-to partner for company formation in
          Dubai, UAE. Stay ahead with our expert business setup services,
          offering an unmatched experience among the top firms in Dubai.
        </p>

        <div className="grid grid-cols-3 gap-2 relative">
          <div className="max-w-[380px] overflow-hidden rounded-md relative">
            <Image
              src={MainlandImg}
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
              Mainland License
            </h3>
            <div className="w-full bg-gradient-to-b from-[rgba(0,0,0,0)] to-[rgba(0,0,0,0.8)] h-[100px] absolute bottom-0"></div>
          </div>

          <div className="max-w-[380px] overflow-hidden rounded-md relative">
            <Image
              src={FreeZoneImg}
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
              Free Zone License
            </h3>
            <div className="w-full bg-gradient-to-b from-[rgba(0,0,0,0)] to-[rgba(0,0,0,0.8)] h-[100px] absolute bottom-0"></div>
          </div>

          <div className="max-w-[380px] overflow-hidden rounded-md relative">
            <Image
              src={OffshoreImg}
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
              Offshore License
            </h3>
            <div className="w-full bg-gradient-to-b from-[rgba(0,0,0,0)] to-[rgba(0,0,0,0.8)] h-[100px] absolute bottom-0"></div>
          </div>
        </div>
      </div>
    </div>
  );
}