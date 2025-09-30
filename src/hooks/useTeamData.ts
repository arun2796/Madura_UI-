import { useState, useEffect, useCallback } from "react";
import { Team, teamService } from "../services/entities";
import { handleApiError } from "../services/axiosApi";

// Re-export types for backward compatibility
export type { Team } from "../services/entities";

// Legacy interface for backward compatibility
export interface TeamMember {
  id: string;
  name: string;
  role: string;
  contact: string;
  email: string;
  experience: string;
  skills: string[];
}

export function useTeamData() {
  // State for teams
  const [teams, setTeams] = useState<Team[]>([]);

  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load all teams on mount
  useEffect(() => {
    const loadTeams = async () => {
      try {
        setLoading(true);
        setError(null);

        const teamsData = await teamService.getAll();
        setTeams(teamsData);
      } catch (err) {
        setError(handleApiError(err));
        console.error("Failed to load teams:", err);
      } finally {
        setLoading(false);
      }
    };

    loadTeams();
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
  const getTeamsByType = useCallback(
    (teamType: string) => {
      return teams.filter((team) => team.teamType === teamType);
    },
    [teams]
  );

  const getActiveTeams = useCallback(() => {
    return teams.filter((team) => team.status === "active");
  }, [teams]);

  const getTotalTeamMembers = useCallback(
    (teamId?: string) => {
      if (teamId) {
        const team = teams.find((t) => t.id === teamId);
        return team ? team.members.length : 0;
      }
      return teams.reduce((total, team) => total + team.members.length, 0);
    },
    [teams]
  );

  const getTeamWorkload = useCallback(
    (teamId: string) => {
      const team = teams.find((t) => t.id === teamId);
      if (!team) return { current: 0, max: 0, percentage: 0 };

      // This would typically come from job cards or orders assigned to the team
      // For now, we'll use a mock calculation
      const currentWorkload = Math.floor(
        Math.random() * team.capacity.maxOrdersPerDay
      );
      const percentage =
        (currentWorkload / team.capacity.maxOrdersPerDay) * 100;

      return {
        current: currentWorkload,
        max: team.capacity.maxOrdersPerDay,
        percentage: Math.round(percentage),
      };
    },
    [teams]
  );

  const getTeamByLead = useCallback(
    (leadName: string) => {
      return teams.find((team) => team.teamLead === leadName);
    },
    [teams]
  );

  const getTeamsByDepartment = useCallback(
    (department: string) => {
      return teams.filter((team) => team.department === department);
    },
    [teams]
  );

  const getTeamCapacityUtilization = useCallback(() => {
    const totalCapacity = teams.reduce(
      (sum, team) => sum + team.capacity.maxOrdersPerDay,
      0
    );
    const totalUtilized = teams.reduce((sum, team) => {
      const workload = getTeamWorkload(team.id);
      return sum + workload.current;
    }, 0);

    return {
      total: totalCapacity,
      utilized: totalUtilized,
      percentage:
        totalCapacity > 0
          ? Math.round((totalUtilized / totalCapacity) * 100)
          : 0,
    };
  }, [teams, getTeamWorkload]);

  const getTeamMembersBySkill = useCallback(
    (skill: string) => {
      const members: Array<{ member: any; team: Team }> = [];
      teams.forEach((team) => {
        team.members.forEach((member) => {
          if (member.skills.includes(skill)) {
            members.push({ member, team });
          }
        });
      });
      return members;
    },
    [teams]
  );

  const getAvailableTeams = useCallback(
    (requiredSkills: string[] = []) => {
      return teams.filter((team) => {
        if (team.status !== "active") return false;

        if (requiredSkills.length === 0) return true;

        // Check if team has members with required skills
        const teamSkills = team.members.flatMap((member) => member.skills);
        return requiredSkills.every((skill) => teamSkills.includes(skill));
      });
    },
    [teams]
  );

  // Legacy functions for backward compatibility
  const generateNextId = useCallback(() => {
    const numbers = teams
      .map((team) => {
        const match = team.id.match(/TM-(\d+)/);
        return match ? parseInt(match[1]) : 0;
      })
      .filter((num) => num > 0);

    const nextNumber = numbers.length > 0 ? Math.max(...numbers) + 1 : 1;
    return `TM-${nextNumber.toString().padStart(3, "0")}`;
  }, [teams]);

  const getTeamStats = useCallback(() => {
    const totalTeams = teams.length;
    const activeTeams = getActiveTeams().length;
    const totalMembers = getTotalTeamMembers();
    const capacityUtilization = getTeamCapacityUtilization();

    return {
      totalTeams,
      activeTeams,
      totalMembers,
      capacityUtilization,
    };
  }, [teams, getActiveTeams, getTotalTeamMembers, getTeamCapacityUtilization]);

  return {
    // Data
    teams,

    // Loading and error states
    loading,
    error,

    // Team operations
    addTeam,
    updateTeam,
    deleteTeam,

    // Utility functions
    getTeamsByType,
    getActiveTeams,
    getTotalTeamMembers,
    getTeamWorkload,
    getTeamByLead,
    getTeamsByDepartment,
    getTeamCapacityUtilization,
    getTeamMembersBySkill,
    getAvailableTeams,

    // Legacy functions
    generateNextId,
    getTeamStats,
  };
}
