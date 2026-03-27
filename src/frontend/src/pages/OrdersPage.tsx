import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CheckCircle2,
  Clock,
  Download,
  Loader2,
  Package,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useGetDownloadUrl, useGetMyOrders } from "../hooks/useQueries";

type Page = "home" | "products" | "checkout" | "orders" | "admin";

const SKEL_KEYS = ["sk1", "sk2", "sk3"];

function formatDate(nanoTs: bigint): string {
  const ms = Number(nanoTs / 1_000_000n);
  return new Date(ms).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatPrice(priceInPaise: bigint): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(priceInPaise) / 100);
}

function StatusBadge({ status }: { status: string }) {
  if (status === "paid" || status === "SUCCESS") {
    return (
      <Badge className="bg-green-100 text-green-700 border-green-200">
        <CheckCircle2 className="h-3 w-3 mr-1" />
        Paid
      </Badge>
    );
  }
  if (status === "failed" || status === "FAILED") {
    return (
      <Badge className="bg-red-100 text-red-700 border-red-200">
        <XCircle className="h-3 w-3 mr-1" />
        Failed
      </Badge>
    );
  }
  return (
    <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">
      <Clock className="h-3 w-3 mr-1" />
      Pending
    </Badge>
  );
}

interface OrdersPageProps {
  onNavigate: (page: Page) => void;
}

export default function OrdersPage({ onNavigate }: OrdersPageProps) {
  const { loginStatus, login } = useInternetIdentity();
  const isLoggedIn = loginStatus === "success";
  const { data: orders, isLoading } = useGetMyOrders();
  const getDownloadUrl = useGetDownloadUrl();
  const [downloadingMap, setDownloadingMap] = useState<Record<string, boolean>>(
    {},
  );

  if (!isLoggedIn) {
    return (
      <main
        className="max-w-[1200px] mx-auto px-4 py-16 text-center"
        data-ocid="orders.page"
      >
        <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
        <h2 className="text-xl font-bold text-foreground mb-2">
          Sign in to view orders
        </h2>
        <p className="text-muted-foreground mb-6">
          Log in to access your purchase history and downloads.
        </p>
        <Button
          onClick={login}
          className="bg-primary text-primary-foreground"
          data-ocid="orders.primary_button"
        >
          Login
        </Button>
      </main>
    );
  }

  async function handleDownload(
    orderId: bigint,
    productId: bigint,
    key: string,
  ) {
    setDownloadingMap((prev) => ({ ...prev, [key]: true }));
    try {
      const url = await getDownloadUrl.mutateAsync({ orderId, productId });
      if (url) {
        window.open(url, "_blank");
      } else {
        toast.error("Download URL not available");
      }
    } catch {
      toast.error("Failed to get download link");
    } finally {
      setDownloadingMap((prev) => ({ ...prev, [key]: false }));
    }
  }

  return (
    <main className="max-w-[1200px] mx-auto px-4 py-6" data-ocid="orders.page">
      <h1 className="text-2xl font-bold text-foreground mb-2">My Orders</h1>
      <p className="text-muted-foreground mb-6">
        View your purchases and download your digital products
      </p>

      {isLoading ? (
        <div className="space-y-4" data-ocid="orders.loading_state">
          {SKEL_KEYS.map((k) => (
            <Skeleton key={k} className="h-32 rounded-lg" />
          ))}
        </div>
      ) : !orders || orders.length === 0 ? (
        <div
          className="text-center py-16 bg-card border border-border rounded-lg"
          data-ocid="orders.empty_state"
        >
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
          <p className="font-medium text-foreground mb-1">No orders yet</p>
          <p className="text-sm text-muted-foreground mb-4">
            Start shopping to see your orders here
          </p>
          <Button
            onClick={() => onNavigate("products")}
            className="bg-primary text-primary-foreground"
            data-ocid="orders.primary_button"
          >
            Browse Products
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order, idx) => (
            <div
              key={String(order.id)}
              className="bg-card border border-border rounded-lg p-6"
              data-ocid={`orders.item.${idx + 1}`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                <div>
                  <p className="font-semibold text-foreground">
                    Order #{String(order.id)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(order.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={order.paymentStatus} />
                  <span className="font-bold text-primary">
                    {formatPrice(order.totalAmount)}
                  </span>
                </div>
              </div>
              <div className="border-t border-border pt-4">
                <p className="text-sm text-muted-foreground mb-3">
                  {order.productIds.length} product
                  {order.productIds.length !== 1 ? "s" : ""} · Order ID:{" "}
                  {order.cashfreeOrderId || "pending"}
                </p>
                {(order.paymentStatus === "paid" ||
                  order.paymentStatus === "SUCCESS") && (
                  <div className="flex flex-wrap gap-2">
                    {order.productIds.map((productId, pidx) => {
                      const dlKey = `${String(order.id)}-${String(productId)}`;
                      return (
                        <Button
                          key={String(productId)}
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            handleDownload(order.id, productId, dlKey)
                          }
                          disabled={downloadingMap[dlKey]}
                          className="border-primary text-primary hover:bg-primary/10"
                          data-ocid={`orders.button.${pidx + 1}`}
                        >
                          {downloadingMap[dlKey] ? (
                            <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                          ) : (
                            <Download className="h-3 w-3 mr-2" />
                          )}
                          Download Product {pidx + 1}
                        </Button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
