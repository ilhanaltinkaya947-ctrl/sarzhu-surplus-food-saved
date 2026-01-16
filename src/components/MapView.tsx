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

// Category detection from shop name/description
const detectCategory = (name: string, description: string | null): 'bakery' | 'coffee' | 'grocery' | 'default' => {
  const text = `${name} ${description || ''}`.toLowerCase();
  if (text.includes('bakery') || text.includes('bread') || text.includes('pastry') || text.includes('cake') || text.includes('пекарня')) {
    return 'bakery';
  }
  if (text.includes('coffee') || text.includes('café') || text.includes('cafe') || text.includes('кофе') || text.includes('espresso')) {
    return 'coffee';
  }
  if (text.includes('grocery') || text.includes('market') || text.includes('fresh') || text.includes('organic') || text.includes('магазин')) {
    return 'grocery';
  }
  return 'default';
};

// Category styling configs
const categoryStyles = {
  bakery: { bg: '#F97316', icon: `<text x="12" y="17" font-size="14" text-anchor="middle">🥐</text>` },
  coffee: { bg: '#78350F', icon: `<text x="12" y="17" font-size="14" text-anchor="middle">☕</text>` },
  grocery: { bg: '#16A34A', icon: `<text x="12" y="17" font-size="14" text-anchor="middle">🥦</text>` },
  default: { bg: '#3D8B5F', icon: `<svg viewBox="0 0 24 24" width="16" height="16" fill="white"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9,22 9,12 15,12 15,22" fill="#3D8B5F" stroke="white" stroke-width="1.5"/></svg>` },
};

const createPinIcon = (isFollowed: boolean, imageUrl: string | null, shopName: string, shopDescription: string | null) => {
  const primaryColor = isFollowed ? "#F59E0B" : "#3D8B5F";
  const glowColor = isFollowed ? "rgba(245, 158, 11, 0.4)" : "rgba(61, 139, 95, 0.3)";
  const hasValidImage = imageUrl && imageUrl.trim() !== '';
  const category = detectCategory(shopName, shopDescription);
  const catStyle = categoryStyles[category];
  
  // Fallback content when no image
  const fallbackContent = `
    <div style="
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: ${catStyle.bg};
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <svg width="24" height="24" viewBox="0 0 24 24">${catStyle.icon}</svg>
    </div>
  `;

  // Image content with onerror fallback
  const imageContent = `
    <img 
      src="${imageUrl}" 
      alt="${shopName}"
      class="pin-logo"
      style="
        width: 44px;
        height: 44px;
        border-radius: 50%;
        object-fit: cover;
      "
      onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
    />
    <div class="pin-fallback" style="
      display: none;
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: ${catStyle.bg};
      align-items: center;
      justify-content: center;
    ">
      <svg width="24" height="24" viewBox="0 0 24 24">${catStyle.icon}</svg>
    </div>
  `;
  
  return L.divIcon({
    className: "custom-pin",
    html: `
      <div class="pin-container" style="
        position: relative;
        width: 60px;
        height: 68px;
        display: flex;
        align-items: flex-start;
        justify-content: center;
        filter: drop-shadow(0 4px 8px rgba(0,0,0,0.3));
      ">
        <!-- Pulse ring for followed shops -->
        ${isFollowed ? `
          <div style="
            position: absolute;
            top: 2px;
            width: 56px;
            height: 56px;
            border-radius: 50%;
            background: ${glowColor};
            animation: pulse-ring 2s ease-out infinite;
          "></div>
        ` : ''}
        
        <!-- Main pin circle with logo -->
        <div class="pin-main" style="
          position: relative;
          width: 52px;
          height: 52px;
          border-radius: 50%;
          background: white;
          box-shadow: 0 0 0 3px ${primaryColor}, 0 6px 20px -4px rgba(0,0,0,0.35);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        ">
          ${hasValidImage ? imageContent : fallbackContent}
          
          <!-- Followed badge -->
          ${isFollowed ? `
            <div style="
              position: absolute;
              top: -3px;
              right: -3px;
              width: 20px;
              height: 20px;
              border-radius: 50%;
              background: linear-gradient(135deg, #F59E0B, #D97706);
              border: 2px solid white;
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 2px 6px rgba(0,0,0,0.2);
            ">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="white">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
          ` : ''}
        </div>
        
        <!-- Bottom pointer -->
        <div style="
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 0;
          border-left: 10px solid transparent;
          border-right: 10px solid transparent;
          border-top: 12px solid ${primaryColor};
        "></div>
      </div>
    `,
    iconSize: [60, 68],
    iconAnchor: [30, 68],
    popupAnchor: [0, -60],
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

    // Initialize map with fast, responsive 2GIS-like physics
    const map = L.map(mapContainerRef.current, {
      center: CENTER,
      zoom: DEFAULT_ZOOM,
      zoomControl: false,
      // ANIMATION SPEED - Fast & snappy
      zoomAnimation: true,
      markerZoomAnimation: true,
      // MAP PHYSICS - Heavy friction for sharp stops
      inertia: true,
      inertiaDeceleration: 10000,
      inertiaMaxSpeed: 1500,
      easeLinearity: 0.25,
      // ZOOM PHYSICS - Tight & responsive
      zoomSnap: 0.5,
      zoomDelta: 1,
      wheelPxPerZoomLevel: 60,
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
        icon: createPinIcon(isFollowed, shop.image_url, shop.name, shop.description),
      }).addTo(mapRef.current!);

      // Click to open drawer instead of popup
      marker.on("click", () => {
        onShopClick?.(shop);
      });
    });
  }, [shops, bags, followedShopIds, onShopClick]);

  // Expose flyTo for external use - fast 0.6s animation
  const flyToShop = (lat: number, long: number) => {
    if (mapRef.current) {
      mapRef.current.flyTo([lat, long], 17, {
        duration: 0.6,
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
        .custom-pin:hover .pin-container > div:nth-child(2) {
          transform: scale(1.1);
          box-shadow: 0 4px 16px -2px rgba(0,0,0,0.25), 0 0 0 3px currentColor;
        }
        @keyframes pulse-ring {
          0% {
            transform: scale(0.8);
            opacity: 1;
          }
          100% {
            transform: scale(1.4);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
