import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { isShopCurrentlyOpen } from "@/lib/shopUtils";

interface Shop {
  id: string;
  name: string;
  lat: number;
  long: number;
  image_url: string | null;
  description: string | null;
  opening_time?: string | null;
  closing_time?: string | null;
  days_open?: string[] | null;
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
  selectedShopId?: string | null;
  onShopClick?: (shop: Shop) => void;
}

// Panfilov Street, Almaty coordinates
const CENTER: [number, number] = [43.25654, 76.94421];
const DEFAULT_ZOOM = 15;

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

const createPinIcon = (
  isFollowed: boolean, 
  imageUrl: string | null, 
  shopName: string, 
  shopDescription: string | null, 
  isActive: boolean = false,
  isClosed: boolean = false
) => {
  // Consistent gold theme colors
  const defaultBorderColor = isClosed ? "#9CA3AF" : "#FFFFFF";
  const activeBorderColor = "#FFB800"; // Yorkie Gold
  const hasValidImage = imageUrl && imageUrl.trim() !== '';
  const category = detectCategory(shopName, shopDescription);
  const catStyle = categoryStyles[category];
  
  // State-based styling
  const scale = isActive ? 'scale(1.3)' : 'scale(1)';
  const borderColor = isActive ? activeBorderColor : defaultBorderColor;
  const borderWidth = isActive ? '4px' : '3px';
  const pointerColor = isActive ? activeBorderColor : (isClosed ? "#9CA3AF" : "#1E293B"); // Gray for closed
  const shadowStyle = isActive 
    ? `0 4px 20px -2px #FFB80080, 0 0 0 4px #FFB80033` 
    : '0 4px 12px -2px rgba(0,0,0,0.3)';
  const animationClass = isActive ? 'pin-active-pulse' : '';
  const grayscaleFilter = isClosed ? 'grayscale(1) opacity(0.6)' : 'none';
  
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
        background: transparent;
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
  
  // Heart badge for favorites (always visible on favorited shops)
  const heartBadge = isFollowed ? `
    <div style="
      position: absolute;
      top: -4px;
      right: -4px;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: #EF4444;
      border: 2px solid white;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      z-index: 10;
    ">
      <svg width="10" height="10" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="1">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
      </svg>
    </div>
  ` : '';
  
  return L.divIcon({
    className: `custom-pin ${animationClass}`,
    html: `
      <div class="pin-wrapper" style="
        position: relative;
        width: 60px;
        height: 68px;
        display: flex;
        align-items: flex-start;
        justify-content: center;
        transform: ${scale};
        transform-origin: bottom center;
        transition: transform 0.25s ease;
        filter: ${grayscaleFilter};
      ">
        <!-- Main pin circle with logo -->
        <div class="pin-main map-marker-container" style="
          position: relative;
          width: 52px;
          height: 52px;
          border-radius: 50%;
          background: white;
          border: ${borderWidth} solid ${borderColor};
          box-shadow: ${shadowStyle};
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: visible;
          transition: all 0.25s ease;
        ">
          <div style="
            width: 44px;
            height: 44px;
            border-radius: 50%;
            overflow: hidden;
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            ${hasValidImage ? imageContent : fallbackContent}
          </div>
          
          <!-- Heart badge for favorites -->
          ${heartBadge}
        </div>
        
        <!-- Bottom pointer -->
        <div class="map-marker-arrow" style="
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 0;
          border-left: 10px solid transparent;
          border-right: 10px solid transparent;
          border-top: 12px solid ${pointerColor};
          transition: border-color 0.25s ease;
        "></div>
      </div>
    `,
    iconSize: [60, 68],
    iconAnchor: [30, 68],
    popupAnchor: [0, -60],
  });
};

export function MapView({ shops, bags, followedShopIds = [], selectedShopId, onShopClick }: MapViewProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());

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

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update markers when shops or selection change
  useEffect(() => {
    if (!mapRef.current) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => {
      mapRef.current?.removeLayer(marker);
    });
    markersRef.current.clear();

    // Add markers for each shop
    shops.forEach((shop) => {
      const isFollowed = followedShopIds.includes(shop.id);
      const isActive = selectedShopId === shop.id;
      const isClosed = !isShopCurrentlyOpen(shop.opening_time, shop.closing_time, shop.days_open);
      
      const marker = L.marker([shop.lat, shop.long], {
        icon: createPinIcon(isFollowed, shop.image_url, shop.name, shop.description, isActive, isClosed),
        zIndexOffset: isActive ? 1000 : (isClosed ? -100 : 0),
      }).addTo(mapRef.current!);

      // Store marker reference
      markersRef.current.set(shop.id, marker);

      // Single click: flyTo + open drawer
      marker.on("click", () => {
        // Fly to the shop location
        mapRef.current?.flyTo([shop.lat, shop.long], 17, {
          duration: 0.6,
          easeLinearity: 0.25,
        });
        // Open the drawer
        onShopClick?.(shop);
      });
    });
  }, [shops, bags, followedShopIds, selectedShopId, onShopClick]);

  return (
    <div className="absolute inset-0 z-0">
      <div 
        ref={mapContainerRef} 
        className="h-full w-full"
        style={{ background: "hsl(var(--muted))" }}
      />
      <style>{`
        /* Remove all default Leaflet marker backgrounds */
        .leaflet-marker-icon {
          background: transparent !important;
          border: none !important;
        }
        .leaflet-marker-shadow {
          display: none !important;
        }
        .custom-pin {
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
        }
        .custom-pin > * {
          background: transparent !important;
        }
        /* Disable default tooltips/titles */
        .leaflet-tooltip {
          display: none !important;
        }
        /* Active pin pulsing shadow animation - Gold theme */
        .pin-active-pulse .pin-main {
          animation: active-pulse 1.5s ease-in-out infinite;
        }
        @keyframes active-pulse {
          0%, 100% {
            box-shadow: 0 4px 20px -2px #FFB80080, 0 0 0 4px #FFB80033;
          }
          50% {
            box-shadow: 0 4px 25px -2px #FFB800B3, 0 0 0 8px #FFB8001A;
          }
        }
      `}</style>
    </div>
  );
}
