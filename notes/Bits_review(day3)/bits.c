#include <stdio.h>

void printBinary(unsigned int x){
    if(x == 0){
        printf("0\n");
        return;
    }
    int numBits = 0;
    for(int i = x;i;i>>=1){
        numBits++;
    }
    int reverse[numBits];
    int j = 1;
    for(unsigned int i = x;i && j <= numBits;i >>= 1){
        reverse[numBits - j] = i & 1;
        j++;
    }
    for(int i = 0;i < numBits;i++){
        printf("%d", reverse[i]);
    }
    printf("\n");
}

int main(void) {
    unsigned int x = 0x5A;  // 0101 1010
    unsigned int y = 0x3C;  // 0011 1100
    printBinary(x);
    printBinary(y);

    printf("x & y = 0x%X\n", x & y);
    printBinary(x & y);
    printf("x | y = 0x%X\n", x | y);
    printf("x ^ y = 0x%X\n", x ^ y); // XOR

    printf("x << 1 = 0x%X\n", x << 1);
    printf("x >> 1 = 0x%X\n", x >> 1);

    printf("!!x = %d\n", !!x);
    printf("x && y = %d\n", x && y);

    return 0;
}