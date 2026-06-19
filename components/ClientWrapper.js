'use client';

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import Footer from './Footer';

export default function ClientWrapper({ children }) {
  const pathname = usePathname();
  const isSchedule = pathname?.startsWith("/schedule");
  const isAdmin = pathname?.startsWith("/admin");

  return (
    <>
      {!isSchedule && !isAdmin && <Navbar />}
      <main className="flex-grow">
        {children}
      </main>
      {!isSchedule && !isAdmin && <Footer />}
    </>
  );
}