export type CardSize = 'sm' | 'md' | 'lg'

export interface AnswerCardProps {
  id: string
  text: string
  selected?: boolean
  disabled?: boolean
  size?: CardSize
  readOnly?: boolean
}
