import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ArrowRight, ShoppingCart, Trash2, X } from "lucide-react";
import { useCart } from "../context/CartContext";

function formatPrice(priceInPaise: bigint): string {
  const rupees = Number(priceInPaise) / 100;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(rupees);
}

interface CartSidebarProps {
  open: boolean;
  onClose: () => void;
  onCheckout: () => void;
}

export default function CartSidebar({
  open,
  onClose,
  onCheckout,
}: CartSidebarProps) {
  const { items, removeItem, totalAmount } = useCart();

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent
        side="right"
        className="w-full max-w-sm flex flex-col"
        data-ocid="cart.sheet"
      >
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-primary" />
            Shopping Cart
            {items.length > 0 && (
              <span className="text-sm font-normal text-muted-foreground ml-auto">
                {items.length} item{items.length !== 1 ? "s" : ""}
              </span>
            )}
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div
            className="flex-1 flex flex-col items-center justify-center gap-3 text-center"
            data-ocid="cart.empty_state"
          >
            <ShoppingCart className="h-12 w-12 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">Your cart is empty</p>
            <Button variant="outline" size="sm" onClick={onClose}>
              Continue Shopping
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto py-4 space-y-4">
              {items.map((item, idx) => (
                <div
                  key={String(item.product.id)}
                  className="flex gap-3"
                  data-ocid={`cart.item.${idx + 1}`}
                >
                  <div className="h-16 w-16 rounded-md bg-muted overflow-hidden shrink-0">
                    <img
                      src={`/assets/generated/product-${item.product.category.toLowerCase()}.dim_400x250.jpg`}
                      alt={item.product.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground line-clamp-1">
                      {item.product.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {item.product.category}
                    </p>
                    <p className="text-sm font-bold text-primary mt-1">
                      {formatPrice(item.product.priceInPaise)}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                    onClick={() => removeItem(item.product.id)}
                    data-ocid={`cart.delete_button.${idx + 1}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="pt-4 space-y-4">
              <Separator />
              <div className="flex justify-between items-center">
                <span className="font-semibold text-foreground">Total</span>
                <span className="font-bold text-lg text-primary">
                  {formatPrice(totalAmount)}
                </span>
              </div>
              <Button
                className="w-full bg-primary text-primary-foreground hover:bg-teal-dark"
                onClick={() => {
                  onClose();
                  onCheckout();
                }}
                data-ocid="cart.primary_button"
              >
                Proceed to Checkout
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={onClose}
                data-ocid="cart.cancel_button"
              >
                Continue Shopping
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
