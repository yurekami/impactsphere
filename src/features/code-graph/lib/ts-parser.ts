import path from 'node:path'
import ts from 'typescript'
import type { FunctionCall, Import, ParsedDeclaration, ParsedExport, ParsedFile } from '../types'

interface ParsedProgram {
  files: ParsedFile[]
}

const SOURCE_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.mts', '.cts']
const REPO_ROOT = '/repo'

function toVirtualPath(relativePath: string): string {
  const normalized = relativePath.replaceAll('\\', '/')
  return path.posix.join(REPO_ROOT, normalized)
}

function toRelativePath(virtualPath: string): string {
  return path.posix.relative(REPO_ROOT, virtualPath)
}

function isSourceFilePath(filePath: string): boolean {
  return SOURCE_EXTENSIONS.some((extension) => filePath.endsWith(extension))
}

function getNodeLine(sourceFile: ts.SourceFile, node: ts.Node): number {
  return sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).line + 1
}

function hasModifier(node: ts.Node, kind: ts.SyntaxKind): boolean {
  const modifiers = ts.canHaveModifiers(node) ? ts.getModifiers(node) : undefined
  return Boolean(modifiers?.some((modifier) => modifier.kind === kind))
}

function declarationId(filePath: string, symbolName: string): string {
  return `${filePath}::${symbolName}`
}

function buildVirtualProgram(files: Map<string, string>): {
  program: ts.Program
  sourcePaths: string[]
} {
  const sourcePaths = Array.from(files.keys())
    .filter(isSourceFilePath)
    .map(toVirtualPath)

  const compilerOptions: ts.CompilerOptions = {
    allowJs: true,
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    jsx: ts.JsxEmit.ReactJSX,
    strict: true,
    skipLibCheck: true,
  }

  const baseHost = ts.createCompilerHost(compilerOptions, true)

  const host: ts.CompilerHost = {
    ...baseHost,
    getCurrentDirectory: () => REPO_ROOT,
    fileExists: (fileName) => {
      const normalized = fileName.replaceAll('\\', '/')

      if (normalized.startsWith(REPO_ROOT)) {
        return files.has(toRelativePath(normalized))
      }

      return baseHost.fileExists(normalized)
    },
    readFile: (fileName) => {
      const normalized = fileName.replaceAll('\\', '/')

      if (normalized.startsWith(REPO_ROOT)) {
        return files.get(toRelativePath(normalized))
      }

      return baseHost.readFile(normalized)
    },
    getSourceFile: (fileName, languageVersion, onError, shouldCreateNewSourceFile) => {
      const normalized = fileName.replaceAll('\\', '/')

      if (normalized.startsWith(REPO_ROOT)) {
        const content = files.get(toRelativePath(normalized))

        if (content === undefined) {
          return undefined
        }

        return ts.createSourceFile(normalized, content, languageVersion, true)
      }

      return baseHost.getSourceFile(fileName, languageVersion, onError, shouldCreateNewSourceFile)
    },
  }

  return {
    program: ts.createProgram(sourcePaths, compilerOptions, host),
    sourcePaths,
  }
}

function extractImports(sourceFile: ts.SourceFile): Import[] {
  const imports: Import[] = []

  function visit(node: ts.Node): void {
    if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier)) {
      imports.push({
        specifier: node.moduleSpecifier.text,
        resolved: null,
        isExternal: false,
      })
    }

    if (
      ts.isCallExpression(node) &&
      node.expression.kind === ts.SyntaxKind.ImportKeyword &&
      node.arguments.length > 0 &&
      ts.isStringLiteral(node.arguments[0])
    ) {
      imports.push({
        specifier: node.arguments[0].text,
        resolved: null,
        isExternal: false,
      })
    }

    ts.forEachChild(node, visit)
  }

  visit(sourceFile)
  return imports
}

