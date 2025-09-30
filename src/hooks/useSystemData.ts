import { useState, useEffect, useCallback } from "react";
import {
  User,
  Role,
  SystemSettings,
  Team,
  userService,
  roleService,
  systemSettingsService,
  teamService,
} from "../services/api";
import { handleApiError } from "../services/api";

// Re-export types for backward compatibility
export type { User, Role, SystemSettings, Team } from "../services/entities";

export function useSystemData() {
  // State for all system entities
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [systemSettings, setSystemSettings] = useState<SystemSettings[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);

  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load all system data on mount
  useEffect(() => {
    const loadAllSystemData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [usersData, rolesData, systemSettingsData, teamsData] =
          await Promise.all([
            userService.getAll(),
            roleService.getAll(),
            systemSettingsService.getAll(),
            teamService.getAll(),
          ]);

        setUsers(usersData);
        setRoles(rolesData);
        setSystemSettings(systemSettingsData);
        setTeams(teamsData);
      } catch (err) {
        setError(handleApiError(err));
        console.error("Failed to load system data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadAllSystemData();
  }, []);

  // User CRUD operations
  const addUser = useCallback(async (user: Omit<User, "id">) => {
    try {
      const newUser = await userService.create(user);
      setUsers((prev) => [...prev, newUser]);
      return newUser;
    } catch (err) {
      throw new Error(handleApiError(err));
    }
  }, []);

  const updateUser = useCallback(async (id: string, updates: Partial<User>) => {
    try {
      const updatedUser = await userService.update(id, updates);
      setUsers((prev) =>
        prev.map((user) => (user.id === id ? updatedUser : user))
      );
      return updatedUser;
    } catch (err) {
      throw new Error(handleApiError(err));
    }
  }, []);

  const deleteUser = useCallback(async (id: string) => {
    try {
      await userService.delete(id);
      setUsers((prev) => prev.filter((user) => user.id !== id));
    } catch (err) {
      throw new Error(handleApiError(err));
    }
  }, []);

  // Role CRUD operations
  const addRole = useCallback(async (role: Omit<Role, "id">) => {
    try {
      const newRole = await roleService.create(role);
      setRoles((prev) => [...prev, newRole]);
      return newRole;
    } catch (err) {
      throw new Error(handleApiError(err));
    }
  }, []);

  const updateRole = useCallback(async (id: string, updates: Partial<Role>) => {
    try {
      const updatedRole = await roleService.update(id, updates);
      setRoles((prev) =>
        prev.map((role) => (role.id === id ? updatedRole : role))
      );
      return updatedRole;
    } catch (err) {
      throw new Error(handleApiError(err));
    }
  }, []);

  const deleteRole = useCallback(async (id: string) => {
    try {
      await roleService.delete(id);
      setRoles((prev) => prev.filter((role) => role.id !== id));
    } catch (err) {
      throw new Error(handleApiError(err));
    }
  }, []);

  // System Setting CRUD operations
  const addSystemSetting = useCallback(
    async (setting: Omit<SystemSettings, "id">) => {
      try {
        const newSetting = await systemSettingsService.create(setting);
        setSystemSettings((prev) => [...prev, newSetting]);
        return newSetting;
      } catch (err) {
        throw new Error(handleApiError(err));
      }
    },
    []
  );

  const updateSystemSetting = useCallback(
    async (id: string, updates: Partial<SystemSettings>) => {
      try {
        const updatedSetting = await systemSettingsService.update(id, updates);
        setSystemSettings((prev) =>
          prev.map((setting) => (setting.id === id ? updatedSetting : setting))
        );
        return updatedSetting;
      } catch (err) {
        throw new Error(handleApiError(err));
      }
    },
    []
  );

  const deleteSystemSetting = useCallback(async (id: string) => {
    try {
      await systemSettingsService.delete(id);
      setSystemSettings((prev) => prev.filter((setting) => setting.id !== id));
    } catch (err) {
      throw new Error(handleApiError(err));
    }
  }, []);

  // Team CRUD operations
  const addTeam = useCallback(async (team: Omit<Team, "id">) => {
    try {
      const newTeam = await teamService.create(team);
      setTeams((prev) => [...prev, newTeam]);
      return newTeam;
    } catch (err) {
      throw new Error(handleApiError(err));
    }
  }, []);

  const updateTeam = useCallback(async (id: string, updates: Partial<Team>) => {
    try {
      const updatedTeam = await teamService.update(id, updates);
      setTeams((prev) =>
        prev.map((team) => (team.id === id ? updatedTeam : team))
      );
      return updatedTeam;
    } catch (err) {
      throw new Error(handleApiError(err));
    }
  }, []);

  const deleteTeam = useCallback(async (id: string) => {
    try {
      await teamService.delete(id);
      setTeams((prev) => prev.filter((team) => team.id !== id));
    } catch (err) {
      throw new Error(handleApiError(err));
    }
  }, []);

  // Utility functions
  const getSettingByKey = useCallback(
    (key: string) => {
      return systemSettings.find((setting) => setting.key === key);
    },
    [systemSettings]
  );

  const getSettingsByCategory = useCallback(
    (category: string) => {
      return systemSettings.filter((setting) => setting.category === category);
    },
    [systemSettings]
  );

  const getUsersByRole = useCallback(
    (role: string) => {
      return users.filter((user) => user.role === role);
    },
    [users]
  );

  const getActiveUsers = useCallback(() => {
    return users.filter((user) => user.status === "active");
  }, [users]);

  const getActiveRoles = useCallback(() => {
    return roles.filter((role) => role.active);
  }, [roles]);

  const getTeamsByType = useCallback(
    (teamType: string) => {
      return teams.filter((team) => team.teamType === teamType);
    },
    [teams]
  );

  return {
    // Data
    users,
    roles,
    systemSettings,
    teams,

    // Loading and error states
    loading,
    error,

    // User operations
    addUser,
    updateUser,
    deleteUser,

    // Role operations
    addRole,
    updateRole,
    deleteRole,

    // System Setting operations
    addSystemSetting,
    updateSystemSetting,
    deleteSystemSetting,

    // Team operations
    addTeam,
    updateTeam,
    deleteTeam,

    // Utility functions
    getSettingByKey,
    getSettingsByCategory,
    getUsersByRole,
    getActiveUsers,
    getActiveRoles,
    getTeamsByType,
  };
}
