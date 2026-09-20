# 🚗 Amseel Cars - Premium Car Rental Platform

A modern, responsive car rental website built with Next.js 15, featuring an elegant design and seamless user experience for renting premium vehicles in Agadir, Morocco.

## 🌟 Features

### 🎨 **Modern Design**
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Custom Color Scheme**: Beautiful `#CB1939` red gradient theme
- **Smooth Animations**: GSAP-powered animations and transitions
- **Interactive Elements**: Hover effects, parallax scrolling, and dynamic components

### 🚙 **Car Showcase**
- **Premium Vehicle Gallery**: High-quality images with lazy loading
- **Interactive Car Details**: Clickable thumbnails and detailed specifications
- **Brand Showcase**: Featured car brands with smooth animations
- **Performance Metrics**: Dynamic performance indicators and statistics

### 🗺️ **Location & Contact**
- **Google Maps Integration**: Interactive map showing Amseel Cars location
- **Contact Information**: Multiple contact methods (WhatsApp, Email, Phone)
- **Business Hours**: Clear operating hours and availability
- **Address Details**: Complete location information in Agadir, Morocco

### 📱 **User Experience**
- **Fast Loading**: Optimized images and performance
- **Smooth Scrolling**: Lenis-powered smooth scrolling experience
- **Booking System**: Integrated booking dialog for car reservations
- **Contact Forms**: Professional contact and inquiry forms

## 🛠️ **Tech Stack**

- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS with custom components
- **Animations**: GSAP (GreenSock Animation Platform)
- **Smooth Scrolling**: Lenis
- **Maps**: Google Maps API with React integration
- **Icons**: Lucide React
- **TypeScript**: Full type safety
- **Performance**: Next.js Image optimization and lazy loading

## 🚀 **Getting Started**

### Prerequisites
- Node.js 18+ 
- npm, yarn, pnpm, or bun
- Google Maps API key (for map functionality)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd rental-cars
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```bash
   # Google Maps API Key
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000) to see the application.

## 📁 **Project Structure**

```
src/
├── app/                    # Next.js App Router pages
│   ├── contact/           # Contact page
│   ├── cars/              # Car detail pages
│   └── api/               # API routes
├── components/            # React components
│   ├── Cars/              # Car-related components
│   ├── Contact/           # Contact page components
│   ├── Brands/            # Brand showcase
│   └── ui/                # Reusable UI components
├── data/                  # Static data files
│   ├── cars.ts           # Car inventory data
│   └── brands.ts         # Brand information
├── lib/                   # Utility functions
└── types/                 # TypeScript type definitions
```

## 🎨 **Customization**

### Color Scheme
The project uses a custom red color scheme (`#CB1939`). To modify colors:

1. Update gradient classes in components
2. Modify CSS custom properties
3. Update Tailwind configuration if needed

### Content Management
- **Car Data**: Edit `src/data/cars.ts` to update vehicle inventory
- **Brand Information**: Modify `src/data/brands.ts` for brand details
- **Contact Info**: Update contact details in `src/components/Contact/ContactInfo.tsx`

## 🗺️ **Google Maps Setup**

1. **Get API Key**: Visit [Google Cloud Console](https://console.cloud.google.com/)
2. **Enable APIs**: Enable "Maps JavaScript API"
3. **Create Credentials**: Generate an API key
4. **Add to Environment**: Add your key to `.env.local`
5. **Restrict Key**: (Recommended) Restrict the key to your domain

## 📱 **Responsive Design**

The application is fully responsive with breakpoints:
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px  
- **Desktop**: > 1024px

## 🚀 **Deployment**

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### Other Platforms
The app can be deployed to any platform that supports Next.js:
- Netlify
- AWS Amplify
- Railway
- DigitalOcean App Platform

## 📞 **Contact Information**

**Amseel Cars**
- 📍 **Address**: Haut founty rdc imm sinwan, Agadir 80000, Morocco
- 📱 **WhatsApp**: +212 662 500 181
- 📧 **Email**: amseelcars5@gmail.com
- 🌐 **Website**: [Your Website URL]

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 **Acknowledgments**

- Built with ❤️ for Amseel Cars
- Powered by Next.js and modern web technologies
- Special thanks to the open-source community

---

**Ready to drive your dream car?** 🚗✨

Visit our website or contact us to book your premium rental vehicle today!