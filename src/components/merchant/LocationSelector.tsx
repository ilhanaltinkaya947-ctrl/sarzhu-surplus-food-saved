import { useState } from "react";
import { ChevronDown, Plus, MapPin, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import { Shop } from "@/contexts/MarketplaceContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface LocationSelectorProps {
  shops: Shop[];
  selectedShop: Shop | null;
  onSelectShop: (shop: Shop) => void;
  onAddLocation: () => void;
}

export function LocationSelector({
  shops,
  selectedShop,
  onSelectShop,
  onAddLocation,
}: LocationSelectorProps) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 px-3 py-2 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium text-sm truncate max-w-[150px]">
            {selectedShop?.name || t("merchant.selectLocation")}
          </span>
          <ChevronDown className={cn(
            "h-4 w-4 text-muted-foreground transition-transform",
            open && "rotate-180"
          )} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        {shops.map((shop) => (
          <DropdownMenuItem
            key={shop.id}
            onClick={() => {
              onSelectShop(shop);
              setOpen(false);
            }}
            className="flex items-center gap-3 py-3"
          >
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{shop.name}</p>
              {shop.address && (
                <p className="text-xs text-muted-foreground truncate">{shop.address}</p>
              )}
            </div>
            {selectedShop?.id === shop.id && (
              <Check className="h-4 w-4 text-primary shrink-0" />
            )}
          </DropdownMenuItem>
        ))}
        
        {shops.length > 0 && <DropdownMenuSeparator />}
        
        <DropdownMenuItem
          onClick={() => {
            onAddLocation();
            setOpen(false);
          }}
          className="flex items-center gap-3 py-3 text-primary"
        >
          <Plus className="h-4 w-4" />
          <span className="font-medium">{t("merchant.addLocation")}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
