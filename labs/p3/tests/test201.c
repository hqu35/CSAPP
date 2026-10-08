// a few allocations in multiples of 4 bytes followed by frees
#include <assert.h>
#include <stdlib.h>
#include <stdio.h>
#include "p3Heap.h"

int main() {
   assert(init_heap(4096) == 0);
   void* ptr2[4];

   ptr2[0] = alloc(4);
   ptr2[1] = alloc(8);
   // ****(header1) ****(payload1)
   //                             ****(header2) ********(payload2) ****(padding2)

   assert(free_block(ptr2[0]) == 0);
   printf("test1 Passes\n");
   fflush(stdout);

   assert(free_block(ptr2[1]) == 0);
   printf("test2 Passes\n");
   fflush(stdout);

   ptr2[2] = alloc(16);
   ptr2[3] = alloc(4);

   assert(free_block(ptr2[2]) == 0);
   printf("test3 Passes\n");
   assert(free_block(ptr2[3]) == 0);
   printf("test4 Passes\n");

   exit(0);
}
