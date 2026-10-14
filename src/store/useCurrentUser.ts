import { useAppSelector } from './hooks'

export function useCurrentUser() {
  const { user, telegramUser } = useAppSelector(state => state.user)
  return {
    id: user?.id ?? null,
    roles: user?.roles ?? {},
    name: [telegramUser?.first_name, telegramUser?.last_name].filter(Boolean).join(' ') || 'Пользователь',
    username: telegramUser?.username ?? '',
    avatar: telegramUser?.photo_url ?? '',
  }
}
