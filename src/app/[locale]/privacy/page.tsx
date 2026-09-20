import { createLegalPage } from "@/components/Legal/createLegalPage";

const { generateMetadata, Page } = createLegalPage({
  href: "/privacy",
  documentNamespace: "privacy",
  seoKey: "privacy",
  footerKey: "privacy",
  scriptId: "ld-json-breadcrumb-privacy",
});

export { generateMetadata };
export default Page;
