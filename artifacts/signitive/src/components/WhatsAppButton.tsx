import { MessageCircle } from "lucide-react";

const WA_NUMBER = "923114661392";
const WA_BASE = `https://wa.me/${WA_NUMBER}`;

export function WhatsAppButton() {
  return (
    <a
      href={WA_BASE}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 group flex items-center gap-2"
      aria-label="Chat on WhatsApp"
    >
      <span className="absolute right-full mr-3 whitespace-nowrap bg-black border border-white/10 text-white text-xs px-3 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
        Usually replies in 1 hour
      </span>
      <div className="relative w-14 h-14 flex items-center justify-center bg-[#25D366] shadow-lg shadow-[#25D366]/30 transition-transform duration-200 hover:scale-110">
        <div className="absolute inset-0 bg-[#25D366] animate-ping opacity-30 rounded-full" />
        <MessageCircle className="h-7 w-7 text-white fill-white relative z-10" />
      </div>
    </a>
  );
}

export function waLink(message: string) {
  return `${WA_BASE}?text=${encodeURIComponent(message)}`;
}
