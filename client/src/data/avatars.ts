export type Avatar = {
  id: number;
  src: string;
};

const AVATAR_COUNT = 42;

export const AVATARS: Avatar[] = Array.from(
  { length: AVATAR_COUNT },
  (_, i) => {
    const padded = i.toString().padStart(2, "0");
    return {
      id: i,
      src: `/src/assets/images/avatars/avatar-${padded}.svg`
    };
  }
);
