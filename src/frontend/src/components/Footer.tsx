import { Store } from "lucide-react";

const EXPLORE_LINKS = [
  "All Products",
  "Templates",
  "eBooks",
  "Software",
  "Courses",
];
const MARKETPLACE_LINKS = [
  "Sell Products",
  "Become a Creator",
  "Pricing",
  "Affiliate Program",
];
const RESOURCE_LINKS = ["Blog", "Documentation", "Help Center", "Newsletter"];
const LEGAL_LINKS = [
  "Privacy Policy",
  "Terms of Service",
  "Refund Policy",
  "Cookie Policy",
];

function FooterLinkList({ title, links }: { title: string; links: string[] }) {
  return (
    <div>
      <h4 className="font-semibold text-foreground text-sm mb-3">{title}</h4>
      <ul className="space-y-2">
        {links.map((link) => (
          <li key={link}>
            <button
              type="button"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors text-left"
            >
              {link}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Footer() {
  const year = new Date().getFullYear();
  const utmLink = `https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`;

  return (
    <footer className="bg-card border-t border-border mt-16">
      <div className="max-w-[1200px] mx-auto px-4 py-10">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-8">
          <div className="col-span-2 sm:col-span-3 lg:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <Store className="h-5 w-5 text-primary" />
              <span className="font-bold text-foreground">StackMarket</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              The premier marketplace for premium digital products. Templates,
              eBooks, software, and courses crafted by top creators.
            </p>
          </div>
          <FooterLinkList title="Explore" links={EXPLORE_LINKS} />
          <FooterLinkList title="Marketplace" links={MARKETPLACE_LINKS} />
          <FooterLinkList title="Resources" links={RESOURCE_LINKS} />
          <FooterLinkList title="Legal" links={LEGAL_LINKS} />
        </div>
      </div>
      <div className="border-t border-border">
        <div className="max-w-[1200px] mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground">
            © {year} StackMarket. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Built with ❤️ using{" "}
            <a
              href={utmLink}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
