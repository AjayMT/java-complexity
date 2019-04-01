#!/usr/bin/env node

const antlr = require('antlr4')
const ErrorListener = antlr.error.ErrorListener
const JavaLexer = require('./grammar/JavaLexer').JavaLexer
const JavaParser = require('./grammar/JavaParser').JavaParser
const JavaParserListener = require('./grammar/JavaParserListener').JavaParserListener


class FailErrorListener extends ErrorListener {
  constructor(target) {
    super()
    this.target = target
  }

  syntaxError (recognizer, offendingSymbol, line, column, msg, e) {
    super.syntaxError(recognizer, offendingSymbol, line, column, msg, e)
    this.target.failed = true
  }
}


class JavaComplexity extends JavaParserListener {
  constructor (input) {
    super()

    let chars = new antlr.InputStream(input)
    let lexer = new JavaLexer(chars)
    let tokens = new antlr.CommonTokenStream(lexer)
    this.parser = new JavaParser(tokens)
    this.parser.buildParseTrees = true
    this.failed = false
    this.parser.addErrorListener(new FailErrorListener(this))

    this.complexityList = []
    this.currentComplexity = 1
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
    if (!root) root = 'classBodyDeclaration'

    let tree = this.parser[root]()
    antlr.tree.ParseTreeWalker.DEFAULT.walk(this, tree)

    if (this.complexityList.length === 0)
      this.complexityList.push(this.currentComplexity)

    if (this.failed) return [0]

    return this.complexityList
  }

  exitMethodBody (ctx) {
    this.complexityList.push(this.currentComplexity)
    this.currentComplexity = 1
  }

  enterStatement (ctx) {
    let head = ctx.children[0].getText()

    if ((head === 'break' || head === 'continue') && this.insideSwitchBlock)
      return

    if (this.complexTokens.indexOf(head) !== -1) {
      ++this.currentComplexity
      this.insideSwitchBlock = false
    }
  }

  enterExpression (ctx) {
    this.currentComplexity += ctx.children.filter(
      (c) => this.complexTokens.indexOf(c.getText()) !== -1
    ).length
  }

  enterSwitchLabel (ctx) {
    this.insideSwitchBlock = true
    let head = ctx.children[0].getText()
    if (this.complexTokens.indexOf(head) !== -1)
      ++this.currentComplexity
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
    result = [0]
    roots = ['blockStatements', 'classBodyDeclaration', 'compilationUnit']
    while (result[0] === 0 && roots.length > 0) {
      result = (new JavaComplexity(input)).computeComplexity(roots[roots.length - 1])
      roots.pop()
    }

    console.log(result)
  })
}

module.exports = JavaComplexity
