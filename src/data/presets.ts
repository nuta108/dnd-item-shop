export interface ShopPreset {
  name: string;
  itemNames: string[];
}

export const SHOP_PRESETS: ShopPreset[] = [
  {
    name: 'Blacksmith & Armory',
    itemNames: [
      'Studded Leather', 'Chain Shirt', 'Scale Mail', 'Breastplate', 'Half Plate',
      'Ring Mail', 'Chain Mail', 'Splint', 'Plate',
      'Dagger', 'Handaxe', 'Javelin', 'Light Hammer', 'Mace', 'Spear',
      'Battleaxe', 'Flail', 'Glaive', 'Greatsword', 'Halberd',
      'Longsword', 'Maul', 'Morningstar', 'Rapier', 'Scimitar',
      'Shortsword', 'Trident', 'War Pick', 'Warhammer',
      'Shield', 'Crowbar', 'Hammer', 'Chain', 'Lock', 'Whetstone',
      "Smith's Tools", "Tinker's Tools",
    ],
  },
  {
    name: 'Fletcher & Bowyer',
    itemNames: [
      'Light Crossbow', 'Hand Crossbow', 'Heavy Crossbow', 'Shortbow', 'Longbow',
      'Arrows', 'Crossbow Bolts', 'Crossbow Bolt Case', 'Quiver',
    ],
  },
  {
    name: 'Leatherworker',
    itemNames: [
      'Leather Armor', 'Studded Leather', 'Hide Armor', 'Shield',
      'Sling', 'Waterskin',
      "Cobbler's Tools", "Leatherworker's Tools",
      'Bagpipes', 'Drum',
    ],
  },
  {
    name: 'Temple & Faith Supplies',
    itemNames: [
      'Candle', 'Holy Water', 'Incense', 'Holy Symbol (Amulet)',
      'Holy Symbol (Emblem)', 'Holy Symbol (Reliquary)',
      'Lamp', 'Oil', 'Potion of Healing',
      "Healer's Kit", 'Rations', 'Torch', 'Vial', 'Waterskin',
      "Calligrapher's Supplies", 'Herbalism Kit',
      'Flute', 'Lyre', 'Horn',
    ],
  },
  {
    name: 'General Store',
    itemNames: [
      'Candle', 'Blanket', 'Rope (Hempen)', 'Rope (Silk)', 'Torch',
      'Lantern (Bullseye)', 'Lantern (Hooded)', 'Lamp',
      'Common Clothes', 'Fine Clothes', "Traveler's Clothes",
      'Pouch', 'Sack', 'Backpack', 'Chest', 'Basket',
      'Hammer', 'Shovel', 'Mirror', 'Soap', 'Pot (Iron)',
      'Ink (1 ounce bottle)', 'Ink Pen', 'Paper', 'Parchment',
      "Cook's Utensils", "Carpenter's Tools",
    ],
  },
  {
    name: 'Adventuring Supplies',
    itemNames: [
      'Backpack', 'Bedroll', 'Blanket', 'Rope (Hempen)', 'Rope (Silk)',
      'Torch', 'Tinderbox', 'Rations', 'Waterskin',
      'Crowbar', 'Grappling Hook', 'Hammer', 'Piton', 'Mirror',
      "Healer's Kit", "Climber's Kit", 'Hunting Trap',
      'Arrows', 'Crossbow Bolts', 'Sling Bullets', 'Blowgun Needles',
      'Hourglass', 'Spyglass',
      'Herbalism Kit', "Tinker's Tools",
    ],
  },
  {
    name: 'Tailor & Textiles',
    itemNames: [
      'Common Clothes', 'Fine Clothes', "Traveler's Clothes",
      'Costume Clothes', 'Robes',
      'Backpack', 'Bedroll', 'Blanket', 'Pouch', 'Sack',
      'Tent (Two-Person)', 'Component Pouch',
      "Weaver's Tools",
    ],
  },
  {
    name: 'Jeweler & Stonecutter',
    itemNames: [
      'Signet Ring', 'Ring',
      'Arcane Focus (Crystal)', 'Arcane Focus (Orb)',
      "Jeweler's Tools",
    ],
  },
  {
    name: 'Potion Shop',
    itemNames: [
      'Potion of Healing', 'Antitoxin', 'Acid',
      "Alchemist's Fire", 'Oil', 'Perfume',
      "Healer's Kit", 'Poison (Basic)',
      'Flask', 'Vial', 'Bottle',
      "Alchemist's Supplies", "Brewer's Supplies",
      "Poisoner's Kit",
    ],
  },
  {
    name: 'Arcane Shop',
    itemNames: [
      'Quarterstaff',
      'Arcane Focus (Crystal)', 'Arcane Focus (Orb)',
      'Arcane Focus (Rod)', 'Arcane Focus (Staff)', 'Arcane Focus (Wand)',
      'Component Pouch', 'Spellbook',
      'Robes', 'Candle', 'Ink (1 ounce bottle)', 'Ink Pen',
      'Paper', 'Parchment', 'Vial', 'Hourglass',
      "Alchemist's Supplies", "Calligrapher's Supplies",
      'Lute', 'Lyre',
    ],
  },
];
