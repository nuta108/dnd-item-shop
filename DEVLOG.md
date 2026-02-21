# D&D Item Shop — Development Log

---

## Supporter Version v0.3.0 — Session 3

**Date:** 2026-02-21

---

### สรุปสิ่งที่ทำในวันนี้

---

### 1. Inventory Panel แบ่งหมวดหมู่ใหม่

- แบ่ง DM Inventory ออกเป็น 4 tab: Adventuring, Magic Items, Potions, และ อื่นๆ
- ทำให้หา item ได้ง่ายขึ้นเมื่อ database โตขึ้นมาก

---

### 2. Rarity Glow System

- ไอเทมที่มี rarity จะมีแสงเรืองรองรอบ icon ตาม tier:
  - Common → สีขาว
  - Uncommon → สีเขียว
  - Rare → สีน้ำเงิน
  - Very Rare → สีม่วง
  - Legendary → สีส้มทอง
  - Artifact → สีแดง

---

### 3. ระบบ Cost — เปลี่ยนเป็น number (gp เท่านั้น)

- `cost` field เปลี่ยน type จาก `string | null` → `number | null`
- db.json แปลงค่าทั้งหมด: `"15 gp"` → `15`, `"1 sp"` → `0.1`, `"5 cp"` → `0.05`
- ItemCard แสดงผลเป็น `"X gp"` หรือ `"Free"` อัตโนมัติ
- Edit form และ Create form ใช้ `<input type="number">` มี label "gp" ต่อท้าย — ไม่ต้องพิมพ์สกุลเงินเอง

---

### 4. เพิ่ม Items จาก Unused Icons — +818 items (227 → 1,045)

v0.2.0 มีแค่ 227 items ตอนนี้ 1,045 items
เขียน Python script match icon ที่เหลือกับ D&D items จริง โดยดึง description + rarity จาก 5etools JSON

**Items ใหม่แยกตาม category:**

| Category | จำนวน | ตัวอย่าง |
|---|---|---|
| Ammunition | 13 | Arrow/Bolt/Needle/Bullet แบบเดี่ยว, Adamantine/Silvered variants ทุกตัว |
| Adventuring Gear | 21 | Ball Bearing, Caltrops, Crampons, Mallet, Sextant, Snowshoes... |
| Armor | 4 | Goggles, Spiked Armor, Shield (Checked), Shield (Kite) |
| Artisans Tools | 4 | Artisan Tools, Jeweler's Tools, Lockpicks, Tinker's Tools |
| Books And Paper | 6 | Anatomy, Locked Book, Prayer Book, Book of Death/Lore/Shadows |
| Clothes | 6 | Vestments, Wizard Hat, Hat with Feather, Cold Weather Clothing, Signet Rings |
| Containers and Pouches | 3 | Coin Pouch, Hip Flask, Jar |
| Food And Drink | 2 | Bottle of Wine, Herb |
| Game Sets | 1 | Board Game |
| Instruments | 4 | Bassoon, Horn, Tambourine, Wargong |
| Magic Items | 36 | Ioun Stones (13 variants), Rings of Resistance (10), Robe of Archmagi Good/Neutral, Elemental Gems, Abracadabrus... |
| Mount Equipment | 12 | Animal Deeds × 11 (Axe Beak, Camel, Elephant, Warhorse...) + Stabling |
| Spell Casting Focus Items | 55 | Diamond Dust, Gilded Acorn, Ruby Vial with Human Blood, Silver Wire... |
| Supply Kits | 7 | Burglar/Diplomat/Dungeoneer/Entertainer/Explorer/Priest's/Scholar Pack |
| Vehicles | 10 | Siege weapons (Ballista, Trebuchet, Mangonel, Ram, Siege Tower, Cauldron) + Dogsled + Vehicle Deeds |
| Weapons | 2 | Javelin Stack, Scythe |

---

### 2. อัปเดต Icon สำหรับ Items ที่มีอยู่แล้วแต่ icon = null

อัปเดต 15 items เดิมที่ชื่อตรงแต่ยังไม่มี icon:

- **Magic Tomes (11):** Alchemical Compendium, Atlas of Endless Horizons, Manual of Bodily Health/Gainful Exercise/Golems/Quickness, Tome of Clear Thought/Leadership/Understanding, Book of Exalted Deeds, Book of Vile Darkness
- **Spell Components (1):** Crystal Ball
- **Vehicles (3):** Airship, Rowboat, Sled → เปลี่ยนจาก `-Deed.svg` เป็น non-deed icon (สวยกว่า)

---

### 3. Icon Coverage

| | ก่อน | หลัง |
|---|---|---|
| Icons ที่ใช้งาน | 526 (58%) | 724 (79%) |
| Items ใน db.json | 859 | 1,045 |
| Unused (generic, ตั้งใจข้าม) | — | 181 |
| Unused (non-generic) | 382 | 3 |

