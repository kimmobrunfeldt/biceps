import chalk from 'chalk'
import { writeFileSync } from 'fs'
import path from 'path'
import { Project, SyntaxKind } from 'ts-morph'

const BACKEND_ROOT = path.join(__dirname, '../..')

main()

function main() {
  generate()
}

function generate() {
  console.log('Generating ..\n')

  const project = new Project({})
  project.addSourceFilesAtPaths('src/db/entities/*.ts')

  const code: string[] = [
    `// Warning! This file was auto-generated with 'npm run generate'. Do not edit manually.`,
    ``,
    ``,
    `/* eslint-disable no-restricted-imports */`,
    ``,
    `import { createEntity } from 'src/db/interface/entityInterface'`,
    ``,
  ]
  const entityNames: string[] = []

  // To debug typescript code AST: https://ts-ast-viewer.com/
  project.getSourceFiles().forEach((file) => {
    const filePath = getRelativePath(file.getFilePath())
    const fileName = path.basename(filePath, '.ts')

    console.log()
    if (filePath.includes('.test.ts') || filePath.endsWith('index.ts')) {
      console.log(chalk.dim(`${filePath} ignored`))
      return
    } else {
      console.log(chalk.bold(filePath))
    }

    const fileExports: string[] = []

    const functions = file.getDescendantsOfKind(SyntaxKind.FunctionDeclaration)
    functions.forEach((node) => {
      const identifier = node.getFirstChildByKind(SyntaxKind.Identifier)
      if (!identifier) {
        console.log('Function without identifier found! ')
        return
      }

      const name = identifier.getSymbol()?.getEscapedName()

      const isExported = node.getFirstModifierByKind(SyntaxKind.ExportKeyword)
      if (!isExported) {
        console.log(`Skipping non-exported function '${chalk.bold(name)}'`)
        return
      }

      if (!name) {
        console.log(`Skipping function without detected name`)
        return
      }

      console.log(`Found exported function '${chalk.bold(name)}'`)
      fileExports.push(name)
    })

    const exportSpecifiers = file.getDescendantsOfKind(
      SyntaxKind.ExportSpecifier
    )
    exportSpecifiers.forEach((specifier) => {
      const name = specifier.getSymbol()?.getEscapedName()
      if (!name) {
        console.log(`Skipping export specifier without detected name`)
        return
      }

      console.log(`Found export with name '${chalk.bold(name)}'`)
      fileExports.push(name)
    })

    const renamedImports = fileExports.map((e) => `${e} as ${e}${fileName}`)
    const entityOptions = fileExports.map((e) => `${e}: ${e}${fileName}`)

    code.push(`
      import { ${renamedImports.join(', ')} } from 'src/db/entities/${fileName}'
      const ${fileName}Entity = createEntity({ ${entityOptions.join(', ')} })
      export { ${fileName}Entity as ${fileName} }
    `)
    entityNames.push(fileName)
  })

  code.push(`
    export const allEntities = {
      ${entityNames.map((name) => `${name}: ${name}Entity,`).join('\n')}
    }
    export type AnyDatabaseEntity = typeof allEntities[keyof typeof allEntities]
  `)

  writeFileSync(
    path.join(BACKEND_ROOT, 'src/db/entities/index.ts'),
    code.join('\n'),
    'utf-8'
  )
}

function getRelativePath(filePath: string): string {
  return path.relative(BACKEND_ROOT, filePath)
}
