import * as path from 'path'
import * as ts from 'typescript'
import * as lsif from './lsif'
import { Input } from './Input'
import { Options, DocEntry, lsif_typed } from './main'
import { Visitor } from './Visitor'
import { LsifSymbol } from './LsifSymbol'
import { Packages } from './Packages'

export class Indexer {
  public options: Options
  public program: ts.Program
  public checker: ts.TypeChecker
  public output: DocEntry[] = []
  public symbolsCache: Map<ts.Node, LsifSymbol> = new Map()
  public packages: Packages
  constructor(public readonly config: ts.ParsedCommandLine, options: Options) {
    this.options = options
    this.program = ts.createProgram(config.fileNames, config.options)
    this.checker = this.program.getTypeChecker()
    this.packages = new Packages(options.project)
  }
  public index(): void {
    this.options.writeIndex(
      new lsif_typed.Index({
        metadata: new lsif_typed.Metadata({
          project_root: this.options.project,
        }),
      })
    )
    // Visit every sourceFile in the program
    for (const sourceFile of this.program.getSourceFiles()) {
      const includes = this.config.fileNames.includes(sourceFile.fileName)
      if (includes) {
        const doc = new lsif.lib.codeintel.lsif_typed.Document({
          relative_path: path.relative(
            this.options.project,
            sourceFile.fileName
          ),
          occurrences: [],
        })
        const input = new Input(sourceFile.fileName, sourceFile.getText())
        const visitor = new Visitor(
          this.checker,
          input,
          doc,
          this.symbolsCache,
          this.packages,
          sourceFile
        )
        // console.log({ fileName: sourceFile.fileName });
        visitor.index()
        if (visitor.doc.occurrences.length > 0) {
          this.options.writeIndex(
            new lsif.lib.codeintel.lsif_typed.Index({
              documents: [visitor.doc],
            })
          )
        }
      }
    }
  }
}
