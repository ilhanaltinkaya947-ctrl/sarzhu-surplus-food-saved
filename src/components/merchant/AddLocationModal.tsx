import { useState } from "react";
import { X, Store, MapPin, Search, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/contexts/LanguageContext";
import { useMarketplace } from "@/contexts/MarketplaceContext";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface AddLocationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

// Geocode address using OpenStreetMap Nominatim
async function geocodeAddress(address: string): Promise<{ lat: number; long: number } | null> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`,
      { headers: { "User-Agent": "YorkieApp/1.0" } }
    );
    const data = await response.json();
    if (data.length > 0) {
      return { lat: parseFloat(data[0].lat), long: parseFloat(data[0].lon) };
    }
    return null;
  } catch (error) {
    console.error("Geocoding error:", error);
    return null;
  }
}

export function AddLocationModal({ open, onOpenChange, onSuccess }: AddLocationModalProps) {
  const { t } = useLanguage();
  const { addShop } = useMarketplace();
  const { user } = useAuth();
  
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [lat, setLat] = useState<number | null>(null);
  const [long, setLong] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [geocoding, setGeocoding] = useState(false);

  const handleGeocodeAddress = async () => {
    if (!address.trim()) {
      toast.error(t("merchant.enterAddress"));
      return;
    }
    
    setGeocoding(true);
    const coords = await geocodeAddress(address);
    setGeocoding(false);
    
    if (coords) {
      setLat(coords.lat);
      setLong(coords.long);
      toast.success(t("merchant.locationFound"));
    } else {
      toast.error(t("merchant.locationNotFound"));
    }
  };

  const handleSave = async () => {
    if (!name.trim() || lat === null || long === null) {
      toast.error(t("merchant.fillAllFields"));
      return;
    }
    
    setSaving(true);
    try {
      await addShop({
        name,
        lat,
        long,
        address,
        image_url: null,
        description: null,
        owner_id: user?.id || null,
      });
      
      toast.success(t("merchant.locationAdded"));
      onOpenChange(false);
      onSuccess?.();
      
      // Reset form
      setName("");
      setAddress("");
      setLat(null);
      setLong(null);
    } catch (error) {
      toast.error(t("merchant.saveFailed"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={() => onOpenChange(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-x-4 top-[10%] z-50 mx-auto max-w-md rounded-2xl bg-background p-6 shadow-xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">{t("merchant.addLocation")}</h2>
              <button
                onClick={() => onOpenChange(false)}
                className="p-2 rounded-full hover:bg-secondary"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Store className="h-4 w-4" />
                  {t("merchant.shopName")}
                </Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t("merchant.shopNamePlaceholder")}
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {t("merchant.address")}
                </Label>
                <div className="flex gap-2">
                  <Input
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder={t("merchant.addressPlaceholder")}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleGeocodeAddress}
                    disabled={geocoding}
                  >
                    {geocoding ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Search className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {lat && long && (
                  <p className="text-xs text-muted-foreground">
                    📍 {lat.toFixed(5)}, {long.toFixed(5)}
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => onOpenChange(false)}
              >
                {t("general.cancel")}
              </Button>
              <Button
                className="flex-1"
                onClick={handleSave}
                disabled={saving || !name.trim() || lat === null}
              >
                {saving ? t("merchant.saving") : t("merchant.addLocation")}
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
