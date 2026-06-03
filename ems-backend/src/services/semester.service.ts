import { SemesterRepository } from '../repository/semester.repository'
import { Semester, SemesterStatus } from '../entities/semester.entity'

export class SemesterService {
  private semesterRepo: SemesterRepository

  constructor() {
    this.semesterRepo = new SemesterRepository()
  }

  async listSemesters(): Promise<Semester[]> {
    return await this.semesterRepo.findAll()
  }

  async getSemesterById(id: number): Promise<Semester> {
    const semester = await this.semesterRepo.findById(id)
    if (!semester) throw new Error('Semester not found')
    return semester
  }

  async createSemester(data: Partial<Semester>): Promise<Semester> {
    if (data.status && !Object.values(SemesterStatus).includes(data.status)) {
      throw new Error('Invalid semester status')
    }

    return await this.semesterRepo.create(data)
  }

  async updateSemester(id: number, data: Partial<Semester>): Promise<Semester> {
    if (data.status && !Object.values(SemesterStatus).includes(data.status)) {
      throw new Error('Invalid semester status')
    }

    const semester = await this.semesterRepo.update(id, data)
    if (!semester) throw new Error('Semester not found')
    return semester
  }

  async deleteSemester(id: number): Promise<void> {
    const deleted = await this.semesterRepo.delete(id)
    if (!deleted) throw new Error('Semester not found')
  }
}
