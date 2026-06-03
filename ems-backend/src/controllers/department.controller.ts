import { Request, Response } from 'express'
import { DepartmentService } from '../services/department.service'

const departmentService = new DepartmentService()

export const createDepartment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, code } = req.body

    if (!name || !code) {
      res.status(400).json({ success: false, message: 'name and code are required' })
      return
    }

    const department = await departmentService.createDepartment({ name, code })
    res.status(201).json({ success: true, data: department })
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || 'Unable to create department' })
  }
}

export const listDepartments = async (_req: Request, res: Response): Promise<void> => {
  try {
    const departments = await departmentService.listDepartments()
    res.status(200).json({ success: true, data: departments })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Unable to list departments' })
  }
}

export const getDepartment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const department = await departmentService.getDepartmentById(Number(id))
    res.status(200).json({ success: true, data: department })
  } catch (error: any) {
    res.status(404).json({ success: false, message: error.message || 'Department not found' })
  }
}

export const updateDepartment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const { name, code } = req.body

    if (!name && !code) {
      res.status(400).json({ success: false, message: 'At least one of name or code is required' })
      return
    }

    const department = await departmentService.updateDepartment(Number(id), { name, code })
    res.status(200).json({ success: true, data: department })
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || 'Unable to update department' })
  }
}

export const deleteDepartment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    await departmentService.deleteDepartment(Number(id))
    res.status(200).json({ success: true, message: 'Department deleted successfully' })
  } catch (error: any) {
    res.status(404).json({ success: false, message: error.message || 'Department not found' })
  }
}
