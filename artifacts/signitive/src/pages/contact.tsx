import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useGetCatalogSummary } from "@workspace/api-client-react";
import { Mail, Phone, MapPin, ExternalLink, CheckCircle } from "lucide-react";

export default function Contact() {
  const { toast } = useToast();
  const { data: summary } = useGetCatalogSummary({
    query: { queryKey: ["catalogSummary"] }
  });

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) {
      toast({ title: "Please fill in all required fields", variant: "destructive" });
      return;
    }
    setSubmitted(true);
    toast({ title: "Message sent!", description: "We'll get back to you within 24 hours." });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/30 py-12">
        <div className="container mx-auto px-4">
          <h1 className="font-display text-5xl md:text-6xl font-bold tracking-wider text-white uppercase mb-3">
            Get in <span className="text-primary">Touch</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl">
            Ready to build your brand? Let's talk about your project, get a sample, or discuss custom pricing.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Left: About + Contact Info */}
          <div className="space-y-10">
            <div>
              <h2 className="font-display text-3xl uppercase tracking-widest text-white mb-5">About <span className="text-primary">Signitive</span></h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Signitive Enterprises is a premium custom apparel manufacturer based in Sialkot, Pakistan — the world's sporting goods capital. We've been producing high-quality garments for global brands for over a decade.
                </p>
                <p>
                  Our facility specializes in streetwear, sports uniforms, fitness wear, and headwear, with capabilities in screen printing, DTG printing, embroidery, sublimation, and specialty finishes.
                </p>
                <p>
                  We work with emerging brands, established labels, sports clubs, and corporate clients — from minimum orders of 12 pieces to bulk orders of tens of thousands. Global shipping to 35+ countries.
                </p>
              </div>
            </div>

            {/* Stats */}
            {summary && (
              <div className="grid grid-cols-2 gap-4">
                <div className="border border-border bg-card/30 p-5 text-center">
                  <p className="font-display text-4xl text-primary">{summary.totalProducts}+</p>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground mt-1">Products</p>
                </div>
                <div className="border border-border bg-card/30 p-5 text-center">
                  <p className="font-display text-4xl text-primary">{summary.countriesServed}+</p>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground mt-1">Countries Served</p>
                </div>
              </div>
            )}

            {/* Contact Details */}
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 border border-border bg-card/30">
                <Mail className="h-5 w-5 text-primary shrink-0" />
                <div>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground mb-0.5">Email</p>
                  <a href="mailto:info@signitiveenterprises.com" className="text-white hover:text-primary transition-colors" data-testid="link-email">
                    info@signitiveenterprises.com
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 border border-border bg-card/30">
                <Phone className="h-5 w-5 text-primary shrink-0" />
                <div>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground mb-0.5">WhatsApp / Phone</p>
                  <a href="https://wa.me/923114661392" target="_blank" rel="noopener noreferrer" className="text-white hover:text-primary transition-colors" data-testid="link-phone">
                    +92 311 4661392
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 border border-border bg-card/30">
                <MapPin className="h-5 w-5 text-primary shrink-0" />
                <div>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground mb-0.5">Location</p>
                  <p className="text-white">Sialkot, Punjab, Pakistan</p>
                </div>
              </div>
            </div>

            {/* Alibaba + WhatsApp CTAs */}
            <div className="space-y-3">
              <a
                href="https://wa.me/923114661392"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-4 bg-green-600 hover:bg-green-700 text-white font-bold uppercase tracking-wider transition-colors"
                data-testid="link-whatsapp-contact"
              >
                <span>Chat on WhatsApp</span>
                <ExternalLink className="h-5 w-5" />
              </a>
              <a
                href="https://signitiveenterprises.trustpass.alibaba.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-4 border border-primary text-primary hover:bg-primary/10 font-bold uppercase tracking-wider transition-colors"
                data-testid="link-alibaba"
              >
                <span>View Alibaba Store — Verified Supplier</span>
                <ExternalLink className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Right: Contact Form */}
          <div className="border border-border bg-card/30 p-8">
            {submitted ? (
              <div className="flex flex-col items-center justify-center h-full py-12 text-center">
                <div className="w-16 h-16 bg-primary/10 border border-primary flex items-center justify-center mb-6">
                  <CheckCircle className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-display text-3xl uppercase tracking-wider text-white mb-3">Message Sent!</h3>
                <p className="text-muted-foreground">Thanks, <strong className="text-white">{name}</strong>. We'll respond to <strong className="text-primary">{email}</strong> within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <h2 className="font-display text-2xl uppercase tracking-widest text-white mb-6">Send a Message</h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs uppercase tracking-widest text-muted-foreground">Full Name *</Label>
                    <Input
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="John Smith"
                      className="mt-1 bg-background border-border"
                      required
                      data-testid="input-contact-name"
                    />
                  </div>
                  <div>
                    <Label className="text-xs uppercase tracking-widest text-muted-foreground">Email *</Label>
                    <Input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="john@brand.com"
                      className="mt-1 bg-background border-border"
                      required
                      data-testid="input-contact-email"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-xs uppercase tracking-widest text-muted-foreground">Company / Brand</Label>
                  <Input
                    value={company}
                    onChange={e => setCompany(e.target.value)}
                    placeholder="Your Brand Name"
                    className="mt-1 bg-background border-border"
                    data-testid="input-contact-company"
                  />
                </div>

                <div>
                  <Label className="text-xs uppercase tracking-widest text-muted-foreground">Message *</Label>
                  <Textarea
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    placeholder="Tell us about your project — product type, quantity, customization needs, delivery timeline..."
                    className="mt-1 bg-background border-border resize-none"
                    rows={6}
                    required
                    data-testid="textarea-contact-message"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-display text-xl tracking-widest uppercase h-14"
                  data-testid="button-submit-contact"
                >
                  Send Message
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  For urgent inquiries, reach us directly on{" "}
                  <a href="https://wa.me/923114661392" className="text-primary hover:underline">WhatsApp</a>.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
