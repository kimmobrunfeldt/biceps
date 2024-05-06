export const DATABASE_NAME = 'biceps'
export const APP_STATE_KEY = 'biceps'
export const INDEXEDDB_NAME = 'idb-batch-atomic'
export const DATABASE_ID_PREFIX = 'biceps'
export const NBSP = '\u00A0'
export const APP_BASE_URL =
  import.meta.env.MODE === 'production'
    ? 'https://biceps.app'
    : 'http://localhost:5173'

export const SYNC_QUERY_PARAM = 'syncWithPeerId'
export const IMPORT_DATA_QUERY_PARAM = 'importData'
