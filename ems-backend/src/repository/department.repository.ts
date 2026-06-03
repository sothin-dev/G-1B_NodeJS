import { Repository } from 'typeorm'
import { Department } from '../entities/department.entity'
import { AppDataSource } from '../config/database'

export class DepartmentRepository {
  private readonly repo: Repository<Department>

  constructor() {
    this.repo = AppDataSource.getRepository(Department)
  }

  async findById(id: number): Promise<Department | null> {
    return await this.repo.findOne({ where: { id } })
  }

  async findByCode(code: string): Promise<Department | null> {
    return await this.repo.findOne({ where: { code } })
  }

  async findAll(): Promise<Department[]> {
    return await this.repo.find({ order: { name: 'ASC' } })
  }

  async create(data: Partial<Department>): Promise<Department> {
    const department = this.repo.create(data)
    return this.repo.save(department)
  }

  async update(id: number, data: Partial<Department>): Promise<Department | null> {
    const department = await this.findById(id)
    if (!department) return null
    Object.assign(department, data)
    return this.repo.save(department)
  }

  async delete(id: number): Promise<boolean> {
    const department = await this.findById(id)
    if (!department) return false
    await this.repo.remove(department)
    return true
  }
}
