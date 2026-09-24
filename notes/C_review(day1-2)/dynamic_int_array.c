#include<stdio.h>
#include<stdlib.h>
int main(void){
    int n = 5;
    int* arr = (int*) calloc(n,sizeof(int));
    for(int i = 0;i < 5;i++){
        printf("%d",arr[i]); // expected to be 0
	if(i == 4){
           printf("\n");
        }
    }
    for(int i = 1;i <= 5 ;i++){
        arr[i-1] = 10 * i;
	printf("%d", arr[i-1]);
	if(i == 5){
	   printf("\n");
        }
    }
    free(arr);
    return 0;
}
