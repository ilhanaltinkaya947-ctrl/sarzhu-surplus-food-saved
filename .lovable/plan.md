
# Business Hours & Multi-Location Management for Merchants

## Status: ✅ IMPLEMENTED

## Overview

This plan adds two major features that will significantly improve merchant experience and make the app more professional for App Store approval:

1. **✅ Automatic Opening Hours** - Shops auto-show as "closed" based on time, no manual toggle needed
2. **✅ Multi-Location Support** - One merchant account can manage multiple shop locations

---

## Feature 1: Automatic Business Hours

### How It Works

Instead of manually toggling "Open/Closed", merchants set their weekly schedule once. The app automatically:
- Shows shops as **available** (full color) during open hours
- Shows shops as **unavailable** (grayed out) when closed
- Customers can still see closed shops on the map but can't order from them

### Database Changes

Add new columns to `shops` table:

```sql
ALTER TABLE shops ADD COLUMN opening_time TIME DEFAULT '09:00';
ALTER TABLE shops ADD COLUMN closing_time TIME DEFAULT '21:00';
ALTER TABLE shops ADD COLUMN days_open TEXT[] DEFAULT ARRAY['mon','tue','wed','thu','fri','sat','sun'];
```

| Column | Type | Purpose |
|--------|------|---------|
| `opening_time` | TIME | Daily opening hour (e.g., 09:00) |
| `closing_time` | TIME | Daily closing hour (e.g., 21:00) |
| `days_open` | TEXT[] | Days shop operates (e.g., ['mon','tue','wed','thu','fri']) |

### UI Changes

**ProfileTab.tsx** - Replace Open/Closed toggle with:

```
+----------------------------------+
|  Business Hours                  |
|  ┌────────────┐  ┌────────────┐  |
|  │ Opens: 09:00│  │Closes: 21:00│ |
|  └────────────┘  └────────────┘  |
|                                  |
|  Days Open:                      |
|  [Mon] [Tue] [Wed] [Thu] [Fri]   |
|  [ ] Sat  [ ] Sun                |
+----------------------------------+
```

### Availability Logic

Create a helper function that runs on client-side:

```typescript
function isShopCurrentlyOpen(shop: Shop): boolean {
  const now = new Date();
  const currentDay = ['sun','mon','tue','wed','thu','fri','sat'][now.getDay()];
  const currentTime = now.toTimeString().slice(0,5); // "14:30"
  
  if (!shop.days_open?.includes(currentDay)) return false;
  if (currentTime < shop.opening_time || currentTime > shop.closing_time) return false;
  
  return true;
}
```

### Map & List Display

- **Open shops**: Normal appearance, clickable for ordering
- **Closed shops**: Grayed out marker + card, show "Opens at 09:00" badge
- Customers can tap to view details but "Reserve" button is disabled

---

## Feature 2: Multi-Location Shop Management

### How It Works

A single merchant account can own multiple shop locations:
- Same brand name, different addresses
- Separate inventory per location
- Unified orders view across all locations (or filter by location)

### Current vs New Architecture

**Current** (single shop):
```
MerchantDashboard
└── finds ONE shop by owner_id
    └── ProfileTab (edit that shop)
    └── ProductsTab (edit that shop's inventory)
    └── OrdersTab (view that shop's orders)
```

**New** (multi-location):
```
MerchantDashboard
└── Locations Tab (new!)
    └── List all owned shops
    └── Add New Location button
    └── Select active location
└── ProfileTab (edit SELECTED location)
└── ProductsTab (edit SELECTED location's inventory)
└── OrdersTab (view ALL or SELECTED location orders)
```

### UI Flow

**Header with Location Selector:**
```
+------------------------------------------+
|  ← Panfilov Bakery        ▼ [Dropdown]   |
|     Merchant Dashboard                    |
+------------------------------------------+

Dropdown shows:
┌─────────────────────────────┐
│ ✓ Panfilov Bakery - Downtown│
│   Panfilov Bakery - Airport │
│   Panfilov Bakery - Mall    │
│ ─────────────────────────── │
│ + Add New Location          │
└─────────────────────────────┘
```

### New Components

**1. LocationSelector.tsx**
- Dropdown to switch between owned shops
- "Add New Location" option that opens creation form

**2. AddLocationModal.tsx**
- Form to create new shop location with:
  - Name (can be same as existing or new brand)
  - Address (with geocoding)
  - Category
  - Business hours
  - Image

### Database Considerations

No schema changes needed - the existing `owner_id` field already supports multiple shops per user. We just need to:
1. Change frontend logic to find ALL shops by owner_id (not just first)
2. Add state management for "currently selected location"

### Orders Tab Enhancement

Add filter dropdown:
```
Orders for: [All Locations ▼]
            ├── All Locations
            ├── Downtown Branch
            └── Airport Branch
```

---

## Implementation Summary

| File | Changes |
|------|---------|
| **Database Migration** | Add `opening_time`, `closing_time`, `days_open` columns to `shops` |
| **Shop interface** | Add new fields to TypeScript type |
| **MarketplaceContext** | Add `isShopCurrentlyOpen()` helper, expose `userShops` array |
| **MerchantDashboard** | Add location selector, track `selectedShop` state |
| **ProfileTab** | Replace toggle with time pickers and day checkboxes |
| **ProductsTab** | Works as-is (receives selected shop) |
| **OrdersTab** | Add location filter dropdown |
| **MapView/BottomSheet** | Gray out closed shops, show "Opens at X" badge |
| **ShopDrawer** | Disable Reserve button if shop closed |
| **LanguageContext** | Add ~20 new translation keys |

---

## New Translation Keys

| Key | EN | RU | KZ |
|-----|----|----|-----|
| `merchant.businessHours` | Business Hours | Часы работы | Жумыс уакыты |
| `merchant.opensAt` | Opens | Открытие | Ашылу |
| `merchant.closesAt` | Closes | Закрытие | Жабылу |
| `merchant.daysOpen` | Days Open | Рабочие дни | Жумыс кундері |
| `merchant.allLocations` | All Locations | Все точки | Барлык орындар |
| `merchant.addLocation` | Add Location | Добавить точку | Орын косу |
| `merchant.selectLocation` | Select Location | Выбрать точку | Орын тандау |
| `shop.currentlyClosed` | Currently Closed | Сейчас закрыто | Казір жабык |
| `shop.opensAt` | Opens at {time} | Открывается в {time} | {time} ашылады |

---

## Benefits for App Store Approval

1. **Professional merchant tools** - Comparable to major food delivery apps
2. **Scalability** - Supports franchise/chain businesses
3. **User experience** - No confusing "open" shops that are actually closed
4. **Reduced manual work** - Set once, forget about daily toggles

---

## Visual Summary

```text
┌─────────────────────────────────────┐
│  MERCHANT DASHBOARD (Multi-Location) │
├─────────────────────────────────────┤
│  [Downtown ▼] ← Location selector    │
├─────────────────────────────────────┤
│  PROFILE TAB                         │
│  ┌─────────────────────────────────┐ │
│  │ Business Hours                  │ │
│  │ Opens: [09:00]  Closes: [21:00] │ │
│  │                                 │ │
│  │ Days: [M][T][W][T][F][ ][ ]     │ │
│  └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│  PRODUCTS TAB                        │
│  (Inventory for selected location)   │
├─────────────────────────────────────┤
│  ORDERS TAB                          │
│  Filter: [All Locations ▼]           │
│  (Shows orders across all or one)    │
└─────────────────────────────────────┘
```
