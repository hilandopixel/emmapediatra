import ContentPageTemplate, { generatePageMetadata } from "@/components/ContentPageTemplate";
import staticDocs from "./data.json";

const PAGE_ID = "areaPrivada";

export async function generateMetadata({ params }) {
  return generatePageMetadata(PAGE_ID, staticDocs, params);
}

export default async function Page({ params }) {
  return <ContentPageTemplate pageId={PAGE_ID} staticDocs={staticDocs} params={params} />;
}