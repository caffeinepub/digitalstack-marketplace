import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  BarChart3,
  Clock,
  Edit2,
  Loader2,
  Package,
  Plus,
  ShoppingBag,
  Trash2,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ExternalBlob } from "../backend";
import type { ProductDTO } from "../backend.d";
import {
  useAddProduct,
  useDeleteProduct,
  useGetAdminStats,
  useGetAllOrders,
  useGetProducts,
  useUpdatePaymentStatus,
  useUpdateProduct,
} from "../hooks/useQueries";

const CATEGORIES = ["Templates", "eBooks", "Software", "Courses"];

const STAT_CARDS = [
  {
    key: "products",
    label: "Total Products",
    color: "text-primary",
    bg: "bg-primary/10",
    Icon: Package,
  },
  {
    key: "orders",
    label: "Total Orders",
    color: "text-green-600",
    bg: "bg-green-100",
    Icon: ShoppingBag,
  },
  {
    key: "pending",
    label: "Pending Orders",
    color: "text-yellow-600",
    bg: "bg-yellow-100",
    Icon: Clock,
  },
  {
    key: "revenue",
    label: "Total Revenue",
    color: "text-purple-600",
    bg: "bg-purple-100",
    Icon: TrendingUp,
  },
];

function formatPrice(priceInPaise: bigint): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(priceInPaise) / 100);
}