Icons 3 ตัวที่ยังเหลือ = Flask, Glass Bottle, Vial ใน Adventuring Gear folder
(ซ้ำกับ items ที่มีอยู่แล้วซึ่งใช้ Potions folder icons → intentionally unused)

---

### 5. Version Bump + Cost System

- `package.json`: `0.1.0` → `0.3.0`
- `src/App.tsx`: version badge → `Supporter v0.3.0`
- About modal: เพิ่ม "What's new in v0.3.0" section
- `types/item.ts`: `cost: string | null` → `cost: number | null`
- `db.json`: แปลงค่า cost ทั้งหมด 373 รายการ (gp/sp/cp → number gp)
- `ItemCard.tsx`, `ItemEditForm.tsx`, `CreateItemModal.tsx`: อัปเดต cost field

---

### Supporter Version — Features Roadmap

- [x] Up to 20 shops
- [x] SVG Icon display mode
- [x] Adjustable item size
- [x] Inventory panel split by category
- [x] Rarity glow on item icons
- [x] Cost field — number only, gp fixed currency
- [x] Expanded item database (227 → 1,045 items, icon coverage 79%)
- [ ] Freely add & remove items
- [ ] Custom item card images
- [ ] Random item generator

---

## Supporter Version v0.2.0 — Session 2

**Branch:** `supporter-version`
**Date:** 2026-02-20

---

### สรุปสิ่งที่ทำในวันนี้

---

### 1. เพิ่มจำนวน Shop สูงสุดเป็น 20

- **ไฟล์:** `src/components/ShopDisplay.tsx`, `src/App.tsx`
- เปลี่ยน `shops.length < 3` → `shops.length < 20`
- อัปเดต tooltip และข้อความใน About modal
- เปลี่ยน version badge เป็น `Supporter v0.2.0` (สีทอง)
- อัปเดต About modal: เปลี่ยนจาก "unlock Supporter Version" เป็น "Thank you for supporting"

---

### 2. Tab Bar เลื่อนซ้าย-ขวาได้เมื่อ Shop เยอะ

- **ไฟล์:** `src/components/ShopDisplay.tsx`
- เพิ่ม `overflow-x-auto` บน tab bar container
- Scrollbar บางสีเทา (`scrollbarWidth: 'thin'`)
- Active tab ใช้ `mb-[-1px]` ทำให้เชื่อมกับ content (classic CSS tab trick)
- Auto-scroll ไปยัง active tab เมื่อกดสลับ (ด้วย `data-active` + `scrollIntoView`)
- ทุก tab มี `shrink-0` ไม่ให้ถูกบีบ

---

### 3. เพิ่ม Display Mode: Icon (แทนที่ Card Mode)

#### 3a. ลบ Card Mode ออก
- **ไฟล์:** `src/components/ItemCard.tsx`, `src/App.tsx`, `src/components/DmInventory.tsx`
- `DisplayMode`: `'card' | 'icon' | 'text'` → `'icon' | 'text'`
- ลบ hover preview (card image popup)
- ลบ `THUMB_W`, `PREVIEW_W`, `PREVIEW_H` constants
- ลบ `useRef`, `useCallback` ที่ไม่ใช้แล้ว
- Toggle button: วน **Icon ↔ Text**

#### 3b. ลบไฟล์ Card Image (333MB)
- ลบ `public/cards/` ออกทั้งหมด
- ขนาด public folder ลดจาก **357MB → 25MB**
- ลบ `image: string` field ออกจาก `Item` type และ `db.json`
- อัปเดต About modal: เปลี่ยน "Card Image Credits (Paul Weber)" → "Icon Credits (Gwillewyn / CC BY 3.0)"

#### 3c. เหตุผล
- ภาพของ Paul Weber ไม่มี license ที่ชัดเจนสำหรับ commercial use
- SVG icons ของ Gwillewyn ใช้ license CC BY 3.0 — ใช้เชิงพาณิชย์ได้

---

### 4. Icon Library — dnd-item-icons-by-gwill

- **Source:** https://github.com/Gwillewyn/dnd-item-icons-by-gwill
- **License:** CC BY 3.0 (ต้องให้เครดิต game-icons.net + Gwillewyn)
- **จำนวน:** 908 SVG ไฟล์
- **Copy ไปที่:** `public/icons/` จัดกลุ่มตาม category

**หมวดหมู่:**
- Adventuring Gear, Ammunition, Armour, Books and Scrolls
- Food and Drink, Gaming Sets, Instruments, Magical Items
- Mount and Tack, Potions/Poisons/Bottles/Vials, Siege Equipment
- Spell Components and Spellcasting Foci, Tools/Kits/Artisan Tools
- Trade Good, Treasure, Vehicles, Weapons

---

### 5. เพิ่ม `icon` Field ใน Item Type และ db.json

