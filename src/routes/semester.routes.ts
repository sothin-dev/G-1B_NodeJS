import { Router } from "express";
import semesterController from "../controllers/semester.controller";
import authMiddleware from "../middleware/auth.middleware";
import { authorizeRoles } from "../middleware/role.middleware";
import { Roles } from "../constants/roles";

const router = Router();

router.get("/active", authMiddleware, semesterController.getActiveSemester);
router.get("/", authMiddleware, semesterController.listSemesters);

router.post(
  "/",
  authMiddleware,
  authorizeRoles(Roles.SUPER_ADMIN, Roles.ADMIN),
  semesterController.createSemester,
);

router.get("/:id", authMiddleware, semesterController.getSemester);

router.patch(
  "/:id/open",
  authMiddleware,
  authorizeRoles(Roles.SUPER_ADMIN, Roles.ADMIN),
  semesterController.openEnrollment,
);

router.patch(
  "/:id/close",
  authMiddleware,
  authorizeRoles(Roles.SUPER_ADMIN, Roles.ADMIN),
  semesterController.closeEnrollment,
);

router.patch(
  "/:id",
  authMiddleware,
  authorizeRoles(Roles.SUPER_ADMIN, Roles.ADMIN),
  semesterController.updateSemester,
);

router.delete(
  "/:id",
  authMiddleware,
  authorizeRoles(Roles.SUPER_ADMIN),
  semesterController.deleteSemester,
);

export default router;
