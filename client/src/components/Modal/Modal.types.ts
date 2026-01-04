export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'auto'

export type ModalProps = {
  title?: string
  subtitle?: string
  hasLogo?: boolean
  modelValue: boolean
  hasCloseButton?: boolean
  closeOnOverlay?: boolean
  closeOnEsc?: boolean
  size?: ModalSize
  ariaLabel?: string
  submitText?: string
  cancelText?: string
  onCancel?: () => void
  onSubmit?: () => void
}
