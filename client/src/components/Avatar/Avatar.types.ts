export type AvatarSize = "xs" | "sm" | "md" | "lg";

export interface AvatarProps {
  id: number;
  alt: string;
  size?: AvatarSize;
  decorative?: boolean;
}