import { useState } from "react";
import {
  Plus,
  Search,
  Filter,
  Users,
  Clock,
  Settings,
  CreditCard as Edit,
  Trash2,
  Eye,
  Phone,
  Mail,
  Award,
  User,
  X,
} from "lucide-react";
import { useTeams, useDeleteTeam } from "../../hooks/useDataQueries";
import { Team } from "../../services/entities";
import TeamForm from "../../components/forms/TeamForm";

const Teams = () => {
  // Use React Query hooks
  const { data: teams = [], isLoading, error } = useTeams();
  const deleteMutation = useDeleteTeam();

  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [viewingTeam, setViewingTeam] = useState<Team | null>(null);
  const [showTeamDetails, setShowTeamDetails] = useState(false);

  // Loading and error states
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Error loading teams: {error.message}</p>
      </div>
    );
  }

  // Filter teams based on search, type, and status
  const filteredTeams = teams.filter((team) => {
    const matchesSearch =
      team.teamName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      team.teamLead.toLowerCase().includes(searchTerm.toLowerCase()) ||
      team.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || team.teamType === typeFilter;
    const matchesStatus =
      statusFilter === "all" || team.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const teamTypes = [
    {
      value: "production",
      label: "Production",
      color: "bg-blue-100 text-blue-800",
    },
    {
      value: "design",
      label: "Design",
      color: "bg-purple-100 text-purple-800",
    },
    {
      value: "quality",
      label: "Quality",
      color: "bg-green-100 text-green-800",
    },
    {
      value: "procurement",
      label: "Procurement",
      color: "bg-orange-100 text-orange-800",
    },
    {
      value: "dispatch",
      label: "Dispatch",
      color: "bg-yellow-100 text-yellow-800",
    },
    { value: "admin", label: "Admin", color: "bg-gray-100 text-gray-800" },
  ];

  const getTypeColor = (type: string) => {
    const typeInfo = teamTypes.find((t) => t.value === type);
    return typeInfo ? typeInfo.color : "bg-gray-100 text-gray-800";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-red-100 text-red-800";
      case "maintenance":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleEdit = (team: Team) => {
    setEditingTeam(team);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (
      window.confirm(
        "Are you sure you want to delete this team? This action cannot be undone."
      )
    ) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (error) {
        console.error("Failed to delete team:", error);
      }
    }
  };

  const handleView = (team: Team) => {
    setViewingTeam(team);
    setShowTeamDetails(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingTeam(null);
  };

  const handleCloseDetails = () => {
    setShowTeamDetails(false);
    setViewingTeam(null);
  };

  // Calculate team statistics
  const activeTeamsCount = teams.filter(
    (team) => team.status === "active"
  ).length;
  const totalMembers = teams.reduce(
    (sum, team) => sum + (team.members?.length || 0),
    0
  );

  const averageTeamSize =
    teams.length > 0 ? Math.round(totalMembers / teams.length) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Team Setup Master</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add Team</span>
        </button>
      </div>

      {/* Team Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Total Teams</h3>
              <p className="text-2xl font-bold text-blue-600 mt-1">
                {teams.length}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500">
                Active Teams
              </h3>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {activeTeamsCount}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <Users className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500">
                Total Members
              </h3>
              <p className="text-2xl font-bold text-purple-600 mt-1">
                {totalMembers}
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500">
                Avg Team Size
              </h3>
              <p className="text-2xl font-bold text-orange-600 mt-1">
                {averageTeamSize}
              </p>
            </div>
            <div className="bg-orange-100 p-3 rounded-lg">
              <Users className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by team name, lead, or department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="flex space-x-4">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Types</option>
              {teamTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="maintenance">Maintenance</option>
            </select>
            <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200">
              <Filter className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Teams Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredTeams.map((team) => {
          const workload = {
            current: 0,
            capacity: 100,
            utilizationPercentage: 0,
            currentOrders: 0,
          }; // Default workload
          return (
            <div
              key={team.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200"
            >
              {/* Team Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {team.teamName}
                    </h3>
                    <p className="text-sm text-gray-500">{team.department}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleView(team)}
                    className="text-blue-600 hover:text-blue-800"
                    title="View Team Details"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleEdit(team)}
                    className="text-green-600 hover:text-green-800"
                    title="Edit Team"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(team.id)}
                    className="text-red-600 hover:text-red-800"
                    title="Delete Team"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Team Type and Status */}
              <div className="flex items-center space-x-2 mb-4">
                <span
                  className={`px-3 py-1 text-xs rounded-full ${getTypeColor(
                    team.teamType
                  )}`}
                >
                  {team.teamType.charAt(0).toUpperCase() +
                    team.teamType.slice(1)}
                </span>
                <span
                  className={`px-3 py-1 text-xs rounded-full ${getStatusColor(
                    team.status
                  )}`}
                >
                  {team.status.charAt(0).toUpperCase() + team.status.slice(1)}
                </span>
              </div>

              {/* Team Lead */}
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <User className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">
                    Team Lead
                  </span>
                </div>
                <div className="text-sm text-gray-900">
                  <div className="font-medium">{team.teamLead}</div>
                  <div className="flex items-center space-x-4 mt-1">
                    <span className="flex items-center space-x-1">
                      <Phone className="h-3 w-3 text-gray-400" />
                      <span className="text-gray-600">
                        {team.teamLeadContact}
                      </span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Mail className="h-3 w-3 text-gray-400" />
                      <span className="text-gray-600">
                        {team.teamLeadEmail}
                      </span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Team Stats */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="text-sm text-gray-500">Members</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {team.members.length}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Capacity</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {team.capacity.maxQuantityPerDay}/day
                  </div>
                </div>
              </div>

              {/* Working Hours */}
              <div className="mb-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Clock className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">
                    Working Hours
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  {team.workingHours.startTime} - {team.workingHours.endTime}
                </div>
                <div className="text-xs text-gray-500">
                  {team.workingHours.workingDays.length} days/week
                </div>
              </div>

              {/* Specializations */}
              <div className="mb-4">
                <div className="text-sm font-medium text-gray-700 mb-2">
                  Specializations
                </div>
                <div className="flex flex-wrap gap-1">
                  {team.capacity.specializations
                    .slice(0, 3)
                    .map((spec, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded"
                      >
                        {spec}
                      </span>
                    ))}
                  {team.capacity.specializations.length > 3 && (
                    <span className="px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded">
                      +{team.capacity.specializations.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              {/* Current Workload */}
              <div className="pt-4 border-t border-gray-200">
                <div className="text-sm font-medium text-gray-700 mb-2">
                  Current Workload
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${workload.utilizationPercentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">
                    {workload.utilizationPercentage}%
                  </span>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {workload.currentOrders} active orders
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Team Details Modal */}
      {showTeamDetails && viewingTeam && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[95vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {viewingTeam.teamName} - Team Details
              </h2>
              <button
                onClick={handleCloseDetails}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Team Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-medium text-blue-900 mb-3">
                    Team Information
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Type:</span>{" "}
                      {viewingTeam.teamType}
                    </div>
                    <div>
                      <span className="font-medium">Department:</span>{" "}
                      {viewingTeam.department}
                    </div>
                    <div>
                      <span className="font-medium">Status:</span>{" "}
                      {viewingTeam.status}
                    </div>
                    <div>
                      <span className="font-medium">Created:</span>{" "}
                      {new Date(viewingTeam.createdDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-medium text-green-900 mb-3">Team Lead</h3>
                  <div className="space-y-2 text-sm">
                    <div className="font-medium">{viewingTeam.teamLead}</div>
                    <div className="flex items-center space-x-1">
                      <Phone className="h-3 w-3 text-gray-400" />
                      <span>{viewingTeam.teamLeadContact}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Mail className="h-3 w-3 text-gray-400" />
                      <span>{viewingTeam.teamLeadEmail}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Team Members */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Team Members ({viewingTeam.members.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {viewingTeam.members.map((member) => (
                    <div
                      key={member.id}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">
                          {member.name}
                        </h4>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                          {member.role}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div className="flex items-center space-x-1">
                          <Phone className="h-3 w-3 text-gray-400" />
                          <span>{member.contact}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Mail className="h-3 w-3 text-gray-400" />
                          <span>{member.email}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Award className="h-3 w-3 text-gray-400" />
                          <span>{member.experience}</span>
                        </div>
                      </div>
                      <div className="mt-2">
                        <div className="text-xs text-gray-500 mb-1">
                          Skills:
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {member.skills.slice(0, 3).map((skill, index) => (
                            <span
                              key={index}
                              className="px-1 py-0.5 bg-gray-100 text-gray-700 text-xs rounded"
                            >
                              {skill}
                            </span>
                          ))}
                          {member.skills.length > 3 && (
                            <span className="px-1 py-0.5 bg-gray-100 text-gray-500 text-xs rounded">
                              +{member.skills.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Capacity & Specializations */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-orange-50 p-4 rounded-lg">
                  <h3 className="font-medium text-orange-900 mb-3">
                    Team Capacity
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Max Orders/Day:</span>{" "}
                      {viewingTeam.capacity.maxOrdersPerDay}
                    </div>
                    <div>
                      <span className="font-medium">Max Quantity/Day:</span>{" "}
                      {viewingTeam.capacity.maxQuantityPerDay.toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="font-medium text-purple-900 mb-3">
                    Specializations
                  </h3>
                  <div className="flex flex-wrap gap-1">
                    {viewingTeam.capacity.specializations.map((spec, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Working Schedule */}
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h3 className="font-medium text-yellow-900 mb-3">
                  Working Schedule
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm">
                      <div>
                        <span className="font-medium">Hours:</span>{" "}
                        {viewingTeam.workingHours.startTime} -{" "}
                        {viewingTeam.workingHours.endTime}
                      </div>
                      <div>
                        <span className="font-medium">Break:</span>{" "}
                        {viewingTeam.workingHours.breakTime}
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm">
                      <div className="font-medium mb-1">Working Days:</div>
                      <div className="flex flex-wrap gap-1">
                        {viewingTeam.workingHours.workingDays.map((day) => (
                          <span
                            key={day}
                            className="px-1 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded"
                          >
                            {day.slice(0, 3)}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Equipment */}
              {viewingTeam.equipment.length > 0 && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-3">
                    Equipment & Tools
                  </h3>
                  <div className="space-y-1">
                    {viewingTeam.equipment.map((item, index) => (
                      <div
                        key={index}
                        className="text-sm text-gray-700 flex items-center space-x-1"
                      >
                        <Settings className="h-3 w-3 text-gray-400" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Team Statistics */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Team Statistics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h3 className="font-medium text-gray-900 mb-3">Teams by Type</h3>
            <div className="space-y-2">
              {teamTypes.map((type) => {
                const count = teams.filter(
                  (team) => team.teamType === type.value
                ).length;
                return (
                  <div
                    key={type.value}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm text-gray-600">{type.label}</span>
                    <span className={`px-2 py-1 text-xs rounded ${type.color}`}>
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <h3 className="font-medium text-gray-900 mb-3">Team Status</h3>
            <div className="space-y-2">
              {["active", "inactive", "maintenance"].map((status) => {
                const count = teams.filter(
                  (team) => team.status === status
                ).length;
                return (
                  <div
                    key={status}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm text-gray-600 capitalize">
                      {status}
                    </span>
                    <span
                      className={`px-2 py-1 text-xs rounded ${getStatusColor(
                        status
                      )}`}
                    >
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <h3 className="font-medium text-gray-900 mb-3">
              Capacity Overview
            </h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  Total Daily Capacity
                </span>
                <span className="font-medium">
                  {teams
                    .reduce(
                      (sum, team) => sum + team.capacity.maxQuantityPerDay,
                      0
                    )
                    .toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Avg Team Size</span>
                <span className="font-medium">{averageTeamSize} members</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Equipment</span>
                <span className="font-medium">
                  {teams.reduce((sum, team) => sum + team.equipment.length, 0)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <TeamForm
        isOpen={showForm}
        onClose={handleCloseForm}
        editingTeam={editingTeam}
      />
    </div>
  );
};

export default Teams;
