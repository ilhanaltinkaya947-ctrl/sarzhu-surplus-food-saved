
# Fix User Section Issues

## Overview
This plan addresses four issues in the user section:
1. Merchant bottom tabs text getting cut off (visible in screenshot with "Профі" truncated)
2. Basket items not appearing when adding from different locations
3. "Item added to basket" notification staying on screen too long
4. Remove "Slide to confirm pickup" feature from user-facing orders page (keep it only for merchants)

---

## Changes

### 1. Fix Merchant Tabs Layout
**File:** `src/components/merchant/MerchantTabs.tsx`

The tabs text is getting cut off because of limited space with 5 tabs. Will optimize by:
- Reducing padding between tabs
- Using smaller font size for labels
- Adding `truncate` class to prevent text overflow
- Ensuring icons and text fit properly on narrow screens

### 2. Reduce Toast Notification Duration
**File:** `src/components/ui/sonner.tsx`

The Sonner toaster currently uses default duration (4 seconds). Will reduce to 2 seconds for a cleaner UX by adding:
```typescript
duration={2000}
```

### 3. Remove "Slide to Confirm Pickup" from User Orders
**Files:** 
- `src/components/orders/TicketCard.tsx`
- `src/pages/OrdersPage.tsx`

The swipe-to-confirm feature should only be available to merchants in their dashboard. For users, orders will simply show:
- Active orders with status and pickup time window
- A simple "View Details" or informational display instead of the swipe action
- The merchant dashboard already has its own `SwipeButton` component for order confirmation

Changes:
- Remove `SwipeToConfirm` import and usage from `TicketCard.tsx`
- Replace swipe action with a read-only status display for users
- Keep the order card design but remove the interactive confirmation element

### 4. Verify Basket Functionality
**File:** `src/contexts/BasketContext.tsx`

The current basket implementation stores items in React state, which should work correctly. However, will review and ensure:
- Items from different shops/locations can be added (already supported - no shop restriction exists)
- The `addItem` function properly compares `bag.id` to prevent duplicates
- Toast notifications are triggered correctly

After reviewing the code, the basket logic appears correct. The issue the user is experiencing may be related to:
- App state reset during navigation
- Browser refresh clearing the state
- Or a specific edge case that needs testing

---

## Technical Details

### MerchantTabs Changes
```tsx
// Reduce padding and font size for better fit
<button className={cn(
  "flex flex-col items-center gap-0.5 px-2 py-2 rounded-xl transition-all min-w-0",
  // ... active states
)}>
  <Icon className={cn("h-5 w-5 flex-shrink-0", isActive && "scale-110")} />
  <span className="text-[10px] font-medium truncate max-w-full">{t(tab.labelKey)}</span>
</button>
```

### Sonner Configuration
```tsx
<Sonner
  duration={2000}
  // ... other props
/>
```

### TicketCard User View
For active orders, instead of swipe-to-confirm:
```tsx
{order.status === "reserved" ? (
  <div className="p-4 text-center">
    <span className="text-sm text-muted-foreground">
      Show your order code to the staff when picking up
    </span>
  </div>
) : (
  // completed order display
)}
```

---

## Summary of File Changes

| File | Action |
|------|--------|
| `src/components/merchant/MerchantTabs.tsx` | Optimize tab layout for narrow screens |
| `src/components/ui/sonner.tsx` | Add `duration={2000}` to reduce notification time |
| `src/components/orders/TicketCard.tsx` | Remove SwipeToConfirm, show informational text instead |
| `src/pages/OrdersPage.tsx` | Remove unused `handleConfirmPickup` function and related state |

