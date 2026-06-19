import React from 'react'
import loadingRound from "@/public/assets/icons/loadinground.webp";
import magazine from "@/public/assets/icons/magazine.webp";
import licence from "@/public/assets/icons/licence.webp";
import visaIc from "@/public/assets/icons/visa-ic.webp";
import bankIc from "@/public/assets/icons/bank-ic.webp";
import Image from 'next/image';

export default function Process() {
  return (
     <div className="w-full flex items-center justify-center !bg-[#0B535F]">
      <div className="container max-w-[1240px] pb-5  px-4 py-5 md:py-9 relative">
        <h2 className="m-auto w-fit text-center">
          The process of business setup in Dubai
        </h2>
        <p className="text-center m-auto w-[100%] md:w-[80%] ">
            Considering your business segment is crucial during the license  registration process in Dubai. With Kiltons' expert team boasting years  of experience, we ensure precise selection from the comprehensive  category list.
        </p>
        <div className="grid  grid-cols-2 gap-2 md:gap-5 relative">
          
          <div className=" border border-[#ffff] rounded-[10px] shadow bg-[#ffffff1d] group  p-4">
            <div className="relative">
              <div className="w-[100%]">
                <div className="w-fit m-auto border border-[#ffff] rounded-[50px] p-[5px] ">
                  <div className="relative p-4 w-[65px] h-[65px]">
                    <Image
                      src={loadingRound}
                      alt="Apartments for sales in dubai marina, Villa, offplan"
                      className="absolute left-0 top-0 animate-spin w-full"
                      width={80}
                      height={80}
                      quality={80}
                      loading="lazy"
                    />
                    <Image
                      src={magazine}
                      alt="Apartments for sales in downtown dubai, house, home, living"
                      className=""
                      width={80}
                      loading="lazy"
                      height={80}
                      quality={80}
                    />
                  </div>
                </div>
              </div>
              <div className="pt-4">
                <h3 className="mb-2 font-bold  text-white m-auto w-fit">
                 Prepare Documentation
                </h3>
                <div className="relative">
                  <p className="m-0 font-light !text-[0.7rem] md:!text-[0.9rem] text-gray-400 text-center">
                    If you’re an overseas entrepreneur starting up in a new country for the  first time, the documentation process can be daunting. We help you to  make the right decisions for your Dubai company and handle all of the  complex paperwork.
                  </p>
                </div>
              </div>
            </div>
          </div>

           <div className=" border border-[#ffff] rounded-[10px] shadow bg-[#ffffff1d] group  p-4">
            <div className="relative">
              <div className="w-[100%]">
                <div className="w-fit m-auto border border-[#ffff] rounded-[50px] p-[5px] ">
                  <div className="relative p-4 w-[65px] h-[65px]">
                    <Image
                      src={loadingRound}
                      alt="Apartments for sales in dubai marina, Villa, offplan"
                      className="absolute left-0 top-0 animate-spin w-full"
                      width={80}
                      height={80}
                      quality={80}
                      loading="lazy"
                    />
                    <Image
                      src={licence}
                      alt="Apartments for sales in downtown dubai, house, home, living"
                      className=""
                      width={80}
                      loading="lazy"
                      height={80}
                      quality={80}
                    />
                  </div>
                </div>
              </div>
              <div className="pt-4">
                <h3 className="mb-2 font-bold  text-white m-auto w-fit">
                 Business License
                </h3>
                <div className="relative">
                  <p className="m-0 font-light !text-[0.7rem] md:!text-[0.9rem] text-gray-400 text-center">
                    Choosing the right license and meeting requirements are key to starting a business in Dubai. A company formation expert can help you avoid pitfalls and secure necessary approvals.
                  </p>
                </div>
              </div>
            </div>
          </div>

           <div className=" border border-[#ffff] rounded-[10px] shadow bg-[#ffffff1d] group p-4">
            <div className="relative">
              <div className="w-[100%]">
                <div className="w-fit m-auto border border-[#ffff] rounded-[50px] p-[5px] ">
                  <div className="relative p-4 w-[65px] h-[65px]">
                    <Image
                      src={loadingRound}
                      alt="Apartments for sales in dubai marina, Villa, offplan"
                      className="absolute left-0 top-0 animate-spin w-full"
                      width={80}
                      height={80}
                      quality={80}
                      loading="lazy"
                    />
                    <Image
                      src={visaIc}
                      alt="Apartments for sales in downtown dubai, house, home, living"
                      className=""
                      width={80}
                      loading="lazy"
                      height={80}
                      quality={80}
                    />
                  </div>
                </div>
              </div>
              <div className="pt-4">
                <h3 className="mb-2 font-bold  text-white m-auto w-fit">
                 Visa Process
                </h3>
                <div className="relative">
                  <p className="m-0 font-light !text-[0.7rem] md:!text-[0.9rem] text-gray-400 text-center">
                    Private companies can obtain new employment entry permits for their  employees provided they apply for residence visa status within 30 days  of the employee’s entry into the UAE.
                  </p>
                </div>
              </div>
            </div>
          </div>

           <div className=" border border-[#ffff] rounded-[10px] shadow bg-[#ffffff1d] group  p-4">
            <div className="relative">
              <div className="w-[100%]">
                <div className="w-fit m-auto border border-[#ffff] rounded-[50px] p-[5px] ">
                  <div className="relative p-4 w-[65px] h-[65px]">
                    <Image
                      src={loadingRound}
                      alt="Apartments for sales in dubai marina, Villa, offplan"
                      className="absolute left-0 top-0 animate-spin w-full"
                      width={80}
                      height={80}
                      quality={80}
                      loading="lazy"
                    />
                    <Image
                      src={bankIc}
                      alt="Apartments for sales in downtown dubai, house, home, living"
                      className=""
                      width={80}
                      loading="lazy"
                      height={80}
                      quality={80}
                    />
                  </div>
                </div>
              </div>
              <div className="pt-4">
                <h3 className="mb-2 font-bold  text-white m-auto w-fit">
                 Bank Account
                </h3>
                <div className="relative">
                  <p className="m-0 font-light !text-[0.7rem] md:!text-[0.9rem] text-gray-400 text-center">
                    Setting up a corporate bank account in the UAE can be a little arduous for international entrepreneurs. It requires careful consideration and there are several boxes to tick to  ensure you have everything in place before approaching your bank of  choice.
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
        </div>
     </div>
  )
}