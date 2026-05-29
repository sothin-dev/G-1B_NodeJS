import { Router } from "express";

import userController
 from "../controllers/user.controller";

import { authorizeRoles }
 from "../middleware/role.middleware";

import authMiddleware
 from "../middleware/auth.middleware";

const router = Router();

router.get(
 "/",
 authMiddleware,
 authorizeRoles(
   "SUPER_ADMIN",
   "ADMIN"
 ),
 userController.getAllUsers
);

router.post(
 "/",
 authMiddleware,
 authorizeRoles(
   "SUPER_ADMIN",
   "ADMIN"
 ),
 userController.createUser
);

router.patch(
 "/:id",
 authMiddleware,
 authorizeRoles(
   "SUPER_ADMIN",
   "ADMIN"
 ),
 userController.updateUser
);

router.patch(
 "/:id/deactivate",
 authMiddleware,
 authorizeRoles(
   "SUPER_ADMIN",
   "ADMIN"
 ),
 userController.deactivateUser
);

router.patch(
 "/:id/reactivate",
 authMiddleware,
 authorizeRoles(
   "SUPER_ADMIN",
   "ADMIN"
 ),
 userController.reactivateUser
);

export default router;