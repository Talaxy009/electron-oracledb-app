# electron-oracledb-app

数据库实验课的作业，前后断断续续花了三周时间来学习 Electron 和开发这个系统。学习到了很多 Electron 和 React Hook 的相关知识。

## 用于搭建数据库的SQL语句

```sql
--表格
CREATE table Course(cno VARCHAR2(5) PRIMARY KEY, cname VARCHAR2(20) NOT NULL, ccredit NUMBER(2), tno VARCHAR2(20), FOREIGN KEY(tno) REFERENCES Teacher(tno) on delete cascade);

CREATE table Student(sno VARCHAR2(17) PRIMARY KEY, sname VARCHAR2(10) NOT NULL, sage NUMBER(3), ssex VARCHAR2(3));
create table Teacher (TNO VARCHAR2(20) primary key, TName VARCHAR2(20) not null, TTitle VARCHAR2(8) not null, TSalary NUMBER(30,2));

CREATE table Sc(sno VARCHAR2(17), cno VARCHAR2(5), grade NUMBER(5,2), PRIMARY KEY(sno,cno), FOREIGN KEY(sno) REFERENCES Student(sno) on delete cascade, FOREIGN KEY(cno) REFERENCES Course(cno) on delete cascade);

--视图
create view StudentSummary as (
SELECT sno,SUM(ccredit)sum,AVG(grade)avg,MAX(grade)max,MIN(grade)min FROM sc join course on sc.cno = course.cno
GROUP BY sno
);

create view TeacherSummary as (
SELECT ttitle,AVG(tsalary)avgSalary,count(ttitle)members FROM teacher GROUP BY ttitle
);

create view CourseSummary as (
SELECT course.cname,AVG(grade)avgGrade,MAX(grade)maxGrade,MIN(grade)minGrade FROM sc join course on sc.cno = course.cno
GROUP BY course.cname
);

--以下为学生表的初始数据
insert into Student(sname,ssex,sno, sage) values('李勇','男','1906200001',20);
insert into Student(sname,ssex,sno, sage) values('刘晨','女','1906200002',19);
insert into Student(sname,ssex,sno, sage) values('王敏','女','1906200003',18);
insert into Student(sname,ssex,sno, sage) values('张立','男','1906200004',19);

--以下为课程表的初始数据
insert into course(cno,cname,ccredit,tno) values('2','高等数学',2,'t001');
insert into course(cno,cname,ccredit,tno) values('5','数据结构',4,'t002');
insert into course(cno,cname,ccredit,tno) values('1','数据库',4,'t003');
insert into course(cno,cname,ccredit,tno) values('3','编译原理',4,'t006');
insert into course(cno,cname,ccredit,tno) values('4','面向对象',3,'t008');

--以下为选修表的初始数据
insert into sc(sno,cno,grade) values('1906200001','1',92);
insert into sc(sno,cno,grade) values('1906200001','2',85);
insert into sc(sno,cno,grade) values('1906200001','3',88);
insert into sc(sno,cno,grade) values('1906200002','2',90);
insert into sc(sno,cno,grade) values('1906200002','3',80);
insert into sc(sno,cno,grade) values('1906200002','4',87);

--以下为教师表的初始数据
insert into teacher(tno, tname, tsalary, ttitle) values('t001', '张三', 3000, '导师');
insert into teacher(tno, tname, tsalary, ttitle) values('t002', '李四', 3600,  '教授');
insert into teacher(tno, tname, tsalary, ttitle) values('t003', '王五', 5600, '助讲');
insert into teacher(tno, tname, tsalary, ttitle) values('t004', '刘晨', 5800,  '系主任');
insert into teacher(tno, tname, tsalary, ttitle) values('t005', '王二小', 3500,  '辅导员');
insert into teacher(tno, tname, tsalary, ttitle) values('t006', '李小龙', 5687,  '教授');
insert into teacher(tno, tname, tsalary, ttitle) values('t007', '熊猫', 6000, '导师');
insert into teacher(tno, tname, tsalary, ttitle) values('t008', '李小小', 5687, '教授');

COMMIT;
```
