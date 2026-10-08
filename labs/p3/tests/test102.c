// a few allocations in multiples of 4 bytes
#include <assert.h>
#include <stdlib.h>
#include "p3Heap.h"
#include <stdio.h>

int main() {
   assert(init_heap(4096) == 0);
   
   assert(alloc(4) != NULL);
   printf("Pass alloc(4)\n");

   assert(alloc(8) != NULL);
   printf("Pass alloc(8)\n");

   assert(alloc(16) != NULL);
   printf("Pass alloc(16)\n");

   assert(alloc(24) != NULL);
   printf("Pass alloc(24)\n");

   exit(0);
}
