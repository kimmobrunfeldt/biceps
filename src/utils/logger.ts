export type Logger = ReturnType<typeof getLogger>

export const dim = 'color: #888;'
export const bold = 'font-weight: bold;'
export const normal = 'font-weight: normal;'

export function getLogger(label: string) {
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
    custom: (
      {
        text,
        level,
      }: { text: string; level: 'debug' | 'info' | 'log' | 'warn' | 'error' },
      ...args: unknown[]
    ) =>
      console[level](
        `%c${getTime()} %c${label}%c ${text}`,
        dim,
        bold,
        normal,
        ...args
      ),
  }
}

function getTime() {
  return new Date().toISOString()
}