function parseProgram(files: Map<string, string>): ParsedProgram {
  const { program, sourcePaths } = buildVirtualProgram(files)
  const checker = program.getTypeChecker()

  const parsedFiles = new Map<string, ParsedFile>()

  for (const sourcePath of sourcePaths) {
    const sourceFile = program.getSourceFile(sourcePath)

    if (!sourceFile) {
      continue
    }

    const filePath = toRelativePath(sourcePath)
    const fileContent = files.get(filePath) ?? ''

    const declarations: ParsedDeclaration[] = []
    const exports: ParsedExport[] = []
    const calls: FunctionCall[] = []
    const imports = extractImports(sourceFile)
    const symbolIdByName = new Map<string, string>()
    const callerStack: string[] = []

    function addDeclaration(
      name: string,
      kind: ParsedDeclaration['kind'],
      node: ts.Node,
      isExported: boolean,
    ): void {
      const line = getNodeLine(sourceFile, node)
      const id = declarationId(filePath, name)
      declarations.push({ id, name, kind, line, isExported })
      symbolIdByName.set(name, id)

      if (isExported) {
        exports.push({ id, name, kind, line })
      }
    }

    function resolveCallTarget(node: ts.CallExpression): string | null {
      const signature = checker.getResolvedSignature(node)
      const declaration = signature?.declaration

      if (declaration) {
        const symbol = checker.getSymbolAtLocation(
          (declaration as ts.NamedDeclaration).name ?? declaration,
        )

        if (symbol) {
          const symbolName = symbol.getName()

          if (symbolName && symbolName !== '__function') {
            const declarationFile = declaration.getSourceFile().fileName.replaceAll('\\', '/')

            if (declarationFile.startsWith(REPO_ROOT)) {
              const relPath = toRelativePath(declarationFile)
              return declarationId(relPath, symbolName)
            }

            return symbolName
          }
        }
      }

      if (ts.isIdentifier(node.expression)) {
        return symbolIdByName.get(node.expression.text) ?? node.expression.text
      }

      if (ts.isPropertyAccessExpression(node.expression)) {
        return node.expression.getText(sourceFile)
      }

      return null
    }

    function visit(node: ts.Node): void {
      if (ts.isFunctionDeclaration(node) && node.name) {
        const isExported = hasModifier(node, ts.SyntaxKind.ExportKeyword)
        addDeclaration(node.name.text, 'function', node, isExported)
      }

      if (ts.isClassDeclaration(node) && node.name) {
        const isExported = hasModifier(node, ts.SyntaxKind.ExportKeyword)
        addDeclaration(node.name.text, 'class', node, isExported)
      }

      if (ts.isVariableStatement(node)) {
        const isExported = hasModifier(node, ts.SyntaxKind.ExportKeyword)

        for (const declaration of node.declarationList.declarations) {
          if (ts.isIdentifier(declaration.name)) {
            addDeclaration(declaration.name.text, 'variable', declaration, isExported)
          }
        }
      }

      const nextCaller =
        (ts.isFunctionDeclaration(node) ||
          ts.isMethodDeclaration(node) ||
          ts.isArrowFunction(node) ||
          ts.isFunctionExpression(node)) &&
        ((node as ts.FunctionLikeDeclaration).name
          ? `${filePath}::${(node as ts.FunctionLikeDeclaration).name?.getText(sourceFile)}`
          : `${filePath}::anonymous@${getNodeLine(sourceFile, node)}`)

      if (nextCaller) {
        callerStack.push(nextCaller)
      }

      if (ts.isCallExpression(node)) {
        const callee = resolveCallTarget(node)
        const caller = callerStack[callerStack.length - 1]

        if (callee && caller) {
          calls.push({
            caller,
            callee,
            line: getNodeLine(sourceFile, node),
          })
        }
      }

      ts.forEachChild(node, visit)

      if (nextCaller) {
        callerStack.pop()
      }
    }

    visit(sourceFile)

    parsedFiles.set(filePath, {
      path: filePath,
      exports,
      imports,
      calls,
      declarations,
      size: fileContent.length,
    })
  }

  return {
    files: Array.from(parsedFiles.values()),
  }
}

export function parseTypeScriptFiles(files: Map<string, string>): ParsedFile[] {
  return parseProgram(files).files
}
