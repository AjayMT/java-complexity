#!/usr/bin/env node

const antlr = require('antlr4')
const JavaLexer = require('./grammar/JavaLexer').JavaLexer
const JavaParser = require('./grammar/JavaParser').JavaParser
const JavaParserListener = require('./grammar/JavaParserListener').JavaParserListener

class JavaComplexity extends JavaParserListener {
  constructor (input) {
    super()

    let chars = new antlr.InputStream(input)
    let lexer = new JavaLexer(chars)
    let tokens = new antlr.CommonTokenStream(lexer)
    this.parser = new JavaParser(tokens)
    this.parser._errHandler = new antlr.error.BailErrorStrategy()
    this.parser.buildParseTrees = true

    this.complexity = 0
    this.complexTokens = [
      'if', 'else', 'for', 'while', 'do', 'case', // control flow
      'break', 'continue', // only when in loops, not switch blocks
      '&&', '||', '?' // operators
    ]

    this.insideSwitchBlock = false // there is probably a better way to do this

    // TODO increment complexity for every return statement that isn't the last
    // statement in the method

    return this
  }

  computeComplexity (root) {
    if (!root) root = 'methodDeclaration'

    let tree = this.parser[root]()
    antlr.tree.ParseTreeWalker.DEFAULT.walk(this, tree)

    return this.complexity
  }

  enterMethodBody (ctx) { this.complexity = 1  }

  enterStatement (ctx) {
    let head = ctx.children[0].getText()

    if ((head === 'break' || head === 'continue') && this.insideSwitchBlock)
      return

    if (this.complexTokens.indexOf(head) !== -1) {
      ++this.complexity
      this.insideSwitchBlock = false
    }
  }

  enterExpression (ctx) {
    this.complexity += ctx.children.filter(
      (c) => this.complexTokens.indexOf(c.getText()) !== -1
    ).length
  }

  enterSwitchLabel (ctx) {
    this.insideSwitchBlock = true
    let head = ctx.children[0].getText()
    if (this.complexTokens.indexOf(head) !== -1)
      ++this.complexity
  }

  enterSwitchBlockStatementGroup (ctx) { this.insideSwitchBlock = true }
  exitSwitchBlockStatementGroup (ctx) { this.insideSwitchBlock = false }
}

if (require.main === module) {
  let input = ''
  process.stdin.setEncoding('utf8')
  process.stdin.on('readable', () => {
    let chunk
    while ((chunk = process.stdin.read()) !== null)
      input += chunk
  })
  process.stdin.on('end', () => {
    console.log((new JavaComplexity(input)).computeComplexity('compilationUnit'))
  })
}

module.exports = JavaComplexity
