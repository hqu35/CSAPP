#include <stdio.h>
#include <stddef.h>
struct Student{
    char grade;
    int age;
    double score;
};
int main(void){
    struct Student s;
    printf("sizeof(struct Student) = %zu\n", sizeof(struct Student));
    printf("&s = %p\n", (void *)&s);
    printf("&s.grade = %p\n", (void *)&s.grade);
    printf("&s.age = %p\n", (void *)&s.age);
    printf("&s.score = %p\n", (void *)&s.score);
    printf("offset grade = %zu\n", offsetof(struct Student, grade));
    printf("offset age = %zu\n", offsetof(struct Student, age));
    printf("offset score = %zu\n", offsetof(struct Student, score));
    return 0;
}