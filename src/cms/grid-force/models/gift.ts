export type GiftStatus = 'pending' | 'accepted' | 'rejected';

export interface Gift {
  id: string;
  sender_id: string;
  recipient_id: string;
  item_id: string;
  status: GiftStatus;
  sent_at: string;
  responded_at: string | null;
}