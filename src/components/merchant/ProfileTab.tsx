import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Store, MapPin, Image, Tag, Save } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useMarketplace, Shop } from "@/contexts/MarketplaceContext";
import { ImageUploader } from "./ImageUploader";
import { toast } from "sonner";

interface ProfileTabProps {
  shop: Shop;
}

const CATEGORIES = [
  { id: "bakery", labelKey: "category.bakery" },
  { id: "coffee", labelKey: "category.coffee" },
  { id: "healthy", labelKey: "category.healthy" },
  { id: "restaurant", labelKey: "category.restaurant" },
];

export function ProfileTab({ shop }: ProfileTabProps) {
  const { t } = useLanguage();
  const { updateShop, updateShopStatus } = useMarketplace();
  
  const [name, setName] = useState(shop.name);
  const [category, setCategory] = useState(shop.category || "bakery");
  const [address, setAddress] = useState(shop.address || "");
  const [imageUrl, setImageUrl] = useState(shop.image_url || "");
  const [isOpen, setIsOpen] = useState(shop.isOpen);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setName(shop.name);
    setCategory(shop.category || "bakery");
    setAddress(shop.address || "");
    setImageUrl(shop.image_url || "");
    setIsOpen(shop.isOpen);
  }, [shop]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateShop(shop.id, {
        name,
        category,
        address,
        image_url: imageUrl,
      });
      toast.success(t("merchant.changesSaved"));
    } catch (error) {
      toast.error(t("merchant.saveFailed"));
    } finally {
      setSaving(false);
    }
  };

  const handleToggleOpen = (checked: boolean) => {
    setIsOpen(checked);
    updateShopStatus(shop.id, checked);
    toast.success(checked ? t("merchant.storeOpened") : t("merchant.storeClosed"));
  };

  return (
    <div className="space-y-6">
      {/* Store Status Toggle */}
      <div className="flex items-center justify-between p-4 rounded-2xl border-2 border-border bg-card">
        <div className="flex items-center gap-3">
          <div className={`h-3 w-3 rounded-full ${isOpen ? "bg-emerald-500" : "bg-destructive"}`} />
          <span className="font-semibold">
            {isOpen ? t("merchant.storeOpen") : t("merchant.storeClosed")}
          </span>
        </div>
        <Switch checked={isOpen} onCheckedChange={handleToggleOpen} />
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
          <Input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder={t("merchant.addressPlaceholder")}
          />
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
