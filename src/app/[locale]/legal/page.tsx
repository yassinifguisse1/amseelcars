import { createLegalPage } from "@/components/Legal/createLegalPage";

const { generateMetadata, Page } = createLegalPage({
  href: "/legal",
  documentNamespace: "legalNotice",
  seoKey: "legal",
  footerKey: "legal",
  scriptId: "ld-json-breadcrumb-legal",
});

export { generateMetadata };
export default Page;
