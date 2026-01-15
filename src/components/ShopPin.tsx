import { Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { ShopCard } from "./ShopCard";

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
  quantity_available: number;
  original_price: number;
  discounted_price: number;
}

interface ShopPinProps {
  shop: Shop;
  bag?: MysteryBag;
  isFollowed?: boolean;
}

const createPinIcon = (isFollowed: boolean) => {
  const color = isFollowed ? "#EAB308" : "#3D8B5F";
  const shadowColor = isFollowed ? "#CA8A04" : "#2D6A4F";
  
  return L.divIcon({
    className: "custom-pin",
    html: `
      <div style="position: relative; width: 40px; height: 50px;">
        <svg width="40" height="50" viewBox="0 0 40 50" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 0C8.954 0 0 8.954 0 20c0 15 20 30 20 30s20-15 20-30C40 8.954 31.046 0 20 0z" fill="${color}" stroke="${shadowColor}" stroke-width="2"/>
          <circle cx="20" cy="18" r="8" fill="white" fill-opacity="0.9"/>
          ${isFollowed ? `<path d="M20 12l1.5 3 3.5.5-2.5 2.5.5 3.5-3-1.5-3 1.5.5-3.5-2.5-2.5 3.5-.5z" fill="${color}"/>` : `<circle cx="20" cy="18" r="4" fill="${color}"/>`}
        </svg>
      </div>
    `,
    iconSize: [40, 50],
    iconAnchor: [20, 50],
    popupAnchor: [0, -45],
  });
};

export function ShopPin({ shop, bag, isFollowed = false }: ShopPinProps) {
  return (
    <Marker
      position={[shop.lat, shop.long]}
      icon={createPinIcon(isFollowed)}
    >
      <Popup className="shop-popup" closeButton={false}>
        <ShopCard shop={shop} bag={bag} isFollowed={isFollowed} compact />
      </Popup>
    </Marker>
  );
}
