
ANTLR="antlr-4.7.1-complete.jar"

all:
	java -jar bin/$(ANTLR) -Dlanguage=JavaScript -lib grammar/ grammar/JavaLexer.g4
	java -jar bin/$(ANTLR) -Dlanguage=JavaScript -lib grammar/ grammar/JavaParser.g4

.PHONY: clean
clean:
	rm grammar/*.{interp,tokens,js}
