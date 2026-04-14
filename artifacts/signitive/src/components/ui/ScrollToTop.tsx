import { useEffect, useState } from "react";
import { ChevronUp } from "lucide-react";

export function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Back to top"
      className="fixed bottom-24 left-4 z-50 w-10 h-10 flex items-center justify-center transition-all hover:scale-110"
      style={{
        background: "#0a0a0a",
        border: "1px solid rgba(201,168,76,0.5)",
        color: "#C9A84C",
      }}
    >
      <ChevronUp className="h-4 w-4" />
    </button>
  );
}
