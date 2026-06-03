import { Request, Response } from 'express'
import { TeacherService } from '../services/teacher.service'

const teacherService = new TeacherService()

export const createTeacher = async (req: Request, res: Response): Promise<void> => {
  try {
    const { user_id, department_id } = req.body

    if (!user_id) {
      res.status(400).json({ success: false, message: 'user_id is required' })
      return
    }

    const teacher = await teacherService.createTeacher({
      userId: Number(user_id),
      departmentId: department_id ? Number(department_id) : undefined,
    })

    res.status(201).json({ success: true, data: teacher })
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || 'Unable to create teacher' })
  }
}

export const listTeachers = async (_req: Request, res: Response): Promise<void> => {
  try {
    const teachers = await teacherService.listTeachers()
    res.status(200).json({ success: true, data: teachers })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Unable to list teachers' })
  }
}

export const getTeacher = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const teacher = await teacherService.getTeacherById(Number(id))
    res.status(200).json({ success: true, data: teacher })
  } catch (error: any) {
    res.status(404).json({ success: false, message: error.message || 'Teacher not found' })
  }
}

export const updateTeacher = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const { department_id } = req.body

    if (department_id == null) {
      res.status(400).json({ success: false, message: 'department_id is required' })
      return
    }

    const teacher = await teacherService.updateTeacher(Number(id), {
      departmentId: Number(department_id),
    })

    res.status(200).json({ success: true, data: teacher })
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || 'Unable to update teacher' })
  }
}

export const deleteTeacher = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    await teacherService.deleteTeacher(Number(id))
    res.status(200).json({ success: true, message: 'Teacher deleted successfully' })
  } catch (error: any) {
    res.status(404).json({ success: false, message: error.message || 'Teacher not found' })
  }
}
