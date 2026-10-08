// allocation is too big to fit
#include <assert.h>
#include <stdlib.h>
#include<stdio.h>
#include "p3Heap.h"

int main() {
    assert(init_heap(4096)  == 0);
    assert(alloc(1)    != NULL);
    printf("Pass alloc(1) test\n");
    assert(alloc(4095) == NULL);
    printf("Pass alloc(4095) test\n");
    exit(0);
}
