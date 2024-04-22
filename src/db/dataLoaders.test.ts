import { returnOneByReferenceIds } from 'src/db/dataLoaders'

describe('dataLoaders', () => {
  describe('returnOneByReferenceIds', () => {
    test('sorts by id by default', () => {
      const ids = ['1', '3', '2']
      const sorted = returnOneByReferenceIds(ids, [
        { id: '3' },
        { id: '2' },
        { id: '1' },
      ])
      expect(sorted).toEqual(ids.map((id) => expect.objectContaining({ id })))
    })

    test('allows custom picker function', () => {
      const locationIds = ['1', '4', '2']
      const sorted = returnOneByReferenceIds(
        locationIds,
        [
          { id: '3', locationId: '1' },
          { id: '2', locationId: '2' },
          { id: '1', locationId: '4' },
        ],
        (item) => item.locationId
      )
      expect(sorted).toEqual([
        { id: '3', locationId: '1' },
        { id: '1', locationId: '4' },
        { id: '2', locationId: '2' },
      ])
    })

    test('duplicates items when same id is requested', () => {
      const locationIds = ['1', '1', '4', '1', '2']
      const sorted = returnOneByReferenceIds(
        locationIds,
        [
          { id: '3', locationId: '1' },
          { id: '2', locationId: '2' },
          { id: '1', locationId: '4' },
        ],
        (item) => item.locationId
      )
      expect(sorted).toEqual([
        { id: '3', locationId: '1' },
        { id: '3', locationId: '1' },
        { id: '1', locationId: '4' },
        { id: '3', locationId: '1' },
        { id: '2', locationId: '2' },
      ])
    })

    test('returns Error when given id not found', () => {
      const locationIds = ['1', '1', '4', '1', '2']
      const sorted = returnOneByReferenceIds(
        locationIds,
        [
          { id: '2', locationId: '2' },
          { id: '1', locationId: '4' },
        ],
        (item) => item.locationId
      )
      expect(sorted).toEqual([
        new Error(`Entity not found with id '1'`),
        new Error(`Entity not found with id '1'`),
        { id: '1', locationId: '4' },
        new Error(`Entity not found with id '1'`),
        { id: '2', locationId: '2' },
      ])
    })
  })
})
