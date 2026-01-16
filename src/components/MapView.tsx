import { useEffect, useRef } from "react";
import L from "leaflet";
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
  onShopClick?: (shop: Shop) => void;
}

// Panfilov Street, Almaty coordinates
const CENTER: [number, number] = [43.25654, 76.94421];
const DEFAULT_ZOOM = 15;

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("en-KZ", {
    style: "currency",
    currency: "KZT",
    maximumFractionDigits: 0,
  }).format(price);
};

const createPinIcon = (isFollowed: boolean) => {
  const color = isFollowed ? "#EAB308" : "#3D8B5F";
  const shadowColor = isFollowed ? "#CA8A04" : "#2D6A4F";
  
  return L.divIcon({
    className: "custom-pin",
    html: `
      <div style="position: relative; width: 40px; height: 50px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));">
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

const createPopupContent = (shop: Shop, bag?: MysteryBag) => {
  const discount = bag
    ? Math.round((1 - bag.discounted_price / bag.original_price) * 100)
    : 0;

  return `
    <div style="width: 220px; font-family: Inter, -apple-system, sans-serif;">
      <img 
        src="${shop.image_url || 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400'}" 
        alt="${shop.name}"
        style="width: 100%; height: 100px; object-fit: cover; border-radius: 12px 12px 0 0;"
      />
      <div style="padding: 12px;">
        <h3 style="margin: 0 0 4px 0; font-size: 14px; font-weight: 600; color: #1a1a1a;">${shop.name}</h3>
        ${bag ? `
          <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 8px;">
            <span style="font-size: 11px; color: #666;">${bag.quantity_available} left</span>
            <div>
              <span style="font-size: 11px; color: #999; text-decoration: line-through;">${formatPrice(bag.original_price)}</span>
              <span style="font-size: 14px; font-weight: 700; color: #3D8B5F; margin-left: 6px;">${formatPrice(bag.discounted_price)}</span>
            </div>
          </div>
          ${discount > 0 ? `<span style="position: absolute; top: 8px; left: 8px; background: #E53935; color: white; font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 6px;">-${discount}%</span>` : ''}
        ` : ''}
      </div>
    </div>
  `;
};

export function MapView({ shops, bags, followedShopIds = [], onShopClick }: MapViewProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  const getBagForShop = (shopId: string) => {
    return bags.find((bag) => bag.shop_id === shopId);
  };

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Initialize map with "Heavy & Smooth" 2GIS-like physics
    const map = L.map(mapContainerRef.current, {
      center: CENTER,
      zoom: DEFAULT_ZOOM,
      zoomControl: false,
      // MAP PHYSICS - "Heavy" feel
      inertia: true,
      inertiaDeceleration: 10000,
      inertiaMaxSpeed: 1500,
      easeLinearity: 0.5,
      // ZOOM SMOOTHNESS - No "jumping"
      zoomSnap: 0,
      zoomDelta: 0.5,
      wheelPxPerZoomLevel: 120,
      // TOUCH SETTINGS
      tapTolerance: 15,
      bounceAtZoomLimits: false,
      // RENDERING - Canvas for performance
      preferCanvas: true,
    } as L.MapOptions);

    // Add tile layer
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    // Add zoom control to top right
    L.control.zoom({ position: "topright" }).addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update markers when shops change
  useEffect(() => {
    if (!mapRef.current) return;

    // Clear existing markers
    mapRef.current.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        mapRef.current?.removeLayer(layer);
      }
    });

    // Add markers for each shop
    shops.forEach((shop) => {
      const isFollowed = followedShopIds.includes(shop.id);
      const bag = getBagForShop(shop.id);
      
      const marker = L.marker([shop.lat, shop.long], {
        icon: createPinIcon(isFollowed),
      }).addTo(mapRef.current!);

      // Click to open drawer instead of popup
      marker.on("click", () => {
        onShopClick?.(shop);
      });
    });
  }, [shops, bags, followedShopIds, onShopClick]);

  // Expose flyTo for external use
  const flyToShop = (lat: number, long: number) => {
    if (mapRef.current) {
      mapRef.current.flyTo([lat, long], 17, {
        duration: 1.5,
        easeLinearity: 0.25,
      });
    }
  };

  return (
    <div className="absolute inset-0 z-0">
      <div 
        ref={mapContainerRef} 
        className="h-full w-full"
        style={{ background: "hsl(var(--muted))" }}
      />
      <style>{`
        .shop-popup .leaflet-popup-content-wrapper {
          padding: 0;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 8px 30px -8px rgba(0,0,0,0.15);
        }
        .shop-popup .leaflet-popup-content {
          margin: 0;
          position: relative;
        }
        .shop-popup .leaflet-popup-tip {
          background: white;
        }
        .custom-pin {
          background: transparent !important;
          border: none !important;
        }
      `}</style>
    </div>
  );
}
