type Category = "All" | "Templates" | "eBooks" | "Software" | "Courses";

interface CategoryNavProps {
  activeCategory: Category;
  onChange: (cat: Category) => void;
  onNavigateProducts: () => void;
}

const CATEGORIES: Category[] = [
  "All",
  "Templates",
  "eBooks",
  "Software",
  "Courses",
];

export default function CategoryNav({
  activeCategory,
  onChange,
  onNavigateProducts,
}: CategoryNavProps) {
  return (
    <nav className="bg-card border-b border-border">
      <div className="max-w-[1200px] mx-auto px-4">
        <ul className="flex items-center gap-0 overflow-x-auto scrollbar-none">
          {CATEGORIES.map((cat) => (
            <li key={cat}>
              <button
                type="button"
                onClick={() => {
                  onChange(cat);
                  onNavigateProducts();
                }}
                className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeCategory === cat
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                }`}
                data-ocid="nav.tab"
              >
                {cat === "All" ? "All Products" : cat}
              </button>
            </li>
          ))}
          <li className="ml-auto">
            <button
              type="button"
              onClick={() => onNavigateProducts()}
              className="px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground whitespace-nowrap"
              data-ocid="nav.link"
            >
              Blog
            </button>
          </li>
          <li>
            <button
              type="button"
              className="px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground whitespace-nowrap"
              data-ocid="nav.link"
            >
              Support
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
}
