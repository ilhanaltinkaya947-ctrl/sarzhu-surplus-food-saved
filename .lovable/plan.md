
# Fix Text Overlap and Replace Eco Banner with "Place of the Month"

## Problems Identified

1. **Sticky Header Text Overlap**: The header in the expanded bottom sheet (line 341 in `BottomSheet.tsx`) uses `bg-card` which may have transparency issues. When scrolling, text from below bleeds through.

2. **Explore Deals Button Not Working**: The `MarketingBanner` component in `FoodCard.tsx` has a static div styled as a button but no click handler.

3. **Replace Eco Initiative**: User wants a "Place of the Month" feature card instead of the eco initiative banner.

---

## Solution

### 1. Fix Sticky Header Overlap

Update the sticky header styles in `BottomSheet.tsx` to ensure full opacity and proper layering:

- Change from `bg-card` to `bg-card/100` or use a solid background
- Add stronger `backdrop-blur-md` for extra safety
- Ensure `z-10` stacking is sufficient

**File**: `src/components/BottomSheet.tsx`  
**Location**: Line 341

```text
Current:
sticky top-0 bg-card py-3 -mx-4 px-4 z-10 border-b border-border/50 backdrop-blur-sm

Fixed:
sticky top-0 bg-background py-3 -mx-4 px-4 z-10 border-b border-border shadow-sm
```

### 2. Replace MarketingBanner with FeaturedShopBanner

Create a new `FeaturedShopBanner` component that:
- Displays a "Shop of the Month" or "Featured Shop"
- Shows the shop image, name, and a highlight (e.g., discount, rating)
- Has an "Explore Shop" button that triggers `onShopClick`

**File**: `src/components/FoodCard.tsx`  
**Changes**: Replace `MarketingBanner` with `FeaturedShopBanner`

```typescript
interface FeaturedShopBannerProps {
  className?: string;
  shop?: {
    id: string;
    name: string;
    image_url: string | null;
    description: string | null;
  };
  onExplore?: () => void;
}

export function FeaturedShopBanner({ className, shop, onExplore }: FeaturedShopBannerProps) {
  // Shows "Place of the Month" with shop image
  // Clickable "Explore Shop" button calls onExplore
}
```

### 3. Update BottomSheet to Pass Shop Data

**File**: `src/components/BottomSheet.tsx`

- Select a featured shop from the `filteredShops` array (first shop, or random selection)
- Pass the shop and click handler to `FeaturedShopBanner`
- When "Explore Shop" is clicked, call `onShopClick(featuredShop)`

```typescript
// Select featured shop
const featuredShop = filteredShops[0];

// Replace MarketingBanner
<FeaturedShopBanner 
  className="mb-5" 
  shop={featuredShop}
  onExplore={() => featuredShop && onShopClick?.(featuredShop)}
/>
```

### 4. Add Translations

**File**: `src/contexts/LanguageContext.tsx`

Add translation keys for all three languages:

| Key | English | Russian | Kazakh |
|-----|---------|---------|--------|
| `featured.placeOfMonth` | Place of the Month | Место месяца | Айдың орны |
| `featured.exploreShop` | Explore Shop | Посмотреть | Қарау |
| `featured.topRated` | Top Rated | Лучший рейтинг | Жоғары рейтинг |

---

## Technical Summary

| File | Change |
|------|--------|
| `src/components/BottomSheet.tsx` | Fix sticky header background; use `FeaturedShopBanner` with shop data |
| `src/components/FoodCard.tsx` | Replace `MarketingBanner` with new `FeaturedShopBanner` component |
| `src/contexts/LanguageContext.tsx` | Add 3 new translation keys for EN, RU, KZ |

---

## Visual Preview

```text
+----------------------------------+
|  ★ PLACE OF THE MONTH            |
|  ┌─────────────────────────────┐ |
|  │  [Shop Image]               │ |
|  │                             │ |
|  │  Panfilov Bakery            │ |
|  │  ⭐ Top Rated                │ |
|  │                             │ |
|  │  [ Explore Shop → ]         │ |
|  └─────────────────────────────┘ |
+----------------------------------+
```

The banner will feature the first shop from the current category filter, with a working button that opens that shop's drawer.
