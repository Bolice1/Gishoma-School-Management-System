# Gishoma School - Database Schema

## Entity Relationship Overview

```
Users (1) ──────< (0..1) Students
   │
   └────────────< (0..1) Teachers
                       │
                       └───< Courses ───< Enrollments >─── Students
                       │
                       ├───< Marks >─── Students
                       ├───< Homework >───< HomeworkSubmissions >─── Students
                       ├───< Exercises >───< ExerciseSubmissions >─── Students
                       ├───< Notes
                       └───< Discipline >─── Students

Fees ───< Payments >─── Students
Attendance (student | teacher) ─── Students / Teachers / Courses
```

## Tables

### users
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | PK |
| email | VARCHAR | Unique |
| password | VARCHAR | Hashed |
| firstName | VARCHAR | |
| lastName | VARCHAR | |
| role | ENUM | admin, bursar, dean, teacher, student |
| phone | VARCHAR | Optional |
| isActive | BOOLEAN | Default true |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

### students
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | PK |
| user_id | UUID | FK → users |
| student_id | VARCHAR | Unique (e.g. S001) |
| class | VARCHAR | e.g. Senior 1 |
| section | VARCHAR | e.g. A |
| date_of_birth | DATE | |
| gender | ENUM | male, female, other |
| parent_name | VARCHAR | |
| parent_phone | VARCHAR | |
| address | TEXT | |
| enrollment_date | DATE | |

### teachers
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | PK |
| user_id | UUID | FK → users |
| employee_id | VARCHAR | Unique |
| specialization | VARCHAR | |
| hire_date | DATE | |

### courses
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | PK |
| teacher_id | UUID | FK → teachers |
| name | VARCHAR | |
| code | VARCHAR | Unique |
| class_level | VARCHAR | |
| credits | INTEGER | |

### enrollments
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | PK |
| student_id | UUID | FK → students |
| course_id | UUID | FK → courses |
| academic_year | VARCHAR | |
| status | ENUM | active, completed, withdrawn |

### attendance
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | PK |
| student_id | UUID | FK (nullable for teacher att) |
| teacher_id | UUID | FK (nullable for student att) |
| course_id | UUID | FK (nullable) |
| date | DATE | |
| status | ENUM | present, absent, late, excused |
| type | ENUM | student, teacher |

### marks
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | PK |
| student_id | UUID | FK |
| course_id | UUID | FK |
| teacher_id | UUID | FK |
| term | VARCHAR | |
| academic_year | VARCHAR | |
| exam_type | ENUM | midterm, final, assignment, quiz |
| score | DECIMAL | |
| max_score | DECIMAL | Default 100 |

### disciplines
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | PK |
| student_id | UUID | FK |
| teacher_id | UUID | FK |
| type | ENUM | warning, reprimand, suspension, expulsion |
| description | TEXT | |
| date | DATE | |
| resolution | TEXT | |
| status | ENUM | open, resolved, closed |

### homeworks
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | PK |
| course_id | UUID | FK |
| teacher_id | UUID | FK |
| title | VARCHAR | |
| description | TEXT | |
| due_date | TIMESTAMP | |
| max_score | DECIMAL | |
| status | ENUM | draft, published, closed |

### homework_submissions
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | PK |
| homework_id | UUID | FK |
| student_id | UUID | FK |
| content | TEXT | |
| score | DECIMAL | |
| submitted_at | TIMESTAMP | |
| status | ENUM | submitted, graded, late |

### exercises
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | PK |
| course_id | UUID | FK |
| teacher_id | UUID | FK |
| title | VARCHAR | |
| questions | JSONB | Array of Q&A |
| due_date | TIMESTAMP | |
| max_score | DECIMAL | |
| status | ENUM | draft, active, closed |

### exercise_submissions
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | PK |
| exercise_id | UUID | FK |
| student_id | UUID | FK |
| answers | JSONB | |
| score | DECIMAL | |
| submitted_at | TIMESTAMP | |

### notes
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | PK |
| course_id | UUID | FK |
| teacher_id | UUID | FK |
| title | VARCHAR | |
| content | TEXT | |
| topic | VARCHAR | |

### fees
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | PK |
| name | VARCHAR | |
| amount | DECIMAL | |
| term | VARCHAR | |
| academic_year | VARCHAR | |
| due_date | DATE | |
| is_active | BOOLEAN | |

### payments
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | PK |
| student_id | UUID | FK |
| fee_id | UUID | FK |
| amount | DECIMAL | |
| receipt_number | VARCHAR | Unique |
| payment_method | ENUM | cash, bank, mobile_money, check |
| payment_date | TIMESTAMP | |

### announcements
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | PK |
| title | VARCHAR | |
| content | TEXT | |
| author_id | UUID | FK → users |
| target_role | ENUM | all, students, teachers, admin |
| priority | ENUM | low, medium, high, urgent |
