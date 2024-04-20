import initWasm from '@vlcn.io/crsqlite-wasm'
import wasmUrl from '@vlcn.io/crsqlite-wasm/crsqlite.wasm?url'
import { TXAsync } from '@vlcn.io/xplat-api'
import sql from 'sql-template-tag'
import { DATABASE_NAME } from 'src/constants'
import { createDatabaseMethods } from 'src/db/interface/databaseMethods'
import schemaContent from 'src/db/schema.sql?raw'
import { z } from 'zod'

export async function runMigrations() {
  console.log('Running migrations ...')
  const crsqlite = await initWasm(() => wasmUrl)
  const db = await crsqlite.open(DATABASE_NAME)
  console.log('Connected to database:', db)

  const exists = await doesMigrationTableExist(db)
  if (!exists) {
    console.log(
      'Migrations table does not exist, this must be a new database..'
    )
    console.log('Applying schema with auto-migration ...')
    await db.automigrateTo('schema.sql', schemaContent)
    // We can assume that when applying latest schema.sql, the previous migrations
    // are already included in the schema
    await markMigrationDone(db, migrations.length - 1)
  }

  const latestMigrationVersion = (await getMigrationVersion(db)) ?? -1
  const migrateStartingFromVersion = latestMigrationVersion + 1

  if (migrateStartingFromVersion > migrations.length - 1) {
    console.log('Latest migrations already applied. Database is up to date.')
    return
  }

  for (let i = migrateStartingFromVersion; i < migrations.length; ++i) {
    console.log('Applying migration', i, '...')
    const migration = migrations[i]
    await db.tx(async (tx) => {
      await migration.up(tx)
      await markMigrationDone(tx, i)
    })
  }

  console.log('Migrations done!')
}

async function getMigrationVersion(connection: TXAsync) {
  const schema = z.object({ version: z.number() }).passthrough()
  const { maybeOne } = createDatabaseMethods({ connection, schema })
  const row = await maybeOne(
    sql`SELECT version FROM migrations ORDER BY version DESC LIMIT 1`
  )
  return row?.version ?? null
}

async function doesMigrationTableExist(connection: TXAsync) {
  const rows = await connection.execO<{ name: string }>(`
    SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'migrations'
  `)
  return rows[0]?.name === 'migrations'
}

async function markMigrationDone(connection: TXAsync, version: number) {
  await connection.execO(`INSERT INTO migrations (version) VALUES (?)`, [
    version,
  ])
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function removeColumns(
  connection: TXAsync,
  tableName: string,
  columnNames: string[]
) {
  await connection.execO(`SELECT crsql_begin_alter('${tableName}');`)
  for (const columnName of columnNames) {
    await connection.execO(
      `ALTER TABLE ${tableName} DROP COLUMN ${columnName};`
    )
  }
  await connection.execO(`SELECT crsql_commit_alter('${tableName}');`)
}

type Migration = {
  up: (connection: TXAsync) => Promise<void>
}

// Array index defines the version number
const migrations: Migration[] = [
  /**
  {
    up: async (connection: TXAsync) => {},
  },
  */
]
