import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowRight,
  BookOpen,
  ChevronRight,
  Code2,
  GraduationCap,
  Package,
  TrendingUp,
} from "lucide-react";
import { motion } from "motion/react";
import type { ProductDTO } from "../backend.d";
import ProductCard from "../components/ProductCard";
import {
  useGetAdminStats,
  useGetFeaturedProducts,
  useGetTopSellers,
  useIsAdmin,
} from "../hooks/useQueries";

type Page = "home" | "products" | "checkout" | "orders" | "admin";

const SAMPLE_PRODUCTS: ProductDTO[] = [
  {
    id: 1n,
    name: "React Dashboard Pro",
    priceInPaise: 299900n,
    description:
      "Complete admin dashboard with 50+ components and dark mode support",
    isActive: true,
    imageUrl: "/assets/generated/product-template.dim_400x250.jpg",
    isFeatured: true,
    category: "Templates",
    salesCount: 245n,
    fileUrl: undefined,
  },
  {
    id: 2n,
    name: "UI Design Masterclass",
    priceInPaise: 199900n,
    description:
      "Learn modern UI design with Figma from absolute beginner to advanced",
    isActive: true,
    imageUrl: "/assets/generated/product-course.dim_400x250.jpg",
    isFeatured: true,
    category: "Courses",
    salesCount: 189n,
    fileUrl: undefined,
  },
  {
    id: 3n,
    name: "Node.js API Builder",
    priceInPaise: 149900n,
    description:
      "Production-ready REST API boilerplate with auth and rate limiting",
    isActive: true,
    imageUrl: "/assets/generated/product-software.dim_400x250.jpg",
    isFeatured: true,
    category: "Software",
    salesCount: 312n,
    fileUrl: undefined,
  },
  {
    id: 4n,
    name: "The Startup Bible",
    priceInPaise: 99900n,
    description:
      "Everything you need to know to launch and grow your tech startup",
    isActive: true,
    imageUrl: "/assets/generated/product-ebook.dim_400x250.jpg",
    isFeatured: true,
    category: "eBooks",
    salesCount: 421n,
    fileUrl: undefined,
  },
  {
    id: 5n,
    name: "Next.js Commerce Kit",
    priceInPaise: 349900n,
    description:
      "Full-stack e-commerce template with Stripe and product management",
    isActive: true,
    imageUrl: "/assets/generated/product-template.dim_400x250.jpg",
    isFeatured: false,
    category: "Templates",
    salesCount: 156n,
    fileUrl: undefined,
  },
  {
    id: 6n,
    name: "Python for Data Science",
    priceInPaise: 179900n,
    description:
      "Comprehensive Python course with machine learning and real projects",
    isActive: true,
    imageUrl: "/assets/generated/product-course.dim_400x250.jpg",
    isFeatured: false,
    category: "Courses",
    salesCount: 287n,
    fileUrl: undefined,
  },
  {
    id: 7n,
    name: "Firebase SaaS Starter",
    priceInPaise: 249900n,
    description:
      "Launch your SaaS in days with auth, payments, and subscription management",
    isActive: true,
    imageUrl: "/assets/generated/product-software.dim_400x250.jpg",
    isFeatured: false,
    category: "Software",
    salesCount: 98n,
    fileUrl: undefined,
  },
  {
    id: 8n,
    name: "Freelancer's Handbook",
    priceInPaise: 79900n,
    description:
      "How to find clients, set rates, and build a sustainable freelance business",
    isActive: true,
    imageUrl: "/assets/generated/product-ebook.dim_400x250.jpg",
    isFeatured: false,
    category: "eBooks",
    salesCount: 534n,
    fileUrl: undefined,
  },
];

const CATEGORY_LINKS = [
  { key: "cat-templates", label: "Templates", Icon: Package },
  { key: "cat-ebooks", label: "eBooks", Icon: BookOpen },
  { key: "cat-software", label: "Software", Icon: Code2 },
  { key: "cat-courses", label: "Courses", Icon: GraduationCap },
];

const FEAT_SKELETONS = ["fs1", "fs2", "fs3", "fs4", "fs5", "fs6", "fs7", "fs8"];
const TOP_SKELETONS = ["ts1", "ts2", "ts3", "ts4"];

interface HomePageProps {
  onNavigate: (page: Page) => void;
}

function formatPrice(priceInPaise: bigint): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(priceInPaise) / 100);
}

