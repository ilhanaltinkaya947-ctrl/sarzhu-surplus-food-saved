import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Store, MapPin, Image, Tag, Save, Search, Loader2, Clock } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useMarketplace, Shop } from "@/contexts/MarketplaceContext";
import { ImageUploader } from "./ImageUploader";
import { toast } from "sonner";
import { DAY_OPTIONS } from "@/lib/shopUtils";

interface ProfileTabProps {
  shop: Shop;
}

interface GeocodingResult {
  lat: string;
  lon: string;
  display_name: string;
}

const CATEGORIES = [
  { id: "bakery", labelKey: "category.bakery" },
  { id: "coffee", labelKey: "category.coffee" },
  { id: "healthy", labelKey: "category.healthy" },
  { id: "restaurant", labelKey: "category.restaurant" },
];

// Geocode address using OpenStreetMap Nominatim
async function geocodeAddress(address: string): Promise<{ lat: number; long: number } | null> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`,
      {
        headers: {
          "User-Agent": "YorkieApp/1.0",
        },
      }
    );
    const data: GeocodingResult[] = await response.json();
    if (data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        long: parseFloat(data[0].lon),
      };
    }
    return null;
  } catch (error) {
    console.error("Geocoding error:", error);
    return null;
  }
}

export function ProfileTab({ shop }: ProfileTabProps) {
  const { t } = useLanguage();
  const { updateShop } = useMarketplace();
  
  const [name, setName] = useState(shop.name);
  const [category, setCategory] = useState(shop.category || "bakery");
  const [address, setAddress] = useState(shop.address || "");
  const [lat, setLat] = useState(shop.lat);
  const [long, setLong] = useState(shop.long);
  const [imageUrl, setImageUrl] = useState(shop.image_url || "");
  const [openingTime, setOpeningTime] = useState(shop.opening_time || "09:00");
  const [closingTime, setClosingTime] = useState(shop.closing_time || "21:00");
  const [daysOpen, setDaysOpen] = useState<string[]>(shop.days_open || ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']);
  const [saving, setSaving] = useState(false);
  const [geocoding, setGeocoding] = useState(false);

  useEffect(() => {
    setName(shop.name);
    setCategory(shop.category || "bakery");
    setAddress(shop.address || "");
    setLat(shop.lat);
    setLong(shop.long);
    setImageUrl(shop.image_url || "");
    setOpeningTime(shop.opening_time || "09:00");
    setClosingTime(shop.closing_time || "21:00");
    setDaysOpen(shop.days_open || ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']);
  }, [shop]);

  const handleGeocodeAddress = useCallback(async () => {
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
  }, [address, t]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateShop(shop.id, {
        name,
        category,
        address,
        image_url: imageUrl,
        lat,
        long,
        opening_time: openingTime,
        closing_time: closingTime,
        days_open: daysOpen,
      });
      toast.success(t("merchant.changesSaved"));
    } catch (error) {
      toast.error(t("merchant.saveFailed"));
    } finally {
      setSaving(false);
    }
  };

  const toggleDay = (dayId: string) => {
    setDaysOpen(prev => 
      prev.includes(dayId) 
        ? prev.filter(d => d !== dayId)
        : [...prev, dayId]
    );
  };

  return (
    <div className="space-y-6">
      {/* Business Hours Section */}
      <div className="p-4 rounded-2xl border-2 border-border bg-card space-y-4">
        <div className="flex items-center gap-2 text-lg font-semibold">
          <Clock className="h-5 w-5 text-primary" />
          {t("merchant.businessHours")}
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>{t("merchant.opensAt")}</Label>
            <Input
              type="time"
              value={openingTime}
              onChange={(e) => setOpeningTime(e.target.value)}
              className="text-center"
            />
          </div>
          <div className="space-y-2">
            <Label>{t("merchant.closesAt")}</Label>
            <Input
              type="time"
              value={closingTime}
              onChange={(e) => setClosingTime(e.target.value)}
              className="text-center"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>{t("merchant.daysOpen")}</Label>
          <div className="flex flex-wrap gap-2">
            {DAY_OPTIONS.map((day) => (
              <button
                key={day.id}
                onClick={() => toggleDay(day.id)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  daysOpen.includes(day.id)
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground"
                }`}
              >
                {t(day.labelKey)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Form Fields */}
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
            <Tag className="h-4 w-4" />
            {t("merchant.category")}
          </Label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  category === cat.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground"
                }`}
              >
                {t(cat.labelKey)}
              </button>
            ))}
          </div>
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
              className="shrink-0"
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

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Image className="h-4 w-4" />
            {t("merchant.shopImage")}
          </Label>
          <ImageUploader
            currentImageUrl={imageUrl}
            onImageChange={setImageUrl}
            bucket="shop-images"
          />
        </div>
      </div>

      {/* Save Button */}
      <Button
        onClick={handleSave}
        disabled={saving}
        className="w-full h-14 rounded-xl font-semibold"
      >
        <Save className="h-5 w-5 mr-2" />
        {saving ? t("merchant.saving") : t("merchant.saveChanges")}
      </Button>
    </div>
  );
}
