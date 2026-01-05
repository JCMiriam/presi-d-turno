import type { ColorName, IconName } from '@types'

export type ButtonSize = 'sm' | 'md' | 'lg'
export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'alert' | 'success'
export type ButtonAppearance = 'solid' | 'outline' | 'transparent' | 'icon'
export type IconShape = 'default' | 'round'
export type ButtonIconPosition = 'left' | 'right'
export type ButtonTypeAttr = 'button' | 'submit' | 'reset'

export interface ButtonProps {
  text?: string
  icon?: IconName
  iconPosition?: ButtonIconPosition
  color?: ColorName
  variant: ButtonVariant
  appearance: ButtonAppearance
  iconShape?: IconShape
  size?: ButtonSize
  disabled?: boolean
  loading?: boolean
  type?: ButtonTypeAttr
}
