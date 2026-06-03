import { Repository } from 'typeorm'
import { Semester, SemesterStatus } from '../entities/semester.entity'
import { AppDataSource } from '../config/database'

export class SemesterRepository {
  private readonly repo: Repository<Semester>

  constructor() {
    this.repo = AppDataSource.getRepository(Semester)
  }

  async findById(id: number): Promise<Semester | null> {
    return await this.repo.findOne({ where: { id } })
  }

  async findActive(): Promise<Semester | null> {
    return await this.repo.findOne({ where: { status: SemesterStatus.ACTIVE } })
  }

  async findAll(): Promise<Semester[]> {
    return await this.repo.find({ order: { start_date: 'DESC' } })
  }

  async create(data: Partial<Semester>): Promise<Semester> {
    const semester = this.repo.create(data)
    return this.repo.save(semester)
  }

  async update(id: number, data: Partial<Semester>): Promise<Semester | null> {
    const semester = await this.findById(id)
    if (!semester) return null
    Object.assign(semester, data)
    return this.repo.save(semester)
  }

  async delete(id: number): Promise<boolean> {
    const semester = await this.findById(id)
    if (!semester) return false
    await this.repo.remove(semester)
    return true
  }
}
