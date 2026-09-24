#include <stdio.h>
int main(void)
{
    char s[] = "hello";
    printf("sizeof(s) = %zu\n", sizeof(s));
    for (int i = 0; i < (int)sizeof(s); i++)
    {
        printf("s[%d] = %d ('%c')\n",
               i, (unsigned char)s[i],
               s[i] == '\0' ? '#' : s[i]);
    }
    return 0;
}