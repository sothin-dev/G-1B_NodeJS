import { Entity, ManyToOne, JoinColumn, PrimaryColumn } from 'typeorm';
import { Enrollment } from './enrollment.entity';
import { Course } from './course.entity';

@Entity('enrollment_courses')
export class EnrollmentCourse {
  @PrimaryColumn()
  enrollment_id: string;

  @PrimaryColumn()
  course_id: string;

  @ManyToOne(() => Enrollment, enrollment => enrollment.enrollmentCourses)
  @JoinColumn({ name: 'enrollment_id' })
  enrollment: Enrollment;

  @ManyToOne(() => Course, course => course.enrollmentCourses)
  @JoinColumn({ name: 'course_id' })
  course: Course;
}