import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Store, MapPin, Image, Tag, Save, Search, Loader2, Clock, Plus } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useMarketplace, Shop } from "@/contexts/MarketplaceContext";
import { ImageUploader } from "./ImageUploader";
import { TimeInput } from "./TimeInput";
import { toast } from "sonner";
import { DAY_OPTIONS, BusinessHours, DEFAULT_BUSINESS_HOURS } from "@/lib/shopUtils";

interface ProfileTabProps {
  shop: Shop;
  onAddLocation?: () => void;
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

export function ProfileTab({ shop, onAddLocation }: ProfileTabProps) {
  const { t } = useLanguage();
  const { updateShop } = useMarketplace();
  
  const [name, setName] = useState(shop.name);
  const [category, setCategory] = useState(shop.category || "bakery");
  const [address, setAddress] = useState(shop.address || "");
  const [lat, setLat] = useState(shop.lat);
  const [long, setLong] = useState(shop.long);
  const [imageUrl, setImageUrl] = useState(shop.image_url || "");
  const [businessHours, setBusinessHours] = useState<BusinessHours>(
    shop.business_hours || DEFAULT_BUSINESS_HOURS
  );
  const [saving, setSaving] = useState(false);
  const [geocoding, setGeocoding] = useState(false);

  useEffect(() => {
    setName(shop.name);
    setCategory(shop.category || "bakery");
    setAddress(shop.address || "");
    setLat(shop.lat);
    setLong(shop.long);
    setImageUrl(shop.image_url || "");
    setBusinessHours(shop.business_hours || DEFAULT_BUSINESS_HOURS);
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
        business_hours: businessHours,
      });
      toast.success(t("merchant.changesSaved"));
    } catch (error) {
      toast.error(t("merchant.saveFailed"));
    } finally {
      setSaving(false);
    }
  };

  const updateDayHours = (dayId: string, field: 'open' | 'close', value: string) => {
    // Only update if value is a valid time string (HH:MM format)
    const timeValue = value && value.match(/^\d{2}:\d{2}$/) ? value : null;
    setBusinessHours(prev => ({
      ...prev,
      [dayId]: {
        ...prev[dayId as keyof BusinessHours],
        [field]: timeValue,
      },
    }));
  };

  // Handle time input change with multiple event support for mobile compatibility
  const handleTimeChange = (dayId: string, field: 'open' | 'close') => (
    e: React.ChangeEvent<HTMLInputElement> | React.FormEvent<HTMLInputElement>
  ) => {
    const target = e.target as HTMLInputElement;
    if (target.value) {
      updateDayHours(dayId, field, target.value);
    }
  };

  const toggleDayClosed = (dayId: string) => {
    const day = businessHours[dayId as keyof BusinessHours];
    if (day?.open || day?.close) {
      // Mark as closed
      setBusinessHours(prev => ({
        ...prev,
        [dayId]: { open: null, close: null },
      }));
    } else {
      // Re-enable with default hours
      setBusinessHours(prev => ({
        ...prev,
        [dayId]: { open: '09:00', close: '21:00' },
      }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Business Hours Section - Per Day */}
      <div className="p-4 rounded-2xl border-2 border-border bg-card space-y-4">
        <div className="flex items-center gap-2 text-lg font-semibold">
          <Clock className="h-5 w-5 text-primary" />
          {t("merchant.businessHours")}
        </div>
        
        <div className="space-y-4">
          {DAY_OPTIONS.map((day) => {
            const dayHours = businessHours[day.id as keyof BusinessHours];
            const isClosed = !dayHours?.open && !dayHours?.close;
            
            return (
              <div key={day.id} className="flex flex-col gap-2 p-3 rounded-xl bg-secondary/50">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{t(day.labelKey)}</span>
                  <button
                    onClick={() => toggleDayClosed(day.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      !isClosed
                        ? "bg-green-500/20 text-green-600"
                        : "bg-red-500/20 text-red-500"
                    }`}
                  >
                    {!isClosed ? t("merchant.storeOpen") : t("merchant.storeClosed")}
                  </button>
                </div>
                
                {!isClosed && (
                  <div className="flex items-center gap-3">
                    <TimeInput
                      value={dayHours?.open || '09:00'}
                      onChange={(value) => updateDayHours(day.id, 'open', value)}
                      label={t("merchant.opensAt")}
                      className="flex-1"
                    />
                    <span className="text-muted-foreground mt-5">—</span>
                    <TimeInput
                      value={dayHours?.close || '21:00'}
                      onChange={(value) => updateDayHours(day.id, 'close', value)}
                      label={t("merchant.closesAt")}
                      className="flex-1"
                    />
                  </div>
                )}
              </div>
            );
          })}
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

      {/* Add Location Button */}
      {onAddLocation && (
        <Button
          onClick={onAddLocation}
          variant="outline"
          className="w-full h-14 rounded-xl font-semibold mt-4"
        >
          <Plus className="h-5 w-5 mr-2" />
          {t("merchant.addLocation")}
        </Button>
      )}
    </div>
  );
}