import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Star } from "lucide-react";
import { toast } from "sonner";
import type { ProductDTO } from "../backend.d";
import { useCart } from "../context/CartContext";

const CATEGORY_IMAGES: Record<string, string> = {
  Templates: "/assets/generated/product-template.dim_400x250.jpg",
  eBooks: "/assets/generated/product-ebook.dim_400x250.jpg",
  Courses: "/assets/generated/product-course.dim_400x250.jpg",
  Software: "/assets/generated/product-software.dim_400x250.jpg",
};

const STAR_KEYS = ["s1", "s2", "s3", "s4", "s5"];

function formatPrice(priceInPaise: bigint): string {
  const rupees = Number(priceInPaise) / 100;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(rupees);
}

interface ProductCardProps {
  product: ProductDTO;
  index?: number;
}

export default function ProductCard({ product, index = 1 }: ProductCardProps) {
  const { addItem, items } = useCart();
  const inCart = items.some((i) => i.product.id === product.id);
  const imgSrc =
    product.imageUrl ||
    CATEGORY_IMAGES[product.category] ||
    CATEGORY_IMAGES.Templates;

  const handleAddToCart = () => {
    if (inCart) {
      toast.info(`${product.name} is already in cart`);
      return;
    }
    addItem(product);
    toast.success(`${product.name} added to cart`);
  };

  return (
    <div
      className="bg-card border border-border rounded-lg overflow-hidden shadow-card hover:shadow-md transition-shadow group"
      data-ocid={`products.item.${index}`}
    >
      <div className="relative overflow-hidden aspect-[16/10] bg-muted">
        <img
          src={imgSrc}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        {product.isFeatured && (
          <span className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs font-semibold px-2 py-0.5 rounded-full">
            Featured
          </span>
        )}
      </div>
      <div className="p-4">
        <Badge
          variant="secondary"
          className="text-xs mb-2 bg-secondary text-secondary-foreground"
        >
          {product.category}
        </Badge>
        <h3 className="font-semibold text-sm text-foreground line-clamp-1 mb-1">
          {product.name}
        </h3>
        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
          {product.description}
        </p>
        <div className="flex items-center gap-1 mb-3">
          {STAR_KEYS.map((k) => (
            <Star
              key={k}
              className="h-3 w-3"
              style={{ color: "#F5C84B", fill: "#F5C84B" }}
            />
          ))}
          <span className="text-xs text-muted-foreground ml-1">
            ({Number(product.salesCount)})
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-bold text-foreground">
            {formatPrice(product.priceInPaise)}
          </span>
          <Button
            size="sm"
            onClick={handleAddToCart}
            disabled={inCart}
            className="bg-primary text-primary-foreground hover:bg-teal-dark text-xs"
            data-ocid={`products.button.${index}`}
          >
            <ShoppingCart className="h-3 w-3 mr-1" />
            {inCart ? "In Cart" : "Add to Cart"}
          </Button>
        </div>
      </div>
    </div>
  );
}
