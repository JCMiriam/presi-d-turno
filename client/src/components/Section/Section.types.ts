export type SectionSize = 'sm' | 'md' | 'lg' | 'xl' | 'auto' | 'full'

export type SectionProps = {
  title?: string
  subtitle?: string
  hasLogo?: boolean
  hasHeader?: boolean
  scrollable?: boolean
  size?: SectionSize
}
