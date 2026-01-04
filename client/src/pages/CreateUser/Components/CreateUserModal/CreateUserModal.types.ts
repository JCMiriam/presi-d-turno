type Mode = 'create' | 'join'
export interface CreateUserModalProps {
  username: string
  avatarId: number
  error: string | null
  mode: Mode
  roomId: string | null
  submitLabel: string
}
