import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BusinessHours } from "@/lib/shopUtils";

export interface MysteryBox {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
  quantity: number;
  description: string;
  pickupWindow: string;
}

export interface Shop {
  id: string;
  name: string;
  lat: number;
  long: number;
  image_url: string | null;
  description: string | null;
  category?: string;
  address?: string;
  isOpen: boolean;
  owner_id?: string | null;
  inventory: MysteryBox[];
  // Business hours
  opening_time?: string | null;
  closing_time?: string | null;
  days_open?: string[] | null;
  business_hours?: BusinessHours | null;
}

interface MarketplaceContextType {
  shops: Shop[];
  loading: boolean;
  addShop: (newShop: Omit<Shop, "id" | "inventory" | "isOpen">) => Promise<Shop | null>;
  updateShop: (shopId: string, updates: Partial<Shop>) => Promise<void>;
  addProduct: (shopId: string, product: Omit<MysteryBox, "id">) => Promise<void>;
  updateProduct: (shopId: string, productId: string, updates: Partial<MysteryBox>) => Promise<void>;
  deleteProduct: (shopId: string, productId: string) => Promise<void>;
  updateShopStatus: (shopId: string, isOpen: boolean) => void;
  refreshShops: () => Promise<void>;
  getShopById: (shopId: string) => Shop | undefined;
  getUserShops: (userId: string) => Shop[];
}

const MarketplaceContext = createContext<MarketplaceContextType | null>(null);

