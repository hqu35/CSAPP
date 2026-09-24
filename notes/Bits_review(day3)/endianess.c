#include <stdio.h>

int main(void) {
    unsigned int x = 0x12345678;
    unsigned char *p = (unsigned char *)&x;

    for (size_t i = 0; i < sizeof(x); i++) {
        printf("byte %zu: 0x%02X\n", i, p[i]);
    }

    return 0;
}