import { MapContainer, TileLayer, ZoomControl } from "react-leaflet";
import { ShopPin } from "./ShopPin";
import "leaflet/dist/leaflet.css";

interface Shop {
  id: string;
  name: string;
  lat: number;
  long: number;
  image_url: string | null;
  description: string | null;
}

interface MysteryBag {
  id: string;
  shop_id: string;
  quantity_available: number;
  original_price: number;
  discounted_price: number;
}

interface MapViewProps {
  shops: Shop[];
  bags: MysteryBag[];
  followedShopIds?: string[];
}

// Panfilov Street, Almaty coordinates
const CENTER: [number, number] = [43.25654, 76.94421];
const DEFAULT_ZOOM = 15;

export function MapView({ shops, bags, followedShopIds = [] }: MapViewProps) {
  const getBagForShop = (shopId: string) => {
    return bags.find((bag) => bag.shop_id === shopId);
  };

  return (
    <div className="absolute inset-0">
      <MapContainer
        center={CENTER}
        zoom={DEFAULT_ZOOM}
        zoomControl={false}
        className="h-full w-full"
        style={{ background: "hsl(var(--muted))" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ZoomControl position="topright" />
        
        {shops.map((shop) => (
          <ShopPin
            key={shop.id}
            shop={shop}
            bag={getBagForShop(shop.id)}
            isFollowed={followedShopIds.includes(shop.id)}
          />
        ))}
      </MapContainer>
    </div>
  );
}
