import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  LayoutDashboard,
  LogIn,
  LogOut,
  Search,
  ShoppingCart,
  Store,
} from "lucide-react";
import { useCart } from "../context/CartContext";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useIsAdmin } from "../hooks/useQueries";

type Page = "home" | "products" | "checkout" | "orders" | "admin";

interface HeaderProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  onCartOpen: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export default function Header({
  currentPage,
  onNavigate,
  onCartOpen,
  searchQuery,
  onSearchChange,
}: HeaderProps) {
  const { totalCount } = useCart();
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const { data: isAdmin } = useIsAdmin();
  const isLoggedIn = loginStatus === "success" && !!identity;
  const principal = identity?.getPrincipal().toString();
  const shortPrincipal = principal ? `${principal.slice(0, 8)}...` : "";

  return (
    <header className="bg-card border-b border-border sticky top-0 z-40 shadow-xs">
      <div className="max-w-[1200px] mx-auto px-4 py-3 flex items-center gap-4">
        <button
          type="button"
          onClick={() => onNavigate("home")}
          className="flex items-center gap-2 text-foreground hover:text-primary transition-colors shrink-0"
          data-ocid="nav.link"
        >
          <Store className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg text-foreground">StackMarket</span>
        </button>

        <div className="flex-1 max-w-md relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search digital products..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") onNavigate("products");
            }}
            className="pl-9 bg-background border-border"
            data-ocid="header.search_input"
          />
        </div>

        <div className="flex items-center gap-2 ml-auto">
          {isLoggedIn && isAdmin && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate("admin")}
              className={currentPage === "admin" ? "bg-secondary" : ""}
              data-ocid="nav.link"
            >
              <LayoutDashboard className="h-4 w-4 mr-1" />
              Admin
            </Button>
          )}
          {isLoggedIn && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate("orders")}
              className={currentPage === "orders" ? "bg-secondary" : ""}
              data-ocid="nav.link"
            >
              My Orders
            </Button>
          )}
          {isLoggedIn ? (
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                  {shortPrincipal.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="hidden sm:block">
                <p className="text-xs font-medium text-foreground">
                  {shortPrincipal}
                </p>
                <p className="text-xs text-muted-foreground">
                  {isAdmin ? "Admin" : "User"}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={clear}
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={login}
              disabled={loginStatus === "logging-in"}
              data-ocid="header.login_button"
            >
              <LogIn className="h-4 w-4 mr-1" />
              {loginStatus === "logging-in" ? "Logging in..." : "Login"}
            </Button>
          )}

          <Button
            variant="outline"
            size="icon"
            className="relative"
            onClick={onCartOpen}
            data-ocid="header.open_modal_button"
          >
            <ShoppingCart className="h-4 w-4" />
            {totalCount > 0 && (
              <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs bg-primary text-primary-foreground border-0">
                {totalCount}
              </Badge>
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}
