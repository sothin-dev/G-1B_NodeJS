import { AppDataSource } from "../config/database";
import { Department }   from "../entities/department.entity";
import { Not }          from "typeorm";

export const DepartmentRepository = AppDataSource.getRepository(Department).extend({

  async findAllWithCounts(search?: string) {
    const qb = this.createQueryBuilder("d")
      .loadRelationCountAndMap("d.courseCount",  "d.courses")
      .loadRelationCountAndMap("d.teacherCount", "d.teachers")
      .orderBy("d.name", "ASC");
    if (search) {
      qb.where("d.name LIKE :s OR d.code LIKE :s", { s: `%${search}%` });
    }
    return qb.getMany();
  },

  async findByIdWithRelations(id: string) {
    return this.findOne({
      where: { id },
      relations: ["courses", "courses.teacher", "teachers", "teachers.user"],
    });
  },

  async findByNameOrCode(name: string, code: string) {
    return this.findOne({
      where: [{ name }, { code }],
    });
  },

  async findByNameOrCodeExcludingId(name: string, code: string, id: string) {
    return this.findOne({
      where: [
        { name, id: Not(id) },
        { code, id: Not(id) },
      ],
    });
  },

  async findByCode(code: string) {
    return this.findOneBy({ code });
  },

});
