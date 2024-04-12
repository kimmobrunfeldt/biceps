import _ from 'lodash'
import { deepOmitBy } from 'src/utils/utils'

describe('utils', () => {
  describe('deepOmitBy', () => {
    test('omits values deeply based on iteratee', () => {
      const result = deepOmitBy(
        {
          a: undefined,
          b: 1,
          c: {
            a: undefined,
            b: 2,
            c: {
              a: undefined,
            },
          },
        },
        _.isUndefined
      )
      expect(result).toEqual({ b: 1, c: { b: 2, c: {} } })
    })
  })
})