export default function HomePage({ onNavigate }: HomePageProps) {
  const { data: featured, isLoading: featuredLoading } =
    useGetFeaturedProducts();
  const { data: topSellers, isLoading: topLoading } = useGetTopSellers();
  const { data: stats } = useGetAdminStats();
  const { data: isAdmin } = useIsAdmin();

  const displayProducts =
    featured && featured.length > 0 ? featured : SAMPLE_PRODUCTS.slice(0, 8);
  const displayTopSellers =
    topSellers && topSellers.length > 0
      ? topSellers
      : SAMPLE_PRODUCTS.slice(0, 4);

  return (
    <main className="max-w-[1200px] mx-auto px-4 py-6 space-y-10">
      {/* Hero Banner */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative rounded-2xl overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #0B1730 0%, #0F223B 100%)",
        }}
        data-ocid="home.section"
      >
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 p-8 md:p-12">
          <div className="flex-1 space-y-4">
            <Badge className="bg-teal text-white border-0 text-xs">
              New Arrivals Weekly
            </Badge>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight">
              Discover Premium
              <br />
              <span style={{ color: "#12B6C9" }}>Digital Products</span>
            </h1>
            <p className="text-blue-200 text-base md:text-lg max-w-md">
              Templates, eBooks, software tools, and online courses crafted by
              world-class creators. Instant download, lifetime access.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <Button
                size="lg"
                onClick={() => onNavigate("products")}
                className="bg-teal text-white hover:bg-teal-dark font-semibold"
                data-ocid="home.primary_button"
              >
                Explore Marketplace
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10 bg-transparent"
                data-ocid="home.secondary_button"
              >
                Learn More
              </Button>
            </div>
            <div className="flex items-center gap-6 pt-2">
              <div className="text-center">
                <p className="text-2xl font-bold text-white">500+</p>
                <p className="text-xs text-blue-300">Products</p>
              </div>
              <div className="w-px h-8 bg-white/20" />
              <div className="text-center">
                <p className="text-2xl font-bold text-white">10K+</p>
                <p className="text-xs text-blue-300">Customers</p>
              </div>
              <div className="w-px h-8 bg-white/20" />
              <div className="text-center">
                <p className="text-2xl font-bold text-white">4.9★</p>
                <p className="text-xs text-blue-300">Rating</p>
              </div>
            </div>
          </div>
          <div className="hidden md:block w-64 lg:w-80 shrink-0">
            <img
              src="/assets/generated/hero-illustration-transparent.dim_600x400.png"
              alt="Digital Products"
              className="w-full h-auto object-contain drop-shadow-2xl"
            />
          </div>
        </div>
        <div className="border-t border-white/10 px-8 py-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {CATEGORY_LINKS.map(({ key, label, Icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => onNavigate("products")}
                className="flex items-center gap-2 text-white/70 hover:text-white transition-colors group"
                data-ocid="home.link"
              >
                <Icon
                  className="h-4 w-4 group-hover:text-teal transition-colors"
                  style={{ color: "#12B6C9" }}
                />
                <span className="text-sm font-medium">{label}</span>
                <ChevronRight className="h-3 w-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Featured Products */}
      <section data-ocid="featured.section">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-foreground">
            Featured Products
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigate("products")}
            className="rounded-full text-xs"
            data-ocid="featured.link"
          >
            See all <ArrowRight className="h-3 w-3 ml-1" />
          </Button>
        </div>
        {featuredLoading ? (
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
            data-ocid="featured.loading_state"
          >
            {FEAT_SKELETONS.map((k) => (
              <Skeleton key={k} className="h-72 rounded-lg" />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {displayProducts.slice(0, 8).map((product, i) => (
              <ProductCard
                key={String(product.id)}
                product={product}
                index={i + 1}
              />
            ))}
          </motion.div>
        )}
      </section>

      {/* Bottom split: Top Sellers + Admin Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2" data-ocid="topsellers.section">
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold text-foreground">
              Top Sellers this Week
            </h2>
          </div>
          {topLoading ? (
            <div
              className="grid grid-cols-1 sm:grid-cols-2 gap-4"
              data-ocid="topsellers.loading_state"
            >
              {TOP_SKELETONS.map((k) => (
                <Skeleton key={k} className="h-32 rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {displayTopSellers.slice(0, 4).map((product, i) => (
                <div
                  key={String(product.id)}
                  className="bg-card border border-border rounded-lg p-4 flex gap-3 hover:shadow-card transition-shadow"
                  data-ocid={`topsellers.item.${i + 1}`}
                >
                  <div className="h-16 w-16 rounded-md overflow-hidden shrink-0 bg-muted">
                    <img
                      src={
                        product.imageUrl ||
                        `/assets/generated/product-${product.category.toLowerCase()}.dim_400x250.jpg`
                      }
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Badge variant="secondary" className="text-xs mb-1">
                      {product.category}
                    </Badge>
                    <h3 className="font-semibold text-sm text-foreground line-clamp-1">
                      {product.name}
                    </h3>
                    <div className="flex items-center justify-between mt-1">
                      <span className="font-bold text-primary text-sm">
                        {formatPrice(product.priceInPaise)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {Number(product.salesCount)} sold
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {isAdmin && stats && (
          <section data-ocid="admin.section">
            <h2 className="text-xl font-bold text-foreground mb-5">
              Admin Overview
            </h2>
            <div className="space-y-3">
              <div
                className="bg-card border border-border rounded-lg p-4 flex items-center gap-3"
                data-ocid="admin.card"
              >
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Package className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    Active Products
                  </p>
                  <p className="text-xl font-bold text-foreground">
                    {String(stats.totalProducts)}
                  </p>
                </div>
              </div>
              <div
                className="bg-card border border-border rounded-lg p-4 flex items-center gap-3"
                data-ocid="admin.card"
              >
                <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total Orders</p>
                  <p className="text-xl font-bold text-foreground">
                    {String(stats.totalOrders)}
                  </p>
                </div>
              </div>
              <div
                className="bg-card border border-border rounded-lg p-4 flex items-center gap-3"
                data-ocid="admin.card"
              >
                <div className="h-10 w-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                  <span className="text-lg font-bold text-yellow-600">₹</span>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Revenue</p>
                  <p className="text-xl font-bold text-foreground">
                    {formatPrice(stats.totalRevenue)}
                  </p>
                </div>
              </div>
              <Button
                className="w-full bg-primary text-primary-foreground"
                onClick={() => onNavigate("admin")}
                data-ocid="admin.primary_button"
              >
                Go to Dashboard
              </Button>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
