export interface PlayerProfile {
  id: string;
  player_id: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  subscribed: boolean;
  created_at: string;
}