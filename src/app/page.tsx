import { LoadingProvider } from "@/contexts/LoadingContext";
import { HomeContentLandingPage } from "./HomeContentLandingPage";


// import Brands from "@/components/Brands/Brands";
// import BMWCarScroll from "@/components/CarsMoving/BMWCar";
// import Cardrive from "@/components/scroll-video/scroll-video";
// import SplitHeadline from "@/components/test/SplitHeadline";


export default function Home() {
  return (
    <LoadingProvider>
      <HomeContentLandingPage />
    </LoadingProvider>
   
  );
}
