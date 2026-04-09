// src/layouts/MainLayout.jsx
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import CTAWhatsApp from "../components/CTAWhatsApp";
import CookieConsent from "../components/CookieConsent";


export default function MainLayout() {
  return (
    <div className="min-h-[100svh] lg:min-h-dvh flex flex-col bg-white text-zinc-900">
      <Navbar />

      {/* Gutter nas laterais; se o Home precisar full-bleed, remova aqui e trate por página */}
      <main >
        <Outlet />
      </main>

      <Footer />
      <CTAWhatsApp />
      <CookieConsent />
    </div>
  );
}
