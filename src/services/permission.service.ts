import "dotenv/config";
import { AppError } from "../core/errors/app-error";

import permissionRepository from "../repository/permission.repository";

class PermissionService {

  async getPermissionsGrouped() {

    const permissions =
      await permissionRepository.findAllPermission();

    if (!permissions.length) {
      return {};
    }

    const grouped = permissions.reduce(
      (acc, permission) => {

        const module = permission.module;

        if (!acc[module]) {
          acc[module] = [];
        }

        acc[module].push({
          id: permission.id,
          name: permission.name,
        });

        return acc;

      },
      {} as Record<
        string,
        {
          id: string;
          name: string;
        }[]
      >
    );

    return grouped;
  }

}

export default new PermissionService();