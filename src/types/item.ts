export interface ItemStats {
  cost: string | null;
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
  image: string;
  stats: ItemStats | null;
}
