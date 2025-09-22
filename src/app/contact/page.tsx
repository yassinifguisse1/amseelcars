
import { LoadingProvider } from "@/contexts/LoadingContext";
import { HomeContent } from "./HomeContent";

export default function Home() {
  return (
    <LoadingProvider>
      <HomeContent />
    </LoadingProvider>
  );
}