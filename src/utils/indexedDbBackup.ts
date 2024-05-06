import Dexie from 'dexie'
import { exportDB, importInto } from 'dexie-export-import'
import { INDEXEDDB_NAME } from 'src/constants'

export async function exportBicepsData() {
  const db = await new Dexie(INDEXEDDB_NAME).open()
  const blob = await exportDB(db)
  return blob
}

export async function importBicepsData(file: File) {
  // Import a file into a Dexie instance:
  const db = await new Dexie(INDEXEDDB_NAME).open()
  await importInto(db, file, {
    clearTablesBeforeImport: true,
  })
}

export async function downloadAsExportFile(fileName: string, blob: Blob) {
  const jsonObjectUrl = URL.createObjectURL(blob)
  const anchorEl = document.createElement('a')
  anchorEl.href = jsonObjectUrl
  anchorEl.download = fileName
  anchorEl.click()
  URL.revokeObjectURL(jsonObjectUrl)
}
