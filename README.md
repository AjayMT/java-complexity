
# java-complexity
This tool approximates the [cyclomatic complexity](https://en.wikipedia.org/wiki/Cyclomatic_complexity) of a snippet of Java code, based loosely on [these rules](https://www.leepoint.net/principles_and_practices/complexity/complexity-java-method.html).

```js
const javaComplexity = require('java-complexity');

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

const complexity = javaComplexity(input) // => { complexityValues: [ 6 ], total: 6 }
```

When invoked from the command line, `java-complexity` reads input from stdin.

## API
### javaComplexity(input, [suppressErrors])
`input` is a string of Java code to process. `suppressErrors` is an optional flag that will suppress error logging.

This function returns a list of cyclomatic complexity values (and a total complexity value) in the same order as the methods defined in the input string.
It attempts to parse the input as 
- an entire compilation unit (i.e package declaration, imports and class definitions)
- the inside of a class body
- the inside of a method

If all of these fail, the function returns `null`.

## Invoking from the command-line
```
java-complexity [-s] [input]
```

The `-s` flag suppresses error logging. If `input` is not provided as an argument, it is read from stdin. This program exits with code `1` if it fails to parse the input string.
