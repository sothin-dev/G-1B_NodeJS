import { Repository, In } from 'typeorm'
import { Course } from '../entities/course.entity'
import { AppDataSource } from '../config/database'

export class CourseRepository {
  private repo: Repository<Course>

  constructor() {
    this.repo = AppDataSource.getRepository(Course)
  }

  async findById(id: number): Promise<Course | null> {
    return await this.repo.findOne({ where: { id }, relations: ['schedules'] })
  }

  async findByIds(ids: number[]): Promise<Course[]> {
    return await this.repo.find({ where: { id: In(ids) }, relations: ['schedules'] })
  }

  async getSchedulesForCourses(courseIds: number[]) {
    const courses = await this.repo.find({
      where: { id: In(courseIds) },
      relations: ['schedules'],
    })
    return courses.flatMap(c =>
      c.schedules.map(s => ({ ...s, course_name: c.name }))
    )
  }
}
