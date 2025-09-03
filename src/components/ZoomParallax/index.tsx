"use client"
import dynamic from 'next/dynamic';

// Dynamic import to prevent hydration issues
const ZoomParallaxClient = dynamic(() => import('./ZoomParallaxClient'), {
    ssr: false,
    loading: () => (
        <div className="h-[300vh] relative bg-black">
            <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden">
                <div className="relative">
                    <video
                        src="/video/centercar.mp4"
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-[280px] h-[200px] md:w-[450px] md:h-[320px] object-cover rounded-2xl"
                    />
                </div>
            </div>
        </div>
    )
});

export default function Index() {
    return <ZoomParallaxClient />
}