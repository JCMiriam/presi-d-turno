export type Player = {
    id: string;
    username: string;
    avatarId: string
};

export type Room = { players: Player[] };
