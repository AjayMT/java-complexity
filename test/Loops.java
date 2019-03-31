
// expected cyclomatic complexity: 10

public class Loops {
    public static void main(String args[]) {
        boolean flag = true;
        while (flag) {
            System.out.println("hello");
            if (flag || !flag && (flag || !flag)) flag = false;
        }
        System.out.println("world");
        do {
            System.out.println("baz");
            if (flag) break;
            else continue;
        } while (flag);
    }
}
