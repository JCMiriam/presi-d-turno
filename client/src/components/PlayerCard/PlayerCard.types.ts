import type { RoomStore } from '@types'

export interface PlayerCardProps {
  id: string;
  avatarId: number;
  username: string;
  points: number;
  roomStore: RoomStore;
}