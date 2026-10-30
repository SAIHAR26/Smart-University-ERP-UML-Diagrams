# Smart University ERP – UML Diagrams & Basic Web Application

## 📌 Project Overview

Smart University ERP is a university management system designed to simplify and centralize academic and administrative activities.

This project was developed as part of the **Object-Oriented Analysis and Design (OOAD)** course. It includes UML diagrams, a basic Admin web page developed using HTML, CSS, and JavaScript, and database implementation using MySQL.

## 📊 UML Diagrams Included

This repository contains the following UML diagrams:

1. **Use Case Diagram** – Represents the actors and the functionalities they can access in the system.
2. **Activity Diagram** – Illustrates the workflow and sequence of activities within the system.
3. **Component Diagram** – Shows the major software components and their interactions.
4. **State Chart Diagram** – Represents the different states of the system and transitions between them.
5. **Deployment Diagram** – Illustrates how the system is deployed across devices and servers.

## 💻 Basic Web Application

A basic Admin page has been developed using:

- **HTML** – Defines the structure of the web page.
- **CSS** – Handles the layout, styling, and visual appearance.
- **JavaScript** – Adds basic interactivity and dynamic behaviour.

The Admin page provides a basic interface for accessing university management activities.

## 🗄️ Database Implementation

The database is implemented using **MySQL**.

The project database includes the following tables:

| Table | Purpose |
|---|---|
| Students | Stores student information |
| Faculty | Stores faculty information |
| Attendance | Maintains student attendance records |
| Results | Stores student academic results |
| Courses | Stores course details and faculty references |

### Example SQL Queries

**1. Display all students**
```sql
SELECT * FROM students;
```

**2. Display all faculty members**
```sql
SELECT * FROM faculty;
```

**3. View attendance records**
```sql
SELECT * FROM attendance;
```

**4. View student results**
```sql
SELECT * FROM results;
```

**5. Display all available courses**
```sql
SELECT * FROM courses;
```

**6. Display students with their attendance records**
```sql
SELECT s.student_name,
       a.course_name,
       a.attendance_date,
       a.status
FROM students s
JOIN attendance a
ON s.student_id = a.student_id;
```

**7. Display students and their results**
```sql
SELECT s.student_name,
       r.subject,
       r.marks,
       r.grade
FROM students s
JOIN results r
ON s.student_id = r.student_id;
```

## 🎯 Project Objectives

- Understand the requirements of a university management system.
- Represent system functionality using UML diagrams.
- Visualize workflows and interactions between system components.
- Develop a basic Admin interface using web technologies.
- Organize university information using a MySQL database.
- Apply Object-Oriented Analysis and Design concepts.

## 🛠️ Technologies and Tools Used

- HTML
- CSS
- JavaScript
- MySQL
- UML
- MySQL Workbench

## 🎓 Academic Details

**Project Name:** Smart University ERP  
**Subject:** Object-Oriented Analysis and Design (OOAD)  
**Institution:** Aditya University

## 📌 Note

This repository contains the UML design diagrams, basic Admin web interface, and database implementation developed for academic and learning purposes.

---

**Smart University ERP – Simplifying University Management.**
