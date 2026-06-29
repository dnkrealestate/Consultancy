import { getSeo, buildMetadata } from '@/lib/seo';
import JsonLd from '@/components/JsonLd';

const PAGE_PATH = '/visa-services';

export async function generateMetadata() {
  return buildMetadata(await getSeo(PAGE_PATH), PAGE_PATH);
}

export default async function SeoLayout({ children }) {
  const seo = await getSeo(PAGE_PATH);
  let custom = null;
  if (seo?.jsonLd) {
    try { custom = JSON.parse(seo.jsonLd); } catch { custom = null; }
  }
  return (
    <>
      {custom && <JsonLd data={custom} />}
      {children}
    </>
  );
}
