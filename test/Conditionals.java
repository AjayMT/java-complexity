
// expected cyclomatic complexity: 6

public class Conditionals {
    public static void main(String[] args) {
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
}
