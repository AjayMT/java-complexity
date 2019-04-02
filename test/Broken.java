public static int countArrayGreaterThan (int[]input, int compare) {
    int sum = 0;
    if (input == null) {
        return 0;
    }
    for (int i = 0; i < input.length; i++) {
        for (int j = 0; j < input[i].length; j++) {
            if (input[i][j] > compare) {
                sum += 1
                    }
        return sum;

