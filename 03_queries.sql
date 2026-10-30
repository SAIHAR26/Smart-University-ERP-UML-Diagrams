USE smart_university_erp;

-- 1. Students with department
SELECT s.student_id, u.full_name, s.admission_no, d.department_name, s.current_semester, s.cgpa
FROM students s JOIN users u ON u.user_id=s.user_id JOIN departments d ON d.department_id=s.department_id
ORDER BY s.student_id;

-- 2. Students with registered courses
SELECT u.full_name AS student, c.course_code, c.course_name, e.academic_year, e.status
FROM enrollments e JOIN students s ON s.student_id=e.student_id JOIN users u ON u.user_id=s.user_id JOIN courses c ON c.course_id=e.course_id
ORDER BY u.full_name,c.course_code;

-- 3. Attendance percentage (PRESENT and LATE count as attended)
SELECT s.student_id,u.full_name,COUNT(ar.attendance_record_id) AS sessions,
       ROUND(100.0*SUM(ar.status IN ('PRESENT','LATE','EXCUSED'))/NULLIF(COUNT(ar.attendance_record_id),0),2) AS attendance_percent
FROM students s JOIN users u ON u.user_id=s.user_id LEFT JOIN attendance_records ar ON ar.student_id=s.student_id
GROUP BY s.student_id,u.full_name ORDER BY s.student_id;

-- 4. Published student results
SELECT u.full_name,c.course_code,x.exam_name,r.marks_obtained,x.max_marks,r.grade,r.published_at
FROM results r JOIN students s ON s.student_id=r.student_id JOIN users u ON u.user_id=s.user_id
JOIN examinations x ON x.examination_id=r.examination_id JOIN courses c ON c.course_id=x.course_id
ORDER BY u.full_name,c.course_code;

-- 5. Students at HIGH academic risk
SELECT u.full_name,s.admission_no,ar.overall_score,ar.risk_level,ar.recommendation,ar.generated_on
FROM academic_risk ar JOIN students s ON s.student_id=ar.student_id JOIN users u ON u.user_id=s.user_id
WHERE ar.risk_level='HIGH' ORDER BY ar.overall_score;

-- 6. Pending leave requests
SELECT lr.leave_request_id,u.full_name,lr.start_date,lr.end_date,lr.reason,lr.requested_at
FROM leave_requests lr JOIN students s ON s.student_id=lr.student_id JOIN users u ON u.user_id=s.user_id
WHERE lr.status='PENDING' ORDER BY lr.requested_at;

-- 7. Unpaid or partially paid fees
SELECT sf.student_fee_id,u.full_name,sf.fee_type,sf.academic_year,sf.amount_due,
       COALESCE(SUM(CASE WHEN p.payment_status='SUCCESS' THEN p.amount_paid ELSE 0 END),0) AS amount_paid,
       sf.amount_due-COALESCE(SUM(CASE WHEN p.payment_status='SUCCESS' THEN p.amount_paid ELSE 0 END),0) AS balance_due,sf.due_date
FROM student_fees sf JOIN students s ON s.student_id=sf.student_id JOIN users u ON u.user_id=s.user_id
LEFT JOIN payments p ON p.student_fee_id=sf.student_fee_id GROUP BY sf.student_fee_id,u.full_name
HAVING balance_due>0 ORDER BY balance_due DESC;

-- 8. Placement applications
SELECT po.company_name,po.job_title,u.full_name AS student,pa.status,pa.applied_at
FROM placement_applications pa JOIN placement_opportunities po ON po.opportunity_id=pa.opportunity_id
JOIN students s ON s.student_id=pa.student_id JOIN users u ON u.user_id=s.user_id ORDER BY po.company_name,u.full_name;

-- 9. Active placement opportunities
SELECT company_name,job_title,minimum_cgpa,application_deadline
FROM placement_opportunities WHERE status='ACTIVE' AND application_deadline>=CURRENT_DATE ORDER BY application_deadline;

-- 10. SOS requests and response status
SELECT sr.sos_id,u.full_name,sr.location,sr.message,sr.raised_on,sr.status,
       responder.full_name AS assigned_responder,sr.resolved_at
FROM sos_requests sr JOIN students s ON s.student_id=sr.student_id JOIN users u ON u.user_id=s.user_id
LEFT JOIN users responder ON responder.user_id=sr.assigned_to ORDER BY sr.raised_on DESC;

