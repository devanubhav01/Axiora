import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SessionWrapper from "@/components/SessionWrapper";

const playfair = Playfair_Display({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800", "900"], variable: "--font-playfair" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata = {
  title: "Axiora — Portfolio & Resume Maker",
  description: "Create a stunning developer portfolio, generate your professional resume, and collaborate on shared projects with Axiora.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${playfair.variable} ${inter.variable} bg-white text-black font-sans`}>
        <SessionWrapper> 
          <Navbar />
          <div className="min-h-screen bg-white text-black">
            {children}
          </div>
          <Footer />
        </SessionWrapper>
      </body>
    </html>
  );
}