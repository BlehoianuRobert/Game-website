export type PlayerStatus = 'active' | 'suspended';

export interface Player {
	id: string;
	username: string;
	email: string;
	password_hash?: string;
	status?: PlayerStatus;
	created_at?: string;
	role: string;
}
