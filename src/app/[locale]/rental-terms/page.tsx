import { createLegalPage } from "@/components/Legal/createLegalPage";

const { generateMetadata, Page } = createLegalPage({
  href: "/rental-terms",
  documentNamespace: "rentalTerms",
  seoKey: "rentalTerms",
  footerKey: "rentalTerms",
  scriptId: "ld-json-breadcrumb-rental-terms",
});

export { generateMetadata };
export default Page;