- **ไฟล์:** `src/types/item.ts`, `db.json`
- เพิ่ม `icon?: string | null` ใน `Item` interface
- Match ชื่อไอเทมกับชื่อ SVG ไฟล์อัตโนมัติ (case-insensitive, strip parenthetical)
- Match อัตโนมัติได้ 161/228 ไอเทม
- สร้าง `icon-matcher.html` — เครื่องมือ GUI สำหรับ match icon กับ item ด้วยตัวเอง
- User match เพิ่มอีก 62 ไอเทม → รวม **223/228 ไอเทม** มี icon แล้ว
- ที่ไม่มี icon: Custom Item 1-5 (intentional)

**icon-matcher.html features:**
- List ไอเทมทางซ้าย (เขียว = matched, ขาว = ยังไม่ match)
- Grid icon ทางขวา กรอง category + search ได้
- คลิก item → คลิก icon → assign ทันที → กระโดดไป item ถัดไปอัตโนมัติ
- Export JSON → ส่งให้ Claude update db.json

---

### 6. Icon Display Mode UI

- **ไฟล์:** `src/components/ItemCard.tsx`
- Icon card: แสดง SVG icon + ชื่อเต็ม (no truncate, break-words)
- ขนาด card ปรับตาม `itemSize` prop
- Modal เมื่อคลิก: แสดง icon panel (gradient background สีน้ำตาล/navy) + StatBlock
- **Hover zoom ใน modal:** `hover:scale-[2]` + `transition-transform duration-200` + `cursor-zoom-in`

---

### 7. Size Control (+/-)

- **ไฟล์:** `src/components/DmInventory.tsx`, `src/App.tsx`, `src/components/ItemCard.tsx`, `ShopDisplay.tsx`, `PlayerCart.tsx`
- ปุ่ม **−** / **+** ใน DM Inventory toolbar
- 5 ระดับ, บันทึกใน localStorage (`dnd-item-size`)
- ปรับพร้อมกันทุก panel (DM Inventory, Shop, Player Cart)

| ระดับ | Card W | Icon | Text |
|-------|--------|------|------|
| 1     | 60px   | 28px | 8px  |
| 2     | 72px   | 36px | 9px  |
| 3 (default) | 88px | 44px | 10px |
| 4     | 108px  | 56px | 12px |
| 5     | 132px  | 70px | 13px |

---

### 8. Player Cart แสดง Display Mode เดียวกับ Shop

- **ไฟล์:** `src/components/PlayerCart.tsx`, `src/App.tsx`
- เพิ่ม `displayMode` และ `itemSize` prop ใน `PlayerCart`
- Cart จะแสดง Icon/Text ตาม mode ที่เลือกอยู่ (ไม่ hardcode เป็น text อีกต่อไป)

---

### 9. แก้บัก Drag & Drop

#### บัก: drag ภายใน container เดิม → copy item ซ้ำ
- **Root Cause:** `onDrop` ใน container ไม่รู้ว่า drag มาจากที่ไหน → fire callback ทุกครั้ง
- **Fix:** ฝัง `_dragSource` field ใน drag data payload
  ```json
  { ...item, "_dragSource": "shop" | "player-cart" | "dm-inventory" }
  ```
- แต่ละ container เช็ค `_dragSource` ก่อน drop — ถ้า source === ตัวเอง → `return` ทันที
- Strip `_dragSource` ออกก่อนส่ง item ต่อ (destructuring)

**พฤติกรรมใหม่:**

| drag จาก → ไปยัง | ผล |
|---|---|
| Shop → Shop | ไม่ทำอะไร |
| Cart → Cart | ไม่ทำอะไร |
| DM Inventory → DM Inventory | ไม่ทำอะไร |
| DM Inventory → Shop | เพิ่มใน shop |
| Shop → Cart | ย้าย (remove from shop + add to cart) |
| Cart → Shop | ย้าย (remove from cart + add to shop) |
| Shop/Cart → DM Inventory | return กลับ inventory |

---

### ไฟล์ที่แก้ไขในวันนี้

| ไฟล์ | การเปลี่ยนแปลง |
|------|----------------|
| `src/types/item.ts` | ลบ `image`, เพิ่ม `icon?: string \| null` |
| `src/components/ItemCard.tsx` | ลบ card mode, เพิ่ม icon mode, size control, hover zoom, dragSource |
| `src/components/DmInventory.tsx` | เพิ่ม size control UI, dragSource fix |
| `src/components/ShopDisplay.tsx` | scrollable tabs, itemSize prop, dragSource fix |
| `src/components/PlayerCart.tsx` | displayMode/itemSize props, dragSource fix |
| `src/App.tsx` | version badge, itemSize state, About modal credits |
| `db.json` | ลบ `image` field, เพิ่ม `icon` field ครบ 223 items |
| `public/icons/` | เพิ่ม 908 SVG icons (25MB) |
| `public/cards/` | **ลบ** (333MB) |
| `icon-matcher.html` | เครื่องมือ match icon ↔ item |

---

### Supporter Version — Features Roadmap

- [x] Up to 20 shops
- [x] SVG Icon display mode
- [x] Adjustable item size
- [ ] Freely add & remove items
- [ ] Custom item card images
- [ ] Magic Items category
- [ ] Random item generator
