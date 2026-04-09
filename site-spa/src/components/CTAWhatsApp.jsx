import { MessageCircle } from "lucide-react";

const phone = import.meta.env.VITE_WHATSAPP_PHONE;
const msg = encodeURIComponent(import.meta.env.VITE_WHATSAPP_MSG || "Olá");

export default function CTAWhatsApp() {
  const url = `https://wa.me/${phone}?text=${msg}`;
  return (
    <a href={url} target="_blank" rel="noreferrer"
       className="fixed bottom-4 right-4 z-50 inline-flex items-center gap-2 rounded-full bg-emerald-500 px-5 py-3 font-semibold text-white shadow-lg hover:bg-emerald-600">
      <MessageCircle className="size-5" /> WhatsApp
    </a>
  );
}
