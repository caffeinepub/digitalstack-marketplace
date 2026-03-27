import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, SlidersHorizontal } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import type { ProductDTO } from "../backend.d";
import ProductCard from "../components/ProductCard";
import { useSearchProducts } from "../hooks/useQueries";

const CATEGORIES = ["All", "Templates", "eBooks", "Software", "Courses"];
const SKEL_KEYS = [
  "sk1",
  "sk2",
  "sk3",
  "sk4",
  "sk5",
  "sk6",
  "sk7",
  "sk8",
  "sk9",
  "sk10",
  "sk11",
  "sk12",
];

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
      "Production-ready REST API boilerplate with auth, rate limiting, and tests",
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
      "Full-stack e-commerce template with Stripe, auth, and product management",
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
  {
    id: 9n,
    name: "Vue.js Admin Template",
    priceInPaise: 199900n,
    description: "Beautiful admin dashboard with charts, tables, and dark mode",
    isActive: true,
    imageUrl: "/assets/generated/product-template.dim_400x250.jpg",
    isFeatured: false,
    category: "Templates",
    salesCount: 73n,
    fileUrl: undefined,
  },
  {
    id: 10n,
    name: "AWS Mastery Course",
    priceInPaise: 299900n,
    description:
      "Complete cloud computing course covering all major AWS services",
    isActive: true,
    imageUrl: "/assets/generated/product-course.dim_400x250.jpg",
    isFeatured: false,
    category: "Courses",
    salesCount: 201n,
    fileUrl: undefined,
  },
  {
    id: 11n,
    name: "CI/CD Pipeline Kit",
    priceInPaise: 129900n,
    description:
      "Ready-to-use GitHub Actions workflows for Node.js, Python, and Docker",
    isActive: true,
    imageUrl: "/assets/generated/product-software.dim_400x250.jpg",
    isFeatured: false,
    category: "Software",
    salesCount: 145n,
    fileUrl: undefined,
  },
  {
    id: 12n,
    name: "Digital Marketing Guide",
    priceInPaise: 89900n,
    description:
      "SEO, social media, email marketing, and paid ads strategy guide",
    isActive: true,
    imageUrl: "/assets/generated/product-ebook.dim_400x250.jpg",
    isFeatured: false,
    category: "eBooks",
    salesCount: 378n,
    fileUrl: undefined,
  },
];

interface ProductsPageProps {
  initialCategory?: string;
  initialSearch?: string;
}

export default function ProductsPage({
  initialCategory = "All",
  initialSearch = "",
}: ProductsPageProps) {
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [search, setSearch] = useState(initialSearch);

  const categoryParam = activeCategory === "All" ? "" : activeCategory;
  const { data: products, isLoading } = useSearchProducts(
    search,
    categoryParam,
  );

  const displayProducts =
    products && products.length > 0
      ? products
      : SAMPLE_PRODUCTS.filter(
          (p) =>
            (activeCategory === "All" || p.category === activeCategory) &&
            (!search ||
              p.name.toLowerCase().includes(search.toLowerCase()) ||
              p.description.toLowerCase().includes(search.toLowerCase())),
        );

  return (
    <main
      className="max-w-[1200px] mx-auto px-4 py-6"
      data-ocid="products.page"
    >
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground mb-1">
          Browse All Products
        </h1>
        <p className="text-muted-foreground">
          Discover premium digital products from world-class creators
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
            data-ocid="products.search_input"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto">
          <SlidersHorizontal className="h-4 w-4 text-muted-foreground shrink-0" />
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeCategory === cat
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-muted"
              }`}
              data-ocid="products.tab"
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <p className="text-sm text-muted-foreground">
          {displayProducts.length} product
          {displayProducts.length !== 1 ? "s" : ""} found
          {activeCategory !== "All" ? ` in ${activeCategory}` : ""}
          {search ? ` for "${search}"` : ""}
        </p>
      </div>

      {isLoading ? (
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          data-ocid="products.loading_state"
        >
          {SKEL_KEYS.map((k) => (
            <Skeleton key={k} className="h-72 rounded-lg" />
          ))}
        </div>
      ) : displayProducts.length === 0 ? (
        <div className="text-center py-16" data-ocid="products.empty_state">
          <p className="text-muted-foreground">
            No products found. Try a different search or category.
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => {
              setSearch("");
              setActiveCategory("All");
            }}
          >
            Clear Filters
          </Button>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
        >
          {displayProducts.map((product, i) => (
            <ProductCard
              key={String(product.id)}
              product={product}
              index={i + 1}
            />
          ))}
        </motion.div>
      )}
    </main>
  );
}
