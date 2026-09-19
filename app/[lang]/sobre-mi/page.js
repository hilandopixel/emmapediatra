import ContentPageTemplate from "@/components/ContentPageTemplate";
import staticDocs from "./data.json";

export default async function Page({ params }) {
  return <ContentPageTemplate pageId={"sobreMi"} staticDocs={staticDocs} params={params} />;
}