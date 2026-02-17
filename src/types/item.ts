export type Rarity = 'common' | 'uncommon' | 'rare' | 'very_rare' | 'legendary';

export interface Item {
  id: string;
  name: string;
  price: number;
  rarity: Rarity;
}
