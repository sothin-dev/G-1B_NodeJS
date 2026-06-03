import { DepartmentRepository } from '../repository/department.repository'
import { Department } from '../entities/department.entity'

export class DepartmentService {
  private readonly departmentRepo: DepartmentRepository

  constructor() {
    this.departmentRepo = new DepartmentRepository()
  }

  async listDepartments(): Promise<Department[]> {
    return await this.departmentRepo.findAll()
  }

  async getDepartmentById(id: number): Promise<Department> {
    const department = await this.departmentRepo.findById(id)
    if (!department) throw new Error('Department not found')
    return department
  }

  async createDepartment(data: Partial<Department>): Promise<Department> {
    const existingDepartment = await this.departmentRepo.findByCode(data.code ?? '')
    if (existingDepartment) {
      throw new Error('Department code already exists')
    }

    return await this.departmentRepo.create(data)
  }

  async updateDepartment(id: number, data: Partial<Department>): Promise<Department> {
    if (data.code) {
      const existingDepartment = await this.departmentRepo.findByCode(data.code)
      if (existingDepartment && existingDepartment.id !== id) {
        throw new Error('Department code already exists')
      }
    }

    const department = await this.departmentRepo.update(id, data)
    if (!department) throw new Error('Department not found')
    return department
  }

  async deleteDepartment(id: number): Promise<void> {
    const deleted = await this.departmentRepo.delete(id)
    if (!deleted) throw new Error('Department not found')
  }
}
