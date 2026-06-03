import authRepository from '../repository/auth.repository'
import { TeacherRepository } from '../repository/teacher.repository'
import { Roles } from '../constants/roles'
import { Teacher } from '../entities/teacher.entity'

export class TeacherService {
  private readonly teacherRepo: TeacherRepository

  constructor() {
    this.teacherRepo = new TeacherRepository()
  }

  async listTeachers(): Promise<Teacher[]> {
    return await this.teacherRepo.findAll()
  }

  async getTeacherById(id: number): Promise<Teacher> {
    const teacher = await this.teacherRepo.findById(id)
    if (!teacher) throw new Error('Teacher not found')
    return teacher
  }

  async createTeacher(data: Partial<Teacher>): Promise<Teacher> {
    if (!data.userId) {
      throw new Error('userId is required to create a teacher')
    }

    const user = await authRepository.findById(data.userId)
    if (!user) {
      throw new Error('User not found')
    }

    if (user.role?.name !== Roles.TEACHER) {
      throw new Error('User must have TEACHER role to become a teacher profile')
    }

    const existingTeacher = await this.teacherRepo.findByUserId(data.userId)
    if (existingTeacher) {
      throw new Error('Teacher profile already exists for this user')
    }

    return await this.teacherRepo.create(data)
  }

  async updateTeacher(id: number, data: Partial<Teacher>): Promise<Teacher> {
    const teacher = await this.teacherRepo.update(id, data)
    if (!teacher) throw new Error('Teacher not found')
    return teacher
  }

  async deleteTeacher(id: number): Promise<void> {
    const deleted = await this.teacherRepo.delete(id)
    if (!deleted) throw new Error('Teacher not found')
  }
}
