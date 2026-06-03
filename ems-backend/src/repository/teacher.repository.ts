import { Repository } from 'typeorm'
import { Teacher } from '../entities/teacher.entity'
import { AppDataSource } from '../config/database'

export class TeacherRepository {
  private readonly repo: Repository<Teacher>

  constructor() {
    this.repo = AppDataSource.getRepository(Teacher)
  }

  async findById(id: number): Promise<Teacher | null> {
    return await this.repo.findOne({
      where: { id },
      relations: ['user', 'department'],
    })
  }

  async findByUserId(userId: number): Promise<Teacher | null> {
    return await this.repo.findOne({
      where: { userId },
      relations: ['user', 'department'],
    })
  }

  async findAll(): Promise<Teacher[]> {
    return await this.repo.find({
      relations: ['user', 'department'],
      order: { id: 'ASC' },
    })
  }

  async create(data: Partial<Teacher>): Promise<Teacher> {
    const teacher = this.repo.create(data)
    return this.repo.save(teacher)
  }

  async update(id: number, data: Partial<Teacher>): Promise<Teacher | null> {
    const teacher = await this.findById(id)
    if (!teacher) return null
    Object.assign(teacher, data)
    return this.repo.save(teacher)
  }

  async delete(id: number): Promise<boolean> {
    const teacher = await this.findById(id)
    if (!teacher) return false
    await this.repo.remove(teacher)
    return true
  }
}