function formatDate(nanoTs: bigint): string {
  const ms = Number(nanoTs / 1_000_000n);
  return new Date(ms).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

interface ProductFormData {
  name: string;
  description: string;
  priceRupees: string;
  category: string;
  imageUrl: string;
  fileUrl: string;
  isFeatured: boolean;
  isActive: boolean;
}

const EMPTY_FORM: ProductFormData = {
  name: "",
  description: "",
  priceRupees: "",
  category: "Templates",
  imageUrl: "",
  fileUrl: "",
  isFeatured: false,
  isActive: true,
};

export default function AdminDashboard() {
  const { data: stats, isLoading: statsLoading } = useGetAdminStats();
  const { data: products, isLoading: productsLoading } = useGetProducts();
  const { data: orders, isLoading: ordersLoading } = useGetAllOrders();
  const addProduct = useAddProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const updateStatus = useUpdatePaymentStatus();

  const [addOpen, setAddOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<ProductDTO | null>(null);
  const [deleteId, setDeleteId] = useState<bigint | null>(null);
  const [form, setForm] = useState<ProductFormData>(EMPTY_FORM);

  function openAdd() {
    setForm(EMPTY_FORM);
    setAddOpen(true);
  }

  function openEdit(product: ProductDTO) {
    setForm({
      name: product.name,
      description: product.description,
      priceRupees: String(Number(product.priceInPaise) / 100),
      category: product.category,
      imageUrl: product.imageUrl || "",
      fileUrl: product.fileUrl || "",
      isFeatured: product.isFeatured,
      isActive: product.isActive,
    });
    setEditProduct(product);
  }

  async function handleSave() {
    const priceInPaise = BigInt(
      Math.round(Number.parseFloat(form.priceRupees) * 100),
    );
    const productData = {
      id: editProduct ? editProduct.id : 0n,
      name: form.name,
      description: form.description,
      priceInPaise,
      category: form.category,
      imageUrl: ExternalBlob.fromURL(
        form.imageUrl || "https://placeholder.com/400x250",
      ),
      fileUrl: ExternalBlob.fromURL(
        form.fileUrl || "https://placeholder.com/file",
      ),
      isFeatured: form.isFeatured,
      isActive: form.isActive,
      salesCount: editProduct ? editProduct.salesCount : 0n,
    };
    try {
      if (editProduct) {
        await updateProduct.mutateAsync({
          productId: editProduct.id,
          product: productData,
        });
        toast.success("Product updated successfully");
        setEditProduct(null);
      } else {
        await addProduct.mutateAsync(productData);
        toast.success("Product added successfully");
        setAddOpen(false);
      }
      setForm(EMPTY_FORM);
    } catch {
      toast.error("Failed to save product");
    }
  }

  async function handleDelete() {
    if (deleteId === null) return;
    try {
      await deleteProduct.mutateAsync(deleteId);
      toast.success("Product deleted");
    } catch {
      toast.error("Failed to delete product");
    } finally {
      setDeleteId(null);
    }
  }

  async function handleStatusChange(orderId: bigint, status: string) {
    try {
      await updateStatus.mutateAsync({ orderId, status });
      toast.success("Status updated");
    } catch {
      toast.error("Failed to update status");
    }
  }

  const isSaving = addProduct.isPending || updateProduct.isPending;

  function getStatValue(key: string): string {
    if (!stats) return "0";
    if (key === "products") return String(stats.totalProducts);
    if (key === "orders") return String(stats.totalOrders);
    if (key === "pending") return String(stats.pendingOrders);
    if (key === "revenue") return formatPrice(stats.totalRevenue);
    return "0";
  }

  return (
    <main className="max-w-[1200px] mx-auto px-4 py-6" data-ocid="admin.page">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground">
            Manage your digital products marketplace
          </p>
        </div>
        <BarChart3 className="h-8 w-8 text-primary" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statsLoading
          ? ["s1", "s2", "s3", "s4"].map((k) => (
              <Skeleton key={k} className="h-24 rounded-lg" />
            ))
          : STAT_CARDS.map(({ key, label, color, bg, Icon }) => (
              <div
                key={key}
                className="bg-card border border-border rounded-lg p-4 flex items-center gap-3"
                data-ocid="admin.card"
              >
                <div
                  className={`h-10 w-10 rounded-lg ${bg} flex items-center justify-center shrink-0`}
                >
                  <Icon className={`h-5 w-5 ${color}`} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="text-xl font-bold text-foreground">
                    {getStatValue(key)}
                  </p>
                </div>
              </div>
            ))}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="products">
        <TabsList className="mb-6" data-ocid="admin.tab">
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
        </TabsList>

        {/* Products Tab */}
        <TabsContent value="products">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-foreground">
              All Products ({products?.length ?? 0})
            </h2>
            <Button
              onClick={openAdd}
              size="sm"
              className="bg-primary text-primary-foreground"
              data-ocid="admin.open_modal_button"
            >
              <Plus className="h-4 w-4 mr-1" /> Add Product
            </Button>
          </div>
          {productsLoading ? (
            <Skeleton
              className="h-64 rounded-lg"
              data-ocid="admin.loading_state"
            />
          ) : (
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <Table data-ocid="admin.table">
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Sales</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {!products || products.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center text-muted-foreground py-8"
                        data-ocid="admin.empty_state"
                      >
                        No products yet. Add your first product.
                      </TableCell>
                    </TableRow>
                  ) : (
                    products.map((product, idx) => (
                      <TableRow
                        key={String(product.id)}
                        data-ocid={`admin.row.${idx + 1}`}
                      >
                        <TableCell>
                          <div>
                            <p className="font-medium text-foreground text-sm">
                              {product.name}
                            </p>
                            <p className="text-xs text-muted-foreground line-clamp-1">
                              {product.description}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{product.category}</Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatPrice(product.priceInPaise)}
                        </TableCell>
                        <TableCell>{Number(product.salesCount)}</TableCell>
                        <TableCell>
                          {product.isActive ? (
                            <Badge className="bg-green-100 text-green-700 border-green-200">
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="secondary">Inactive</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8"
                              onClick={() => openEdit(product)}
                              data-ocid={`admin.edit_button.${idx + 1}`}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => setDeleteId(product.id)}
                              data-ocid={`admin.delete_button.${idx + 1}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        {/* Orders Tab */}
        <TabsContent value="orders">
          <h2 className="font-semibold text-foreground mb-4">
            All Orders ({orders?.length ?? 0})
          </h2>
          {ordersLoading ? (
            <Skeleton
              className="h-64 rounded-lg"
              data-ocid="admin.loading_state"
            />
          ) : (
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <Table data-ocid="admin.table">
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Products</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Update Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {!orders || orders.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center text-muted-foreground py-8"
                        data-ocid="admin.empty_state"
                      >
                        No orders yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    orders.map((order, idx) => (
                      <TableRow
                        key={String(order.id)}
                        data-ocid={`admin.row.${idx + 1}`}
                      >
                        <TableCell className="font-medium">
                          #{String(order.id)}
                        </TableCell>
                        <TableCell>{formatDate(order.createdAt)}</TableCell>
                        <TableCell>{order.productIds.length} item(s)</TableCell>
                        <TableCell>{formatPrice(order.totalAmount)}</TableCell>
                        <TableCell>
                          <Badge
                            className={
                              order.paymentStatus === "paid" ||
                              order.paymentStatus === "SUCCESS"
                                ? "bg-green-100 text-green-700 border-green-200"
                                : order.paymentStatus === "failed"
                                  ? "bg-red-100 text-red-700 border-red-200"
                                  : "bg-yellow-100 text-yellow-700 border-yellow-200"
                            }
                          >
                            {order.paymentStatus}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Select
                            defaultValue={order.paymentStatus}
                            onValueChange={(val) =>
                              handleStatusChange(order.id, val)
                            }
                          >
                            <SelectTrigger
                              className="h-8 text-xs w-28"
                              data-ocid={`admin.select.${idx + 1}`}
                            >
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">pending</SelectItem>
                              <SelectItem value="paid">paid</SelectItem>
                              <SelectItem value="failed">failed</SelectItem>
                              <SelectItem value="refunded">refunded</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Add/Edit Product Dialog */}
      <Dialog
        open={addOpen || editProduct !== null}
        onOpenChange={(open) => {
          if (!open) {
            setAddOpen(false);
            setEditProduct(null);
          }
        }}
      >
        <DialogContent
          className="max-w-lg max-h-[90vh] overflow-y-auto"
          data-ocid="admin.dialog"
        >
          <DialogHeader>
            <DialogTitle>
              {editProduct ? "Edit Product" : "Add New Product"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Product Name</Label>
              <Input
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                placeholder="e.g. React Dashboard Pro"
                data-ocid="admin.input"
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                placeholder="Describe your product..."
                rows={3}
                data-ocid="admin.textarea"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Price (₹)</Label>
                <Input
                  type="number"
                  value={form.priceRupees}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, priceRupees: e.target.value }))
                  }
                  placeholder="999"
                  data-ocid="admin.input"
                />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={form.category}
                  onValueChange={(val) =>
                    setForm((f) => ({ ...f, category: val }))
                  }
                >
                  <SelectTrigger data-ocid="admin.select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Image URL</Label>
              <Input
                value={form.imageUrl}
                onChange={(e) =>
                  setForm((f) => ({ ...f, imageUrl: e.target.value }))
                }
                placeholder="https://example.com/image.jpg"
                data-ocid="admin.input"
              />
            </div>
            <div className="space-y-2">
              <Label>Download File URL</Label>
              <Input
                value={form.fileUrl}
                onChange={(e) =>
                  setForm((f) => ({ ...f, fileUrl: e.target.value }))
                }
                placeholder="https://example.com/product.zip"
                data-ocid="admin.input"
              />
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="featured"
                  checked={form.isFeatured}
                  onCheckedChange={(c) =>
                    setForm((f) => ({ ...f, isFeatured: !!c }))
                  }
                  data-ocid="admin.checkbox"
                />
                <Label htmlFor="featured">Featured</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="active"
                  checked={form.isActive}
                  onCheckedChange={(c) =>
                    setForm((f) => ({ ...f, isActive: !!c }))
                  }
                  data-ocid="admin.checkbox"
                />
                <Label htmlFor="active">Active</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setAddOpen(false);
                setEditProduct(null);
              }}
              data-ocid="admin.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving || !form.name || !form.priceRupees}
              className="bg-primary text-primary-foreground"
              data-ocid="admin.save_button"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : null}
              {editProduct ? "Update" : "Add Product"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog
        open={deleteId !== null}
        onOpenChange={(o) => !o && setDeleteId(null)}
      >
        <AlertDialogContent data-ocid="admin.dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this product? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="admin.cancel_button">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground"
              data-ocid="admin.confirm_button"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