export function MarketplaceProvider({ children }: { children: ReactNode }) {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch shops and their mystery bags from Supabase
  const fetchShops = useCallback(async () => {
    try {
      const [shopsRes, bagsRes] = await Promise.all([
        supabase.from("shops").select("*"),
        supabase.from("mystery_bags").select("*"),
      ]);

      if (shopsRes.data && bagsRes.data) {
        const shopsWithInventory: Shop[] = shopsRes.data.map((shop) => {
          const shopBags = bagsRes.data.filter((bag) => bag.shop_id === shop.id);
          return {
            ...shop,
            isOpen: true, // Default to open
            opening_time: shop.opening_time || null,
            closing_time: shop.closing_time || null,
            days_open: shop.days_open || null,
            business_hours: shop.business_hours as BusinessHours | null,
            inventory: shopBags.map((bag) => ({
              id: bag.id,
              name: "Mystery Bag",
              price: bag.discounted_price,
              originalPrice: bag.original_price,
              quantity: bag.quantity_available,
              description: "Surprise selection from today's unsold items",
              pickupWindow: "18:00 - 21:00",
            })),
          };
        });
        setShops(shopsWithInventory);
      }
    } catch (error) {
      console.error("Error fetching shops:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchShops();
  }, [fetchShops]);

  // Real-time subscription for shop and bag updates
  useEffect(() => {
    const shopsChannel = supabase
      .channel("marketplace-shops")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "shops" },
        (payload) => {
          // Immediately add new shop to state without full refresh
          const newShop = payload.new as {
            id: string;
            name: string;
            lat: number;
            long: number;
            image_url: string | null;
            description: string | null;
            owner_id: string | null;
          };
          
          setShops((prev) => {
            // Avoid duplicates
            if (prev.some((s) => s.id === newShop.id)) return prev;
            return [
              ...prev,
              {
                ...newShop,
                isOpen: true,
                inventory: [],
              },
            ];
          });
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "shops" },
        (payload) => {
          const updated = payload.new as {
            id: string;
            name: string;
            lat: number;
            long: number;
            image_url: string | null;
            description: string | null;
            owner_id: string | null;
          };
          
          setShops((prev) =>
            prev.map((shop) =>
              shop.id === updated.id
                ? { ...shop, ...updated }
                : shop
            )
          );
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "shops" },
        (payload) => {
          const deleted = payload.old as { id: string };
          setShops((prev) => prev.filter((shop) => shop.id !== deleted.id));
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "mystery_bags" },
        () => fetchShops()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(shopsChannel);
    };
  }, [fetchShops]);

  const addShop = async (newShop: Omit<Shop, "id" | "inventory" | "isOpen">): Promise<Shop | null> => {
    try {
      const { data, error } = await supabase
        .from("shops")
        .insert({
          name: newShop.name,
          lat: newShop.lat,
          long: newShop.long,
          image_url: newShop.image_url,
          description: newShop.description,
          owner_id: newShop.owner_id,
          address: newShop.address,
          category: newShop.category,
        })
        .select()
        .single();

      if (error) throw error;

      const shopWithInventory: Shop = {
        ...data,
        isOpen: true,
        inventory: [],
        business_hours: data.business_hours as BusinessHours | null,
      };

      setShops((prev) => [...prev, shopWithInventory]);
      return shopWithInventory;
    } catch (error) {
      console.error("Error adding shop:", error);
      return null;
    }
  };

  const updateShop = async (shopId: string, updates: Partial<Shop>) => {
    try {
      const updateData: Record<string, unknown> = {};
      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.image_url !== undefined) updateData.image_url = updates.image_url;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.lat !== undefined) updateData.lat = updates.lat;
      if (updates.long !== undefined) updateData.long = updates.long;
      if (updates.opening_time !== undefined) updateData.opening_time = updates.opening_time;
      if (updates.closing_time !== undefined) updateData.closing_time = updates.closing_time;
      if (updates.days_open !== undefined) updateData.days_open = updates.days_open;
      if (updates.business_hours !== undefined) updateData.business_hours = updates.business_hours;
      if (updates.address !== undefined) updateData.address = updates.address;
      if (updates.category !== undefined) updateData.category = updates.category;

      const { error } = await supabase
        .from("shops")
        .update(updateData)
        .eq("id", shopId);

      if (error) throw error;

      // Optimistic update - will be confirmed by realtime subscription
      setShops((prev) =>
        prev.map((shop) => (shop.id === shopId ? { ...shop, ...updates } : shop))
      );
    } catch (error) {
      console.error("Error updating shop:", error);
      throw error;
    }
  };

  const addProduct = async (shopId: string, product: Omit<MysteryBox, "id">) => {
    const { data, error } = await supabase
      .from("mystery_bags")
      .insert({
        shop_id: shopId,
        original_price: product.originalPrice,
        discounted_price: product.price,
        quantity_available: product.quantity,
      })
      .select()
      .single();

    if (error) throw error;

    const newProduct: MysteryBox = {
      id: data.id,
      ...product,
    };

    setShops((prev) =>
      prev.map((shop) =>
        shop.id === shopId
          ? { ...shop, inventory: [...shop.inventory, newProduct] }
          : shop
      )
    );
  };

  const updateProduct = async (shopId: string, productId: string, updates: Partial<MysteryBox>) => {
    const { error } = await supabase
      .from("mystery_bags")
      .update({
        original_price: updates.originalPrice,
        discounted_price: updates.price,
        quantity_available: updates.quantity,
      })
      .eq("id", productId);

    if (error) throw error;

    setShops((prev) =>
      prev.map((shop) =>
        shop.id === shopId
          ? {
              ...shop,
              inventory: shop.inventory.map((p) =>
                p.id === productId ? { ...p, ...updates } : p
              ),
            }
          : shop
      )
    );
  };

  const deleteProduct = async (shopId: string, productId: string) => {
    const { error } = await supabase
      .from("mystery_bags")
      .delete()
      .eq("id", productId);

    if (error) throw error;

    setShops((prev) =>
      prev.map((shop) =>
        shop.id === shopId
          ? { ...shop, inventory: shop.inventory.filter((p) => p.id !== productId) }
          : shop
      )
    );
  };

  const updateShopStatus = (shopId: string, isOpen: boolean) => {
    setShops((prev) =>
      prev.map((shop) => (shop.id === shopId ? { ...shop, isOpen } : shop))
    );
  };

  const getShopById = (shopId: string) => {
    return shops.find((shop) => shop.id === shopId);
  };

  const getUserShops = (userId: string) => {
    return shops.filter((shop) => shop.owner_id === userId);
  };

  return (
    <MarketplaceContext.Provider
      value={{
        shops,
        loading,
        addShop,
        updateShop,
        addProduct,
        updateProduct,
        deleteProduct,
        updateShopStatus,
        refreshShops: fetchShops,
        getShopById,
        getUserShops,
      }}
    >
      {children}
    </MarketplaceContext.Provider>
  );
}

export function useMarketplace() {
  const context = useContext(MarketplaceContext);
  if (!context) {
    throw new Error("useMarketplace must be used within a MarketplaceProvider");
  }
  return context;
}
