
# Fix Multiple Core Features

## Issues Found

### 1. Basket System Not Connected (Critical)
The `BasketDrawer` component exists but is **never rendered** anywhere in the app. The "Basket" button in `BottomSheet.tsx` navigates to `/orders` (order history) instead of opening the basket drawer.

### 2. Missing Database Columns
The `shops` table is missing two columns that the app tries to use:
- **`address`** - Used in AddLocationModal and ProfileTab
- **`category`** - Used in ProfileTab for shop categorization

### 3. AddLocationModal Incomplete
The `MarketplaceContext.addShop()` function doesn't include the `address` field in the database insert.

### 4. Add Location Button Placement
Currently appears in the MerchantDashboard header. Should only appear in the Profile tab.

---

## Changes Required

### Phase 1: Database Schema Update

Add missing columns to `shops` table:

```sql
ALTER TABLE public.shops 
ADD COLUMN IF NOT EXISTS address text,
ADD COLUMN IF NOT EXISTS category text DEFAULT 'bakery';
```

### Phase 2: Connect Basket System

**File: `src/pages/MapPage.tsx`**
- Import `BasketDrawer` component
- Add `basketOpen` state
- Render `BasketDrawer` with proper props
- Pass `onBasketClick` handler to `BottomSheet`

**File: `src/components/BottomSheet.tsx`**
- Add `onBasketClick` prop to interface
- Change basket button from `navigate("/orders")` to `onBasketClick?.()`
- Add item count badge using `useBasket().itemCount`

### Phase 3: Fix MarketplaceContext

**File: `src/contexts/MarketplaceContext.tsx`**

Update `addShop` function to include address and category:
```tsx
const { data, error } = await supabase
  .from("shops")
  .insert({
    name: newShop.name,
    lat: newShop.lat,
    long: newShop.long,
    image_url: newShop.image_url,
    description: newShop.description,
    owner_id: newShop.owner_id,
    address: newShop.address,      // ADD
    category: newShop.category,    // ADD
  })
```

Update `updateShop` function to include address and category:
```tsx
if (updates.address !== undefined) updateData.address = updates.address;
if (updates.category !== undefined) updateData.category = updates.category;
```

### Phase 4: Move Add Location Button

**File: `src/pages/MerchantDashboard.tsx`**
- Remove the "Add location" button from header (lines 125-132)
- Pass `onAddLocation` prop to ProfileTab

**File: `src/components/merchant/ProfileTab.tsx`**
- Add `onAddLocation?: () => void` prop
- Add "Add Location" button at bottom of the component

---

## Summary of File Changes

| File | Change |
|------|--------|
| Database Migration | Add `address` and `category` columns to `shops` |
| `src/pages/MapPage.tsx` | Import BasketDrawer, add state, connect to BottomSheet |
| `src/components/BottomSheet.tsx` | Change basket button to callback, add item count badge |
| `src/contexts/MarketplaceContext.tsx` | Add address/category to addShop and updateShop |
| `src/pages/MerchantDashboard.tsx` | Remove header button, pass onAddLocation to ProfileTab |
| `src/components/merchant/ProfileTab.tsx` | Add onAddLocation prop and button |

---

## Expected Result After Fix

1. Users can add items to basket and see them in the basket drawer
2. Basket button shows item count badge
3. Merchants can add new locations with address that saves to database
4. Merchants can update shop category and address
5. "Add location" button only appears in Profile tab
