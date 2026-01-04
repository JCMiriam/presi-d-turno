export type AvatarVariant = 'round' | 'square'
export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'
export interface AvatarProps {
  id: number
  alt: string
  variant?: AvatarVariant
  size?: AvatarSize
  decorative?: boolean
}
