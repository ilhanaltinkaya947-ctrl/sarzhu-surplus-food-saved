import { Search, User } from "lucide-react";
import { Link } from "react-router-dom";

export function FloatingSearchBar() {
  return (
    <div className="absolute top-12 left-4 right-4 z-20">
      <div className="flex items-center gap-3 rounded-2xl bg-white/90 backdrop-blur-xl px-4 py-3 shadow-lg">
        <Search className="h-5 w-5 text-muted-foreground flex-shrink-0" />
        <input
          type="text"
          placeholder="Search for food..."
          className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
        />
        <Link
          to="/profile"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary touch-active flex-shrink-0"
        >
          <User className="h-5 w-5 text-foreground" />
        </Link>
      </div>
    </div>
  );
}
