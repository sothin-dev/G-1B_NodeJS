import "dotenv/config";
import { CreateStudentDto } from "../dto/createStudent.dto";

import studentRepository from "../repository/student.repository";

import { AppError } from "../core/errors/app-error";

import { AppDataSource } from "../config/database";

class StudentService {
    /**
     * Get all studnets
     */
    async getAllStudent() {
        const data = await studentRepository.findAll();
         return data;
    }

    /**
     * show detail student information
     */
    async showStudent(studentId: string) {
        const student = await studentRepository.findById(studentId);

        if( !student ) {
            throw new AppError("This student is not found", 404);
        }

        return student;
    }


}


export default new StudentService;