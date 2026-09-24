#include <stdio.h>
int main(void)
{
    char a[] = "hello";
    char *p = "hello";
    printf("a = %p\n", (void *)a);
    printf("&a[0] = %p\n", (void *)&a[0]);
    printf("p = %p\n", (void *)p);
    printf("&p = %p\n", (void *)&p);
    // Try this safely:
    a[0] = 'H';
    printf("a = %s\n", a);
    printf("sizeof(a) = %zu\n", sizeof(a));
    printf("sizeof(p) = %zu\n", sizeof(p));
    printf("%s\n", p);
    printf("%c\n", *(p+2));
    // DO NOT modify p[0] in normal code.
    // p points to a string literal, which must be treated as non-modifiable.
    return 0;
}