-- 11. Timetable with course, faculty, room, and time
SELECT t.academic_year,t.section_name,ts.day_of_week,ts.start_time,ts.end_time,c.course_code,c.course_name,
       fu.full_name AS faculty,cl.building,cl.room_number
FROM timetable t JOIN courses c ON c.course_id=t.course_id JOIN faculty f ON f.faculty_id=t.faculty_id
JOIN users fu ON fu.user_id=f.user_id JOIN classrooms cl ON cl.classroom_id=t.classroom_id JOIN time_slots ts ON ts.time_slot_id=t.time_slot_id
ORDER BY FIELD(ts.day_of_week,'MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY','SUNDAY'),ts.start_time;

-- 12. Parent and student relationships
SELECT pu.full_name AS parent,pu.email AS parent_email,ps.relationship_label,su.full_name AS student,s.admission_no,ps.is_primary_contact
FROM parent_student link JOIN parents ps ON ps.parent_id=link.parent_id JOIN users pu ON pu.user_id=ps.user_id
JOIN students s ON s.student_id=link.student_id JOIN users su ON su.user_id=s.user_id ORDER BY pu.full_name,su.full_name;

-- Useful screenshot tables
SELECT f.faculty_id,u.full_name,u.email,d.department_name,f.designation,f.employee_no
FROM faculty f JOIN users u ON u.user_id=f.user_id JOIN departments d ON d.department_id=f.department_id ORDER BY d.department_name,u.full_name;
SELECT c.course_code,c.course_name,d.department_name,c.credits,c.semester FROM courses c JOIN departments d ON d.department_id=c.department_id ORDER BY d.department_name,c.course_code;
SELECT ar.risk_id,u.full_name,ar.attendance_score,ar.academic_score,ar.assignment_score,ar.overall_score,ar.risk_level,ar.recommendation FROM academic_risk ar JOIN students s ON s.student_id=ar.student_id JOIN users u ON u.user_id=s.user_id ORDER BY ar.overall_score;
SELECT sf.student_fee_id,u.full_name,sf.fee_type,sf.amount_due,COALESCE(SUM(CASE WHEN p.payment_status='SUCCESS' THEN p.amount_paid ELSE 0 END),0) amount_paid FROM student_fees sf JOIN students s ON s.student_id=sf.student_id JOIN users u ON u.user_id=s.user_id LEFT JOIN payments p ON p.student_fee_id=sf.student_fee_id GROUP BY sf.student_fee_id,u.full_name ORDER BY u.full_name;

-- Table inventory and counts for validation
SHOW TABLES;
SELECT 'departments' AS table_name,COUNT(*) AS row_count FROM departments UNION ALL SELECT 'users',COUNT(*) FROM users UNION ALL SELECT 'students',COUNT(*) FROM students UNION ALL SELECT 'faculty',COUNT(*) FROM faculty UNION ALL SELECT 'parents',COUNT(*) FROM parents UNION ALL SELECT 'admins',COUNT(*) FROM admins UNION ALL SELECT 'courses',COUNT(*) FROM courses UNION ALL SELECT 'enrollments',COUNT(*) FROM enrollments UNION ALL SELECT 'classrooms',COUNT(*) FROM classrooms UNION ALL SELECT 'time_slots',COUNT(*) FROM time_slots UNION ALL SELECT 'timetable',COUNT(*) FROM timetable UNION ALL SELECT 'attendance',COUNT(*) FROM attendance UNION ALL SELECT 'attendance_records',COUNT(*) FROM attendance_records UNION ALL SELECT 'assignments',COUNT(*) FROM assignments UNION ALL SELECT 'submissions',COUNT(*) FROM submissions UNION ALL SELECT 'examinations',COUNT(*) FROM examinations UNION ALL SELECT 'results',COUNT(*) FROM results UNION ALL SELECT 'student_fees',COUNT(*) FROM student_fees UNION ALL SELECT 'payments',COUNT(*) FROM payments UNION ALL SELECT 'leave_requests',COUNT(*) FROM leave_requests UNION ALL SELECT 'notices',COUNT(*) FROM notices UNION ALL SELECT 'complaints',COUNT(*) FROM complaints UNION ALL SELECT 'placement_opportunities',COUNT(*) FROM placement_opportunities UNION ALL SELECT 'placement_applications',COUNT(*) FROM placement_applications UNION ALL SELECT 'sos_requests',COUNT(*) FROM sos_requests UNION ALL SELECT 'academic_risk',COUNT(*) FROM academic_risk UNION ALL SELECT 'parent_student',COUNT(*) FROM parent_student;
