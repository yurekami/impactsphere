export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    console.log('[alerts] Browser notifications not supported')
    return 'denied'
  }

  if (Notification.permission === 'granted') {
    return 'granted'
  }

  if (Notification.permission === 'denied') {
    return 'denied'
  }

  const result = await Notification.requestPermission()

  return result
}

export function showNotification(title: string, body: string): void {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    console.log(`[alert] ${title}: ${body}`)
    return
  }

  new Notification(title, {
    body,
    icon: '/favicon.ico',
    tag: `alert-${Date.now()}`,
  })
}
