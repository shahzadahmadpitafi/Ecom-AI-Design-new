import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { GoldGrid } from "@/components/ui/GoldGrid";
import { GoldDivider } from "@/components/ui/GoldDivider";
import { Mail, Phone, MapPin, ExternalLink, CheckCircle, Clock, MessageCircle } from "lucide-react";

const WA_NUMBER = "923114661392";
const waLink = (msg: string) =>
  `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;

export default function Contact() {
  const { toast } = useToast();
  const [name, setName]       = useState("");
  const [email, setEmail]     = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) {
      toast({ title: "Please fill in all required fields", variant: "destructive" });
      return;
    }
    setSubmitted(true);
    toast({ title: "Message sent!", description: "We'll respond within 1 hour on WhatsApp." });
  };

  return (
    <div className="min-h-screen" style={{ background: "#0a0a0a" }}>

      {/* ── Hero ── */}
      <div className="relative overflow-hidden py-16 border-b" style={{ borderColor: "rgba(167,139,250,0.15)" }}>
        <GoldGrid />
        <div className="container mx-auto px-4 relative">
          <p className="text-[10px] uppercase tracking-[0.25em] mb-3" style={{ color: "#a78bfa" }}>
            Get in Touch
          </p>
          <h1 className="font-display text-6xl md:text-7xl tracking-wider text-white mb-3">
            CONTACT <span style={{ color: "#C9A84C" }}>US</span>
          </h1>
          <p className="text-[#a0a0a0] text-lg max-w-xl">
            Ready to build your brand? We usually reply within 1 hour on WhatsApp.
          </p>
        </div>
      </div>

      {/* ── Main Split Layout ── */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

          {/* ── LEFT: WhatsApp primary (3/5 width) ── */}
          <div className="lg:col-span-3 space-y-6">

            {/* WhatsApp CTA Card */}
            <div
              className="relative overflow-hidden p-8"
              style={{
                background: "#111",
                border: "1px solid rgba(37,211,102,0.25)",
              }}
            >
              <div
                className="absolute top-0 left-0 right-0 h-px"
                style={{ background: "linear-gradient(90deg, transparent, #25d366, transparent)" }}
              />

              <div className="flex items-start gap-5">
                <div
                  className="w-16 h-16 flex items-center justify-center shrink-0"
                  style={{ background: "rgba(37,211,102,0.1)", border: "1px solid rgba(37,211,102,0.3)" }}
                >
                  <MessageCircle className="h-8 w-8" style={{ color: "#25d366" }} />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-[#a0a0a0] mb-1 flex items-center gap-2">
                    <span
                      className="w-2 h-2 rounded-full bg-[#25d366] animate-[pulse-dot_1.4s_ease-in-out_infinite]"
                    />
                    Usually replies in 1 hour
                  </p>
                  <h2 className="font-display text-4xl text-white tracking-wider mb-1">
                    Chat With Us
                  </h2>
                  <p className="font-display text-3xl tracking-wider" style={{ color: "#25d366" }}>
                    +92 311 4661392
                  </p>
                  <p className="text-[#a0a0a0] text-sm mt-2">Mon–Sat · 9am–6pm PKT</p>
                </div>
              </div>

              <a
                href={waLink("Hi Signitive! I'd like to discuss a custom apparel order.")}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 w-full flex items-center justify-center gap-2 h-14 font-display text-xl tracking-widest uppercase transition-all hover:opacity-90"
                style={{ background: "#25d366", color: "#000", fontWeight: 700 }}
                data-testid="link-whatsapp-contact"
              >
                <MessageCircle className="h-5 w-5" />
                Open WhatsApp Now
              </a>
            </div>

            {/* Address + Info cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 space-y-1" style={{ background: "#111", border: "1px solid rgba(167,139,250,0.15)" }}>
                <div className="flex items-center gap-2 text-[#a78bfa] mb-3">
                  <MapPin className="h-4 w-4" />
                  <span className="text-[10px] uppercase tracking-widest">Address</span>
                </div>
                <p className="text-white text-sm leading-relaxed">
                  Street No. 02, Gulshan Toheed Town,<br />
                  Defence Road, Sialkot,<br />
                  Punjab, Pakistan
                </p>
              </div>

              <div className="p-5 space-y-1" style={{ background: "#111", border: "1px solid rgba(167,139,250,0.15)" }}>
                <div className="flex items-center gap-2 text-[#a78bfa] mb-3">
                  <Clock className="h-4 w-4" />
                  <span className="text-[10px] uppercase tracking-widest">Business Hours</span>
                </div>
                <p className="text-white text-sm leading-relaxed">
                  Mon–Sat: 9:00 AM – 6:00 PM PKT<br />
                  Sunday: Closed<br />
                  <span className="text-[#C9A84C]">WhatsApp 24/7 ↗</span>
                </p>
              </div>

              <div className="p-5" style={{ background: "#111", border: "1px solid rgba(167,139,250,0.15)" }}>
                <div className="flex items-center gap-2 text-[#a78bfa] mb-3">
                  <Mail className="h-4 w-4" />
                  <span className="text-[10px] uppercase tracking-widest">Email</span>
                </div>
                <a
                  href="mailto:info@signitiveenterprises.com"
                  className="text-white text-sm hover:text-[#C9A84C] transition-colors"
                  data-testid="link-email"
                >
                  info@signitiveenterprises.com
                </a>
              </div>

              <div className="p-5" style={{ background: "#111", border: "1px solid rgba(167,139,250,0.15)" }}>
                <div className="flex items-center gap-2 text-[#a78bfa] mb-3">
                  <Phone className="h-4 w-4" />
                  <span className="text-[10px] uppercase tracking-widest">Phone / WhatsApp</span>
                </div>
                <a
                  href="https://wa.me/923114661392"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white text-sm hover:text-[#25d366] transition-colors"
                  data-testid="link-phone"
                >
                  +92 311 4661392
                </a>
              </div>
            </div>

            {/* Alibaba TrustPass */}
            <a
              href="https://signitiveenterprises.trustpass.alibaba.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 transition-all group"
              style={{ border: "1px solid rgba(255,106,0,0.3)", background: "rgba(255,106,0,0.03)" }}
              data-testid="link-alibaba"
            >
              <div className="flex items-center gap-3">
                <span className="font-display text-2xl tracking-wider" style={{ color: "#FF6A00" }}>ALI</span>
                <div>
                  <p className="text-white text-sm font-bold">Alibaba TrustPass Verified</p>
                  <p className="text-[#a0a0a0] text-xs">signitiveenterprises.trustpass.alibaba.com</p>
                </div>
              </div>
              <ExternalLink className="h-4 w-4 text-[#FF6A00]" />
            </a>
          </div>

          {/* ── RIGHT: Email form (2/5 width) ── */}
          <div
            className="lg:col-span-2 p-6 h-fit"
            style={{ background: "#111", border: "1px solid rgba(167,139,250,0.2)" }}
          >
            {submitted ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div
                  className="w-14 h-14 flex items-center justify-center mb-5"
                  style={{ background: "rgba(167,139,250,0.1)", border: "1px solid rgba(167,139,250,0.3)" }}
                >
                  <CheckCircle className="h-7 w-7" style={{ color: "#a78bfa" }} />
                </div>
                <h3 className="font-display text-2xl text-white tracking-wider mb-2">Sent!</h3>
                <p className="text-[#a0a0a0] text-sm">
                  Thanks <strong className="text-white">{name}</strong>.<br />
                  We'll reply to <span style={{ color: "#C9A84C" }}>{email}</span> within 1 hour.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <GoldDivider label="Send a Message" />

                <div>
                  <Label className="text-[10px] uppercase tracking-widest text-[#a0a0a0] mb-1 block">Name *</Label>
                  <Input
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="John Smith"
                    className="bg-[#0a0a0a] text-sm"
                    style={{ border: "1px solid rgba(167,139,250,0.2)" }}
                    required
                    data-testid="input-contact-name"
                  />
                </div>

                <div>
                  <Label className="text-[10px] uppercase tracking-widest text-[#a0a0a0] mb-1 block">Email *</Label>
                  <Input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="john@brand.com"
                    className="bg-[#0a0a0a] text-sm"
                    style={{ border: "1px solid rgba(167,139,250,0.2)" }}
                    required
                    data-testid="input-contact-email"
                  />
                </div>

                <div>
                  <Label className="text-[10px] uppercase tracking-widest text-[#a0a0a0] mb-1 block">Subject</Label>
                  <Input
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    placeholder="Custom hoodies, bulk order..."
                    className="bg-[#0a0a0a] text-sm"
                    style={{ border: "1px solid rgba(167,139,250,0.2)" }}
                    data-testid="input-contact-subject"
                  />
                </div>

                <div>
                  <Label className="text-[10px] uppercase tracking-widest text-[#a0a0a0] mb-1 block">Message *</Label>
                  <Textarea
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    placeholder="Tell us about your project — product type, quantity, customization, delivery timeline..."
                    className="bg-[#0a0a0a] text-sm resize-none"
                    style={{ border: "1px solid rgba(167,139,250,0.2)" }}
                    rows={5}
                    required
                    data-testid="textarea-contact-message"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full h-12 font-display text-base tracking-widest uppercase relative overflow-hidden group transition-all"
                  style={{ background: "#C9A84C", color: "#0a0a0a", fontWeight: 700 }}
                  data-testid="button-submit-contact"
                >
                  <span
                    className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none"
                    style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)" }}
                  />
                  <span className="relative">Send Message</span>
                </button>

                <p className="text-xs text-[#555] text-center">
                  For urgent orders →{" "}
                  <a
                    href={waLink("Hi Signitive! Urgent order inquiry.")}
                    className="hover:underline"
                    style={{ color: "#25d366" }}
                  >
                    WhatsApp us directly
                  </a>
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
