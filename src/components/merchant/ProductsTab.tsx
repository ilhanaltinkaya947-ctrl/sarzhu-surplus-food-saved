import { useState } from "react";
import { Plus, Package, Clock, Trash2, Edit2, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/contexts/LanguageContext";
import { useMarketplace, Shop, MysteryBox } from "@/contexts/MarketplaceContext";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ProductsTabProps {
  shop: Shop;
}

export function ProductsTab({ shop }: ProductsTabProps) {
  const { t } = useLanguage();
  const { addProduct, updateProduct, deleteProduct } = useMarketplace();
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<MysteryBox | null>(null);
  const [editingQuantity, setEditingQuantity] = useState<string | null>(null);
  const [tempQuantity, setTempQuantity] = useState("");
  
  // Form state
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [pickupWindow, setPickupWindow] = useState("18:00 - 21:00");
  const [description, setDescription] = useState("");

  const resetForm = () => {
    setName("");
    setPrice("");
    setOriginalPrice("");
    setQuantity("");
    setPickupWindow("18:00 - 21:00");
    setDescription("");
  };

  const handleAddProduct = async () => {
    if (!name || !price || !originalPrice || !quantity) {
      toast.error(t("merchant.fillAllFields"));
      return;
    }

    try {
      await addProduct(shop.id, {
        name,
        price: Number(price),
        originalPrice: Number(originalPrice),
        quantity: Number(quantity),
        pickupWindow,
        description,
      });

      toast.success(t("merchant.productAdded"));
      resetForm();
      setShowAddForm(false);
    } catch (error: any) {
      console.error("Error adding product:", error);
      toast.error(error?.message || t("general.error"));
    }
  };

  const handleUpdateProduct = async () => {
    if (!editingProduct || !name || !price || !originalPrice || !quantity) {
      toast.error(t("merchant.fillAllFields"));
      return;
    }

    try {
      await updateProduct(shop.id, editingProduct.id, {
        name,
        price: Number(price),
        originalPrice: Number(originalPrice),
        quantity: Number(quantity),
        pickupWindow,
        description,
      });

      toast.success(t("merchant.productUpdated"));
      resetForm();
      setEditingProduct(null);
    } catch (error: any) {
      console.error("Error updating product:", error);
      toast.error(error?.message || t("general.error"));
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      await deleteProduct(shop.id, productId);
      toast.success(t("merchant.productDeleted"));
    } catch (error: any) {
      console.error("Error deleting product:", error);
      toast.error(error?.message || t("general.error"));
    }
  };

  const openEditForm = (product: MysteryBox) => {
    setEditingProduct(product);
    setName(product.name);
    setPrice(String(product.price));
    setOriginalPrice(String(product.originalPrice));
    setQuantity(String(product.quantity));
    setPickupWindow(product.pickupWindow);
    setDescription(product.description);
  };

  const handleQuantityClick = (product: MysteryBox) => {
    setEditingQuantity(product.id);
    setTempQuantity(String(product.quantity));
  };

  const handleQuantityChange = async (productId: string, delta: number) => {
    const product = shop.inventory.find(p => p.id === productId);
    if (!product) return;
    
    const newQuantity = Math.max(0, product.quantity + delta);
    try {
      await updateProduct(shop.id, productId, { quantity: newQuantity });
    } catch (error: any) {
      toast.error(error?.message || t("general.error"));
    }
  };

  const handleQuantitySave = async (productId: string) => {
    const newQty = parseInt(tempQuantity);
    if (isNaN(newQty) || newQty < 0) {
      toast.error(t("merchant.invalidQuantity"));
      setEditingQuantity(null);
      return;
    }
    
    try {
      await updateProduct(shop.id, productId, { quantity: newQty });
      toast.success(t("merchant.productUpdated"));
    } catch (error: any) {
      toast.error(error?.message || t("general.error"));
    }
    setEditingQuantity(null);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-KZ", {
      style: "currency",
      currency: "KZT",
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="space-y-4">
      {/* Add Product Button */}
      <Button
        onClick={() => setShowAddForm(true)}
        className="w-full h-14 rounded-xl font-semibold"
      >
        <Plus className="h-5 w-5 mr-2" />
        {t("merchant.addBox")}
      </Button>

      {/* Products List */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {shop.inventory.map((product) => (
            <motion.div
              key={product.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="p-4 rounded-2xl border-2 border-border bg-card"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Package className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold">{product.name}</h3>
                    <p className="text-sm text-muted-foreground">{product.description}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openEditForm(product)}
                    className="p-2 rounded-lg bg-secondary"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(product.id)}
                    className="p-2 rounded-lg bg-destructive/10 text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div>
                    <span className="text-lg font-bold text-primary">
                      {formatPrice(product.price)}
                    </span>
                    <span className="ml-2 text-sm text-muted-foreground line-through">
                      {formatPrice(product.originalPrice)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {product.pickupWindow}
                  </div>
                </div>
                
                {/* Editable Quantity */}
                {editingQuantity === product.id ? (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        const newQty = Math.max(0, parseInt(tempQuantity) - 1);
                        setTempQuantity(String(newQty));
                      }}
                      className="p-1.5 rounded-lg bg-secondary"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <input
                      type="number"
                      value={tempQuantity}
                      onChange={(e) => setTempQuantity(e.target.value)}
                      onBlur={() => handleQuantitySave(product.id)}
                      onKeyDown={(e) => e.key === 'Enter' && handleQuantitySave(product.id)}
                      className="w-12 text-center bg-secondary rounded-lg py-1 font-semibold text-sm"
                      autoFocus
                    />
                    <button
                      onClick={() => {
                        const newQty = parseInt(tempQuantity) + 1;
                        setTempQuantity(String(newQty));
                      }}
                      className="p-1.5 rounded-lg bg-secondary"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleQuantityClick(product)}
                    className="px-3 py-1 rounded-full bg-secondary font-semibold text-sm hover:bg-secondary/80 transition-colors cursor-pointer"
                  >
                    {product.quantity} {t("merchant.left")}
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {shop.inventory.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>{t("merchant.noProducts")}</p>
          </div>
        )}
      </div>

      {/* Add/Edit Product Dialog */}
      <Dialog 
        open={showAddForm || !!editingProduct} 
        onOpenChange={(open) => {
          if (!open) {
            setShowAddForm(false);
            setEditingProduct(null);
            resetForm();
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? t("merchant.editBox") : t("merchant.addBox")}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>{t("merchant.boxName")}</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t("merchant.boxNamePlaceholder")}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("merchant.newPrice")}</Label>
                <Input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="1200"
                />
              </div>
              <div className="space-y-2">
                <Label>{t("merchant.originalPrice")}</Label>
                <Input
                  type="number"
                  value={originalPrice}
                  onChange={(e) => setOriginalPrice(e.target.value)}
                  placeholder="3500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("merchant.quantity")}</Label>
                <Input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="5"
                />
              </div>
              <div className="space-y-2">
                <Label>{t("merchant.pickupTime")}</Label>
                <Input
                  value={pickupWindow}
                  onChange={(e) => setPickupWindow(e.target.value)}
                  placeholder="18:00 - 21:00"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t("merchant.description")}</Label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t("merchant.descriptionPlaceholder")}
              />
            </div>

            <Button
              onClick={editingProduct ? handleUpdateProduct : handleAddProduct}
              className="w-full h-12 rounded-xl font-semibold"
            >
              {editingProduct ? t("merchant.updateBox") : t("merchant.createBox")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}