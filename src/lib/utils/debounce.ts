export function debounce<TArgs extends unknown[]>(
  callback: (...args: TArgs) => void,
  delayMs = 250,
) {
  let timeoutId: ReturnType<typeof setTimeout> | null = null

  return (...args: TArgs) => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    timeoutId = setTimeout(() => {
      callback(...args)
    }, delayMs)
  }
}
