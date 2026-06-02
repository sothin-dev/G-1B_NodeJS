import { Router } from "express";
import { DepartmentController } from "../controllers/department.controller";
import { authMiddleware }        from "../middleware/auth.middleware";
import { authorizeRoles }        from "../middleware/role.middleware";
import { validateBody }          from "../middleware/validation.middleware";
import { Roles }                 from "../constants/roles";
import { CreateDepartmentDto }   from "../dto/create-department.dto";
import { UpdateDepartmentDto }   from "../dto/update-department.dto";

const router = Router();
const { SUPER_ADMIN: SA, ADMIN: AD } = Roles;

router.get   ("/",             authMiddleware, authorizeRoles(SA, AD), DepartmentController.getAll);
router.post  ("/",             authMiddleware, authorizeRoles(SA, AD), validateBody(CreateDepartmentDto), DepartmentController.create);
router.get   ("/:id",          authMiddleware, authorizeRoles(SA, AD), DepartmentController.getOne);
router.patch ("/:id",          authMiddleware, authorizeRoles(SA, AD), validateBody(UpdateDepartmentDto), DepartmentController.update);
router.delete("/:id",          authMiddleware, authorizeRoles(SA),     DepartmentController.remove);
router.get   ("/:id/courses",  authMiddleware, authorizeRoles(SA, AD), DepartmentController.getCourses);
router.get   ("/:id/teachers", authMiddleware, authorizeRoles(SA, AD), DepartmentController.getTeachers);

export default router;
