import { Sql } from 'sql-template-tag'
import { NBSP } from 'src/constants'
import { formatSqlWithValues } from 'src/db/interface/entityMethods'

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

export async function withEntityLogging<T>({
  logger,
  methodName,
  cb,
}: {
  logger: Logger
  methodName: string
  cb: () => Promise<T>
}): Promise<T> {
  try {
    const start = performance.now()
    const result = await cb()
    const durationMs = performance.now() - start
    logger.info(
      `.${methodName} executed in ${durationMs.toFixed(1)}ms.`,
      '\nResult:',
      result,
      `\n${NBSP}`
    )

    return result
  } catch (err) {
    logger.error(`Error executing .${methodName}:`, err)
    throw err
  }
}

export async function withSqlLogging<T>({
  logger,
  sqlQuery,
  methodName,
  cb,
}: {
  logger: Logger
  sqlQuery: Sql
  methodName: string
  cb: () => Promise<T>
}): Promise<T> {
  try {
    logger.custom(
      {
        text: `.${methodName}\n%c${formatSqlWithValues(sqlQuery)}`,
        level: 'info',
      },
      dim
    )
    const result = await cb()
    return result
  } catch (err) {
    logger.error(
      `Error executing .${methodName}:\n`,
      formatSqlWithValues(sqlQuery)
    )
    throw err
  }
}
