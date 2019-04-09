
public class MultipleMethods {
    public void test() {
        if (true) {
            if (false) {
                do { } while (false);
            }
        }
    }

    public void hello() {
        switch (1) {
        case 2: break;
        case 1: continue;
        default: break;
        }
    }

    public int z00t() {
        System.out.println("z00t");
    }

    private void helper() {
        try {
            doStuff();
        } catch (Exception e) {
            System.out.println("failed to do stuff");
        }
    }

    public void helper2() {
        try { hello(); } finally {}
    }
}
