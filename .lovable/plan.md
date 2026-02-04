# 2GIS Integration Plan

## Overview
Integrate with 2GIS API to leverage their comprehensive business database (locations, ratings, business hours, categories) for shop discovery in Almaty.

---

## Integration Architecture Options

### Option A: 2GIS as Primary Data Source
```
2GIS API → Edge Function → shops table (synced)
                        ↓
         Merchants claim shops & add mystery_bags
```
- All shop data comes from 2GIS
- Merchants search for their business in 2GIS, claim it
- We store `twogis_id` in shops table for linking
- Ratings/reviews stay on 2GIS (we just display)

### Option B: 2GIS Enrichment Layer
```
Merchant adds shop manually → Edge Function checks 2GIS
                           ↓
            Auto-fill address, hours, coordinates
            Store twogis_id for future syncs
```
- Merchants can still add shops manually
- If matched in 2GIS, enrich with their data
- Fallback to OpenStreetMap if no 2GIS match

### Option C: Hybrid Discovery (Recommended)
```
User opens map → Show 2GIS POIs (bakeries, cafes)
              ↓
        Only show "Add to Bag" for claimed shops
        Unclaimed shops show as potential partners
```
- Full 2GIS discovery layer
- Mystery bags only on claimed/registered shops
- "Partner with us" CTA on unclaimed locations

---

## Database Changes Required

### shops table additions
```sql
ALTER TABLE shops ADD COLUMN twogis_id TEXT UNIQUE;
ALTER TABLE shops ADD COLUMN twogis_rating DECIMAL(2,1);
ALTER TABLE shops ADD COLUMN twogis_review_count INTEGER;
ALTER TABLE shops ADD COLUMN twogis_synced_at TIMESTAMPTZ;
ALTER TABLE shops ADD COLUMN category TEXT; -- bakery, cafe, restaurant
ALTER TABLE shops ADD COLUMN phone TEXT;
ALTER TABLE shops ADD COLUMN website TEXT;
```

---

## Edge Functions

### `supabase/functions/twogis-search/index.ts`
```typescript
// Search 2GIS for businesses by query and location
POST /twogis-search
Body: { query: "bakery", lat: 43.25, lon: 76.94, radius: 5000 }
Response: { businesses: [{ id, name, address, lat, lon, rating, hours }] }
```

### `supabase/functions/twogis-details/index.ts`
```typescript
// Get full details for a specific 2GIS business
POST /twogis-details
Body: { twogis_id: "70000001019438658" }
Response: { name, address, lat, lon, rating, reviewCount, hours, phone, photos }
```

### `supabase/functions/twogis-sync/index.ts`
```typescript
// Scheduled sync: update ratings/hours for claimed shops
// Run daily via cron or webhook
```

---

## 2GIS API Endpoints

| Endpoint | Purpose |
|----------|---------|
| `/catalog/branch/list` | Search businesses by category/location |
| `/catalog/branch/get` | Get single business details |
| `/catalog/rubric/list` | Get category/rubric list |
| `/geo/search` | Geocode addresses |

### API Key Storage
- Store `TWOGIS_API_KEY` in Cloud secrets
- Access via `Deno.env.get('TWOGIS_API_KEY')` in edge functions

---

## UI Changes

### Map Discovery
1. **Current**: Show only our `shops` table markers
2. **With 2GIS**: Show all 2GIS bakeries/cafes in area
   - 🟢 Green marker = claimed shop with mystery bags
   - ⚪ Gray marker = unclaimed 2GIS business
   - Tap gray → "This shop isn't on Yorkie yet"

### Merchant Onboarding Flow
1. **Search 2GIS**: "Find your business"
2. **Select from results**: Shows name, address, rating
3. **Claim & verify**: Link to existing 2GIS entry
4. **Add mystery bag**: Set price, quantity, pickup window

### Shop Drawer Enhancement
- Show 2GIS rating badge: ⭐ 4.8 (2GIS)
- "View on 2GIS" link button
- Business hours from 2GIS (auto-synced)

---

## Implementation Phases

### Phase 1: Preparation (Current)
- [ ] Add `twogis_id` column to shops table
- [ ] Create edge function structure
- [ ] Design search/claim UI mockups
- [ ] Confirm API access with 2GIS team

### Phase 2: Search Integration
- [ ] Implement `twogis-search` edge function
- [ ] Add 2GIS search to merchant onboarding
- [ ] Store `twogis_id` when merchant claims shop

### Phase 3: Data Sync
- [ ] Implement `twogis-details` for enrichment
- [ ] Auto-fill address, hours, coordinates
- [ ] Show 2GIS rating in shop cards

### Phase 4: Full Discovery
- [ ] Replace/overlay map markers with 2GIS layer
- [ ] Show claimed vs unclaimed businesses
- [ ] "Partner with us" flow for unclaimed

---

## Questions for 2GIS Team

1. **API Access**: What tier/plan do we need? Pricing?
2. **Rate Limits**: Requests per minute/day?
3. **Caching**: Can we cache responses? For how long?
4. **Categories**: Which rubric IDs cover bakeries, cafes, restaurants?
5. **Webhooks**: Can we get notified when business data changes?
6. **Attribution**: What branding/attribution is required on map?
7. **Data Usage**: Any restrictions on how we display their data?

---

## Fallback Strategy

If 2GIS partnership doesn't proceed:
- Keep current OpenStreetMap geocoding (already working)
- Our own rating/review system stays
- Merchants enter data manually via AddLocationModal
- No changes needed to existing codebase

---

## Technical Notes

- 2GIS API documentation: https://api.2gis.ru/doc/
- Current map uses Leaflet + OpenStreetMap tiles
- Can overlay 2GIS data on existing map infrastructure
- Map centered on Almaty: 43.25654, 76.94421
