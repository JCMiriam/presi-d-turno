export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg'

export interface AvatarGalleryProps {
  modelValue: number | null
  label?: string
  size?: AvatarSize
  disabled?: boolean
  minCellPx?: number
}
