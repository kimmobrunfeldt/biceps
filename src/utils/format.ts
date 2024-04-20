import _ from 'lodash'

export function formatKcal(value: number) {
  return removeUnnecessaryDecimals(String(Math.round(value)))
}

export function formatGrams(value: number) {
  return removeUnnecessaryDecimals(value.toFixed(1))
}

export function removeUnnecessaryDecimals(numberAsStr: string): string {
  if (!numberAsStr.includes('.')) {
    return numberAsStr
  }

  const withoutTrailingZeros = _.trimEnd(numberAsStr, '0')
  return _.trimEnd(withoutTrailingZeros, '.')
}
