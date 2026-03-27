import { Toaster } from "@/components/ui/sonner";
import { useState } from "react";
import CartSidebar from "./components/CartSidebar";
import CategoryNav from "./components/CategoryNav";
import Footer from "./components/Footer";
import Header from "./components/Header";
import { CartProvider } from "./context/CartContext";
import AdminDashboard from "./pages/AdminDashboard";
import CheckoutPage from "./pages/CheckoutPage";
import HomePage from "./pages/HomePage";
import OrdersPage from "./pages/OrdersPage";
import ProductsPage from "./pages/ProductsPage";

type Page = "home" | "products" | "checkout" | "orders" | "admin";
type Category = "All" | "Templates" | "eBooks" | "Software" | "Courses";

export default function App() {
  const [page, setPage] = useState<Page>("home");
  const [cartOpen, setCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<Category>("All");

  function navigate(p: Page) {
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <CartProvider>
      <div className="min-h-screen bg-background flex flex-col">
        <Header
          currentPage={page}
          onNavigate={navigate}
          onCartOpen={() => setCartOpen(true)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
        <CategoryNav
          activeCategory={activeCategory}
          onChange={setActiveCategory}
          onNavigateProducts={() => navigate("products")}
        />

        <div className="flex-1">
          {page === "home" && <HomePage onNavigate={navigate} />}
          {page === "products" && (
            <ProductsPage
              initialCategory={activeCategory}
              initialSearch={searchQuery}
            />
          )}
          {page === "checkout" && <CheckoutPage onNavigate={navigate} />}
          {page === "orders" && <OrdersPage onNavigate={navigate} />}
          {page === "admin" && <AdminDashboard />}
        </div>

        <Footer />

        <CartSidebar
          open={cartOpen}
          onClose={() => setCartOpen(false)}
          onCheckout={() => navigate("checkout")}
        />

        <Toaster richColors position="top-right" />
      </div>
    </CartProvider>
  );
}
