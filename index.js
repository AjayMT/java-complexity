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
  constructor (input, suppressErrs) {
    super()

    this.inputStream = new antlr.InputStream(input)
    this.lexer = new JavaLexer(this.inputStream)
    this.tokenStream = new antlr.CommonTokenStream(this.lexer)
    this.parser = new JavaParser(this.tokenStream)
    this.parser.buildParseTrees = true
    this.failed = false
    if (suppressErrs) this.parser.removeErrorListeners()
    this.parser.addErrorListener(new FailErrorListener(this))

    this.complexityValues = {}
    this.currentComplexity = 1
    this.currentMethodName = 'root'
    this.complexTokens = [
      'if', 'else', 'for', 'while', 'do', 'case', 'catch', // control flow
      'break', 'continue', // only when in loops, not switch blocks
      '&&', '||', '?' // operators
    ]

    this.insideSwitchBlock = false

    // TODO increment complexity for every return statement that isn't the last
    // statement in the method

    return this
  }

  computeComplexity (root) {
    if (!root) root = 'methodSubmission'

    let tree = this.parser[root]()
    antlr.tree.ParseTreeWalker.DEFAULT.walk(this, tree)

    if (Object.values(this.complexityValues).length === 0)
      this.complexityValues[this.currentMethodName] = this.currentComplexity

    if (this.failed) return null

    return {
      complexityValues: this.complexityValues,
      total: Object.values(this.complexityValues).reduce((a, b) => a + b, 0)
    }
  }

  enterMethodDeclaration (ctx) {
    this.currentMethodName = ctx.children[1].getText()
  }

  enterClassOrInterfaceModifier (ctx) {
    if (ctx.getText() === 'public' && this.currentComplexity === 0)
      this.currentComplexity = 1
  }

  exitMethodBody (ctx) {
    this.complexityValues[this.currentMethodName] = this.currentComplexity
    this.currentComplexity = 0
    this.currentMethodName = 'root'
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

  enterCatchClause (ctx) { ++this.currentComplexity }

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


function computeComplexity (input, suppress, root) {
  let result = null
  let roots
  if (typeof root === 'string') roots = [root]
  else roots = ['snippetSubmission', 'methodSubmission', 'compilationUnit']

  while (result === null && roots.length > 0) {
    let root = roots.pop()
    result = (new JavaComplexity(input, suppress)).computeComplexity(root)
  }

  return result
}


if (require.main === module) {
  let opts = require('minimist')(process.argv.slice(2))
  let input = ''

  function read () {
    let result = computeComplexity(input, opts['s'])
    console.log(result)
    if (result === null) process.exit(1)
  }

  if (opts['_'].length > 0) {
    input = opts['_'][0]
    read()
  } else {
    process.stdin.on('readable', () => {
      let chunk
      while ((chunk = process.stdin.read()) !== null)
        input += chunk
    })
    process.stdin.on('end', read)
  }
}

module.exports = computeComplexity
