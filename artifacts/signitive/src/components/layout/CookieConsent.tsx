import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

export function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      setShow(true);
    }
  }, []);

  const accept = () => {
    localStorage.setItem("cookie-consent", "true");
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur border-t border-border p-4 shadow-xl">
      <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground text-center sm:text-left">
          We use cookies to enhance your experience and analyze site traffic. By continuing to use our platform, you agree to our privacy policy.
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShow(false)} className="uppercase font-display tracking-wider">
            Decline
          </Button>
          <Button size="sm" onClick={accept} className="bg-primary text-primary-foreground hover:bg-primary/90 uppercase font-display tracking-wider">
            Accept
          </Button>
        </div>
      </div>
    </div>
  );
}
