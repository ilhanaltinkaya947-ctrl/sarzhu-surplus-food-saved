import { Search, Bell } from "lucide-react";
import { cn } from "@/lib/utils";

interface HeaderProps {
  title?: string;
  showSearch?: boolean;
  transparent?: boolean;
}

export function Header({ title = "Sarzhu", showSearch = false, transparent = false }: HeaderProps) {
  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-40 pt-safe",
        transparent
          ? "bg-gradient-to-b from-background/80 via-background/40 to-transparent"
          : "bg-card/95 backdrop-blur-lg border-b border-border"
      )}
    >
      <div className="flex items-center justify-between px-4 py-3">
        <h1 className="text-xl font-bold text-foreground tracking-tight">
          {title}
        </h1>
        
        <div className="flex items-center gap-2">
          {showSearch && (
            <button className="touch-target touch-active flex items-center justify-center rounded-full bg-secondary p-2.5">
              <Search className="h-5 w-5 text-muted-foreground" />
            </button>
          )}
          <button className="touch-target touch-active flex items-center justify-center rounded-full bg-secondary p-2.5 relative">
            <Bell className="h-5 w-5 text-muted-foreground" />
            <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 bg-save rounded-full border-2 border-card" />
          </button>
        </div>
      </div>
    </header>
  );
}
