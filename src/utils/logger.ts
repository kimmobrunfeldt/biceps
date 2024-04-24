export type Logger = ReturnType<typeof getLogger>
export function getLogger(label: string) {
  const dim = 'color: #888;'
  const bold = 'font-weight: bold;'
  const normal = 'font-weight: normal;'
  return {
    debug: (...args: unknown[]) =>
      console.debug(`%c${getTime()} %c${label}%c`, dim, bold, normal, ...args),
    info: (...args: unknown[]) =>
      console.info(`%c${getTime()} %c${label}%c`, dim, bold, normal, ...args),
    log: (...args: unknown[]) =>
      console.log(`%c${getTime()} %c${label}%c`, dim, bold, normal, ...args),
    warn: (...args: unknown[]) =>
      console.warn(`%c${getTime()} %c${label}%c`, dim, bold, normal, ...args),
    error: (...args: unknown[]) =>
      console.error(`%c${getTime()} %c${label}%c`, dim, bold, normal, ...args),
  }
}

function getTime() {
  return new Date().toISOString()
}
