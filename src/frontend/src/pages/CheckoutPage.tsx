import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useCart } from "../context/CartContext";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useCreateOrder, useCreatePaymentLink } from "../hooks/useQueries";

type Page = "home" | "products" | "checkout" | "orders" | "admin";

function formatPrice(priceInPaise: bigint): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(priceInPaise) / 100);
}

interface CheckoutPageProps {
  onNavigate: (page: Page) => void;
}

export default function CheckoutPage({ onNavigate }: CheckoutPageProps) {
  const { items, totalAmount, clearCart } = useCart();
  const { identity } = useInternetIdentity();
  const createOrder = useCreateOrder();
  const createPaymentLink = useCreatePaymentLink();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [paymentInitiated, setPaymentInitiated] = useState(false);
  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");

  const isLoading = createOrder.isPending || createPaymentLink.isPending;

  if (items.length === 0 && !paymentInitiated) {
    return (
      <main className="max-w-[1200px] mx-auto px-4 py-16 text-center">
        <p className="text-muted-foreground mb-4">Your cart is empty.</p>
        <Button
          onClick={() => onNavigate("products")}
          data-ocid="checkout.primary_button"
        >
          Browse Products
        </Button>
      </main>
    );
  }

  if (paymentInitiated) {
    return (
      <main className="max-w-[600px] mx-auto px-4 py-16 text-center">
        <div className="animate-in fade-in zoom-in-95 duration-300">
          <CheckCircle2 className="h-16 w-16 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Payment Initiated!
          </h2>
          <p className="text-muted-foreground mb-6">
            A payment link has been opened. Complete your payment there to
            receive access to your products. Check your email for confirmation.
          </p>
          <div className="flex gap-3 justify-center">
            <Button
              onClick={() => onNavigate("orders")}
              data-ocid="checkout.primary_button"
            >
              View My Orders
            </Button>
            <Button
              variant="outline"
              onClick={() => onNavigate("home")}
              data-ocid="checkout.secondary_button"
            >
              Back to Home
            </Button>
          </div>
        </div>
      </main>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setNameError("");
    setEmailError("");

    let valid = true;
    if (!name.trim()) {
      setNameError("Name is required");
      valid = false;
    }
    if (!email.trim() || !email.includes("@")) {
      setEmailError("Valid email is required");
      valid = false;
    }
    if (!valid) return;

    if (!identity) {
      toast.error("Please login to checkout");
      return;
    }

    try {
      const productIds = items.map((i) => i.product.id);
      const orderId = await createOrder.mutateAsync({
        productIds,
        totalAmount,
      });
      const callbackUrl = `${window.location.origin}/orders`;
      const paymentUrl = await createPaymentLink.mutateAsync({
        orderId,
        amount: totalAmount,
        email,
        callbackUrl,
      });
      clearCart();
      window.open(paymentUrl, "_blank");
      setPaymentInitiated(true);
    } catch {
      toast.error("Checkout failed. Please try again.");
    }
  }

  return (
    <main
      className="max-w-[1200px] mx-auto px-4 py-6"
      data-ocid="checkout.page"
    >
      <Button
        variant="ghost"
        className="mb-6 -ml-2"
        onClick={() => onNavigate("products")}
        data-ocid="checkout.secondary_button"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Products
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3">
          <h1 className="text-2xl font-bold text-foreground mb-6">Checkout</h1>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="bg-card border border-border rounded-lg p-6 space-y-4">
              <h2 className="font-semibold text-foreground">
                Customer Details
              </h2>
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  data-ocid="checkout.input"
                />
                {nameError && (
                  <p
                    className="text-xs text-destructive"
                    data-ocid="checkout.error_state"
                  >
                    {nameError}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@example.com"
                  data-ocid="checkout.input"
                />
                {emailError && (
                  <p
                    className="text-xs text-destructive"
                    data-ocid="checkout.error_state"
                  >
                    {emailError}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number (optional)</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 9876543210"
                  data-ocid="checkout.input"
                />
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center gap-2 mb-3">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <h2 className="font-semibold text-foreground">
                  Secure Payment via Cashfree
                </h2>
              </div>
              <p className="text-sm text-muted-foreground">
                You will be redirected to Cashfree&apos;s secure payment page.
                We accept UPI, cards, net banking, and wallets.
              </p>
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full bg-primary text-primary-foreground hover:bg-teal-dark font-semibold"
              disabled={isLoading}
              data-ocid="checkout.submit_button"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Pay {formatPrice(totalAmount)}
                </>
              )}
            </Button>
          </form>
        </div>

        <div className="lg:col-span-2">
          <div
            className="bg-card border border-border rounded-lg p-6 sticky top-24"
            data-ocid="checkout.panel"
          >
            <h2 className="font-semibold text-foreground mb-4">
              Order Summary
            </h2>
            <div className="space-y-3 mb-4">
              {items.map((item) => (
                <div
                  key={String(item.product.id)}
                  className="flex justify-between items-start gap-2"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground line-clamp-1">
                      {item.product.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {item.product.category}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-foreground shrink-0">
                    {formatPrice(item.product.priceInPaise)}
                  </span>
                </div>
              ))}
            </div>
            <Separator className="my-4" />
            <div className="flex justify-between items-center">
              <span className="font-semibold text-foreground">Total</span>
              <span className="text-xl font-bold text-primary">
                {formatPrice(totalAmount)}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Instant download after payment. Lifetime access guaranteed.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
