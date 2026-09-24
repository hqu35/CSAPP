#include <stdio.h>
#include <stdlib.h>

int main(void) {
    int *p = malloc(sizeof(int));
    if (p == NULL) return 1;

    *p = 42;
    printf("before free: %d\n", *p);

    free(p);

    // Intentional bug:
    printf("after free: %d\n", *p);

    return 0;
}
