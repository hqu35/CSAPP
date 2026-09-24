#include <stdio.h>
struct Student{
    char grade;
    int age;
    double score;
};
void changeScore(struct Student* stu){
    stu->score = 50.7;
}
int main(void){
    struct Student s;
    s.grade = 'A';
    s.age = 20;
    s.score = 95.5;
    struct Student *p = &s;
    printf("%c %d %.1f\n", s.grade, s.age, s.score);
    printf("%c %d %.1f\n", p->grade, p->age, p->score);
    changeScore(p);
    printf("%.1f\n", p->score);
    
    return 0;
}