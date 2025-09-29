import Image from 'next/image';
import React from 'react'
import VatIcon from "@/public/assets/icons/vat.webp";
import BankIcon from "@/public/assets/icons/bank-ic.webp";
import PayrollIcon from "@/public/assets/icons/payroll-ic.webp";
import ServicesIcon from "@/public/assets/icons/services-ic.webp";
import VisaIcon from "@/public/assets/icons/visa-ic.webp";
import LawIcon from "@/public/assets/icons/law-ic.webp";
import LicenseIcon from "@/public/assets/icons/license-ic.webp";
import MoreIcon from "@/public/assets/icons/more-ic.webp";

export default function ServicesSection() {
  return (
    <div className="w-full flex items-center justify-center !bg-[#0B535F]">
      <div className="container max-w-[1240px] pb-5  px-4 md:py-9 relative">
        <h2 className="m-auto w-fit text-center">
          Are you currently a business owner?
        </h2>
        <p className="text-center m-auto w-[100%] md:w-[80%] ">
          Simplify and optimize your business operations with our all-inclusive
          suite of corporate services tailored to meet your needs.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative">
          <div className="bg-[rgba(255,255,255,0.2)] border border-white p-4 rounded shadow">
            <Image
              src={VatIcon}
              alt="Corporate Tax & VAT"
              width={50}
              height={50}
              className="object-cover m-auto mb-2"
            />
            <h3 className="font-bold m-auto text-center">
              Corporate Tax & VAT
            </h3>
            <p className="m-auto text-center !text-[0.8rem] !mb-0">
              Our expert guidance ensures full compliance with Corporate Tax and
              VAT requirements as mandated by the Federal Tax Authority (FTA).
            </p>
          </div>
          <div className="bg-[rgba(255,255,255,0.2)] border border-white p-4 rounded shadow">
            <Image
              src={BankIcon}
              alt="Corporate Tax & VAT"
              width={50}
              height={50}
              className="object-cover m-auto mb-2"
            />
            <h3 className="font-bold m-auto text-center">
              Bank Account Opening
            </h3>
            <p className="m-auto text-center !text-[0.8rem] !mb-0">
              Simplify the process of opening business or personal bank accounts
              with the UAE's most reliable and renowned banks.
            </p>
          </div>
          <div className="bg-[rgba(255,255,255,0.2)] border border-white p-4 rounded shadow">
            <Image
              src={PayrollIcon}
              alt="Corporate Tax & VAT"
              width={50}
              height={50}
              className="object-cover m-auto mb-2"
            />
            <h3 className="font-bold text-center">Accounting & Payroll</h3>
            <p className="text-center !text-[0.8rem] !mb-0">
              Our accountants manage your finances, offering bookkeeping,
              payroll, and audit services to reduce hiring costs.
            </p>
          </div>
          <div className="bg-[rgba(255,255,255,0.2)] border border-white p-4 rounded shadow">
            <Image
              src={ServicesIcon}
              alt="Corporate Tax & VAT"
              width={50}
              height={50}
              className="object-cover m-auto mb-2"
            />
            <h3 className="font-bold text-center">Compliance Services</h3>
            <p className="text-center !text-[0.8rem] !mb-0">
              Our experts navigate you through complex UAE regulations,
              including ESR reports and UBO filings.
            </p>
          </div>
          <div className="bg-[rgba(255,255,255,0.2)] border border-white p-4 rounded shadow">
            <Image
              src={VisaIcon}
              alt="Corporate Tax & VAT"
              width={50}
              height={50}
              className="object-cover m-auto mb-2"
            />
            <h3 className="font-bold text-center">Visa Service</h3>
            <p className="text-center !text-[0.8rem] !mb-0">
              Secure long-term residency with a UAE Golden Visa through our
              hassle-free application process.
            </p>
          </div>
          <div className="bg-[rgba(255,255,255,0.2)] border border-white p-4 rounded shadow">
            <Image
              src={LawIcon}
              alt="Corporate Tax & VAT"
              width={50}
              height={50}
              className="object-cover m-auto mb-2"
            />
            <h3 className="font-bold text-center">Legal Services</h3>
            <p className="text-center !text-[0.8rem] !mb-0">
              Our legal team advises on UAE laws for M&As, restructuring,
              financing, and disputes.
            </p>
          </div>
          <div className="bg-[rgba(255,255,255,0.2)] border border-white p-4 rounded shadow">
            <Image
              src={LicenseIcon}
              alt="Corporate Tax & VAT"
              width={50}
              height={50}
              className="object-cover m-auto mb-2"
            />
            <h3 className="font-bold text-center">Trade License</h3>
            <p className="text-center !text-[0.8rem] !mb-0">
              Our accountants manage your finances, offering bookkeeping,
              payroll, and audit services to reduce hiring costs.
            </p>
          </div>
          <div className="bg-[rgba(255,255,255,0.2)] border border-white p-4 rounded shadow">
            <Image
              src={MoreIcon}
              alt="Corporate Tax & VAT"
              width={50}
              height={50}
              className="object-cover m-auto mb-2"
            />
            <h3 className="font-bold text-center">Other Services</h3>
            <p className="text-center !text-[0.8rem] !mb-0">
              Explore more of our corporate services
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}