
# java-complexity
This tool approximates the [cyclomatic complexity](https://en.wikipedia.org/wiki/Cyclomatic_complexity) of a snippet of Java code, based loosely on [these rules](https://www.leepoint.net/principles_and_practices/complexity/complexity-java-method.html).

```js
const JavaComplexity = require('java-complexity');

const input = `
void main() {
    int number = 5;
    double pi = 22.0 / 7.0;

    if (number < 0) return;

    switch (number) {
    case 'a': break;
    case 2: break;
    case 5:
        System.out.println("pi is " + (pi > 3 ? "higher" : "lower") + " than 3.");
        break;
    default: break;
    }
}
`

const complexity = (new JavaComplexity(input)).computeComplexity() // => [ 6 ]
```

When invoked from the command line, `java-complexity` reads input from stdin.

## API
### JavaComplexity.computeComplexity([root])
`root` is an optional string parameter that specifies the type of syntax node at the root of the parse tree (see `grammar/JavaParser.g4`). It defaults to `'methodDeclaration'`.

```js
// a 'compilationUnit' is the root of every Java source file
(new JavaComplexity(input)).computeComplexity('compilationUnit')
```

This function returns a list of cyclomatic complexity values of the methods in `input`.

## Invoking from the command-line
```
java-complexity [root]
```
The `root` argument is the same as above. Input is read from stdin.
