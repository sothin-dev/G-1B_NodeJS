import { Request, Response } from 'express'
import { SemesterService } from '../services/semester.service'
import { SemesterStatus } from '../entities/semester.entity'

const semesterService = new SemesterService()

export const createSemester = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, year, status, start_date, end_date } = req.body

    if (!name || year == null || !start_date || !end_date) {
      res.status(400).json({ success: false, message: 'name, year, start_date, and end_date are required' })
      return
    }

    const startDate = new Date(start_date)
    const endDate = new Date(end_date)

    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      res.status(400).json({ success: false, message: 'Invalid start_date or end_date' })
      return
    }

    if (startDate > endDate) {
      res.status(400).json({ success: false, message: 'start_date must be before end_date' })
      return
    }

    const semester = await semesterService.createSemester({
      name,
      year: Number(year),
      status: status || SemesterStatus.UPCOMING,
      start_date: startDate,
      end_date: endDate,
    })

    res.status(201).json({ success: true, data: semester })
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || 'Unable to create semester' })
  }
}

export const listSemesters = async (_req: Request, res: Response): Promise<void> => {
  try {
    const semesters = await semesterService.listSemesters()
    res.status(200).json({ success: true, data: semesters })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Unable to list semesters' })
  }
}

export const getSemester = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const semester = await semesterService.getSemesterById(Number(id))
    res.status(200).json({ success: true, data: semester })
  } catch (error: any) {
    res.status(404).json({ success: false, message: error.message || 'Semester not found' })
  }
}

export const updateSemester = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const { name, year, status, start_date, end_date } = req.body

    if (!name && year == null && !status && !start_date && !end_date) {
      res.status(400).json({ success: false, message: 'At least one field is required to update' })
      return
    }

    const updateData: any = {}
    if (name) updateData.name = name
    if (year != null) updateData.year = Number(year)
    if (status) updateData.status = status
    if (start_date) {
      const startDate = new Date(start_date)
      if (Number.isNaN(startDate.getTime())) {
        res.status(400).json({ success: false, message: 'Invalid start_date' })
        return
      }
      updateData.start_date = startDate
    }
    if (end_date) {
      const endDate = new Date(end_date)
      if (Number.isNaN(endDate.getTime())) {
        res.status(400).json({ success: false, message: 'Invalid end_date' })
        return
      }
      updateData.end_date = endDate
    }

    if (updateData.start_date && updateData.end_date && updateData.start_date > updateData.end_date) {
      res.status(400).json({ success: false, message: 'start_date must be before end_date' })
      return
    }

    const semester = await semesterService.updateSemester(Number(id), updateData)
    res.status(200).json({ success: true, data: semester })
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || 'Unable to update semester' })
  }
}

export const deleteSemester = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    await semesterService.deleteSemester(Number(id))
    res.status(200).json({ success: true, message: 'Semester deleted successfully' })
  } catch (error: any) {
    res.status(404).json({ success: false, message: error.message || 'Semester not found' })
  }
}
