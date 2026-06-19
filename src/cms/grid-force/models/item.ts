export type ItemRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface Item {
  id: string;
  game_id: string;
  name: string;
  description: string | null;
  rarity: ItemRarity;
}