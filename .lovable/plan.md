
# Fix Content Scrolling Above Sticky Header

## Problem Analysis

Looking at the current structure in `BottomSheet.tsx` (lines 329-380):

```
ScrollContainer (overflow-y-auto)
  └── Content wrapper
       ├── Sticky Header "Лучшие предложения" (z-10)
       ├── FeaturedShopBanner ← scrolls ON TOP of header ❌
       └── FoodCards grid ← scrolls ON TOP of header ❌
```

The content is appearing **above** the sticky header when scrolling because:
1. The z-index of the content below isn't explicitly lower than the header
2. Both elements are in the same stacking context without proper layering

## Solution

Force the scrollable content to be in a **lower stacking context** than the sticky header:

### File: `src/components/BottomSheet.tsx`

**Change 1**: Make the sticky header create an isolated stacking context with `isolate` and higher z-index

```css
/* Line 341 - Current */
sticky top-0 bg-background py-3 -mx-4 px-4 z-10 border-b border-border shadow-sm

/* Fixed */
sticky top-0 bg-background py-3 -mx-4 px-4 z-20 border-b border-border shadow-sm isolate
```

**Change 2**: Wrap the content below the header in a `relative z-0` container to force it into a lower stacking layer

```tsx
{/* Content below header - wrapped in z-0 container */}
<div className="relative z-0">
  <FeaturedShopBanner ... />
  <div className="grid grid-cols-2 gap-3">
    {filteredShops.map(...)}
  </div>
</div>
```

## Visual Result

```
ScrollContainer
  └── Content wrapper
       ├── Sticky Header (z-20, isolate) ← stays on top ✓
       └── Content Container (z-0)
            ├── FeaturedShopBanner ← scrolls UNDER header ✓
            └── FoodCards grid ← scrolls UNDER header ✓
```

## Technical Summary

| Line | Change |
|------|--------|
| 341 | Add `z-20 isolate` to sticky header classes |
| 348-378 | Wrap FeaturedShopBanner and grid in `<div className="relative z-0">` |

This ensures proper CSS stacking context where the header is in a higher layer (z-20) and content is explicitly in a lower layer (z-0), preventing overlap during scroll.
