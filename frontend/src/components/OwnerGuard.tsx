import { Navigate } from 'react-router-dom'
import { useTelegram } from '../hooks/useTelegram'

interface Props {
  children: React.ReactNode
}

export default function OwnerGuard({ children }: Props) {
  const { isOwner } = useTelegram()
  if (!isOwner) return <Navigate to="/" replace />
  return <>{children}</>
}
