export interface ItemStats {
  cost: number | null;
  weight: string | null;
  damage_dice: string | null;
  damage_type: string | null;
  properties: string[];
  category_detail: string | null;
  description: string | null;
  // armor-specific
  ac_display?: string | null;
  stealth_disadvantage?: boolean | null;
  strength_required?: number | null;
}

export interface Item {
  id: string;
  name: string;
  category: string;
  magic_category?: string | null;
  rarity?: string | null;
  requires_attunement?: boolean | null;
  icon?: string | null;
  stats: ItemStats | null;
}

export interface ShopData {
  id: string;
  name: string;
  items: Item[];
}
