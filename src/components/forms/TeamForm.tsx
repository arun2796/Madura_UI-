import React, { useState, useEffect } from "react";
import {
  X,
  Plus,
  Trash2,
  Users,
  Clock,
  Settings,
  User,
  Phone,
  Mail,
  Award,
} from "lucide-react";
import { useTeamData, Team, TeamMember } from "../../hooks/useTeamData";

interface TeamFormProps {
  isOpen: boolean;
  onClose: () => void;
  editingTeam?: Team | null;
}

const TeamForm: React.FC<TeamFormProps> = ({
  isOpen,
  onClose,
  editingTeam,
}) => {
  const { addTeam, updateTeam } = useTeamData();

  const [formData, setFormData] = useState<{
    teamName: string;
    teamType: Team["teamType"];
    department: string;
    teamLead: string;
    teamLeadContact: string;
    teamLeadEmail: string;
    status: Team["status"];
  }>({
    teamName: "",
    teamType: "production",
    department: "",
    teamLead: "",
    teamLeadContact: "",
    teamLeadEmail: "",
    status: "active",
  });

  const [members, setMembers] = useState<TeamMember[]>([]);
  const [capacity, setCapacity] = useState({
    maxOrdersPerDay: 3,
    maxQuantityPerDay: 2000,
    specializations: [] as string[],
  });
  const [workingHours, setWorkingHours] = useState({
    startTime: "08:00",
    endTime: "18:00",
    breakTime: "12:00-13:00",
    workingDays: [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ],
  });
  const [equipment, setEquipment] = useState<string[]>([""]);
  const [newSpecialization, setNewSpecialization] = useState("");

  const teamTypes = [
    { value: "production", label: "Production Team" },
    { value: "design", label: "Design Team" },
    { value: "quality", label: "Quality Team" },
    { value: "procurement", label: "Procurement Team" },
    { value: "dispatch", label: "Dispatch Team" },
    { value: "admin", label: "Admin Team" },
  ];

  const departments = [
    "Manufacturing",
    "Creative",
    "Quality Assurance",
    "Supply Chain",
    "Logistics",
    "Administration",
  ];

  const weekDays = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  const commonSkills = [
    "Production Management",
    "Quality Control",
    "Team Leadership",
    "Machine Operation",
    "Printing",
    "Cutting",
    "Binding",
    "Graphic Design",
    "Layout Design",
    "Typography",
    "Vendor Management",
    "Cost Negotiation",
    "Documentation",
    "Process Optimization",
  ];

  useEffect(() => {
    if (editingTeam) {
      setFormData({
        teamName: editingTeam.teamName,
        teamType: editingTeam.teamType,
        department: editingTeam.department,
        teamLead: editingTeam.teamLead,
        teamLeadContact: editingTeam.teamLeadContact,
        teamLeadEmail: editingTeam.teamLeadEmail,
        status: editingTeam.status,
      });
      setMembers(editingTeam.members);
      setCapacity(editingTeam.capacity);
      setWorkingHours(editingTeam.workingHours);
      setEquipment(editingTeam.equipment);
    } else {
      resetForm();
    }
  }, [editingTeam]);

  const resetForm = () => {
    setFormData({
      teamName: "",
      teamType: "production",
      department: "",
      teamLead: "",
      teamLeadContact: "",
      teamLeadEmail: "",
      status: "active",
    });
    setMembers([]);
    setCapacity({
      maxOrdersPerDay: 3,
      maxQuantityPerDay: 2000,
      specializations: [],
    });
    setWorkingHours({
      startTime: "08:00",
      endTime: "18:00",
      breakTime: "12:00-13:00",
      workingDays: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ],
    });
    setEquipment([""]);
    setNewSpecialization("");
  };

  const addMember = () => {
    const newMember: TeamMember = {
      id: `EMP-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      name: "",
      role: "",
      contact: "",
      email: "",
      experience: "",
      skills: [],
    };
    setMembers([...members, newMember]);
  };

  const updateMember = (
    id: string,
    field: string,
    value: string | string[]
  ) => {
    setMembers((prev) =>
      prev.map((member) =>
        member.id === id ? { ...member, [field]: value } : member
      )
    );
  };

  const removeMember = (id: string) => {
    setMembers((prev) => prev.filter((member) => member.id !== id));
  };

  const addSkillToMember = (memberId: string, skill: string) => {
    if (skill.trim()) {
      setMembers((prev) =>
        prev.map((member) =>
          member.id === memberId
            ? { ...member, skills: [...member.skills, skill.trim()] }
            : member
        )
      );
    }
  };

  const removeSkillFromMember = (memberId: string, skillIndex: number) => {
    setMembers((prev) =>
      prev.map((member) =>
        member.id === memberId
          ? {
              ...member,
              skills: member.skills.filter((_, index) => index !== skillIndex),
            }
          : member
      )
    );
  };

  const addSpecialization = () => {
    if (
      newSpecialization.trim() &&
      !capacity.specializations.includes(newSpecialization.trim())
    ) {
      setCapacity((prev) => ({
        ...prev,
        specializations: [...prev.specializations, newSpecialization.trim()],
      }));
      setNewSpecialization("");
    }
  };

  const removeSpecialization = (index: number) => {
    setCapacity((prev) => ({
      ...prev,
      specializations: prev.specializations.filter((_, i) => i !== index),
    }));
  };

  const addEquipment = () => {
    setEquipment([...equipment, ""]);
  };

  const updateEquipment = (index: number, value: string) => {
    setEquipment((prev) => prev.map((item, i) => (i === index ? value : item)));
  };

  const removeEquipment = (index: number) => {
    if (equipment.length > 1) {
      setEquipment((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const toggleWorkingDay = (day: string) => {
    setWorkingHours((prev) => ({
      ...prev,
      workingDays: prev.workingDays.includes(day)
        ? prev.workingDays.filter((d) => d !== day)
        : [...prev.workingDays, day],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const teamData = {
      teamName: formData.teamName,
      teamType: formData.teamType,
      department: formData.department,
      teamLead: formData.teamLead,
      teamLeadContact: formData.teamLeadContact,
      teamLeadEmail: formData.teamLeadEmail,
      members: members.filter((member) => member.name.trim() !== ""),
      capacity,
      workingHours,
      equipment: equipment.filter((item) => item.trim() !== ""),
      status: formData.status,
      createdDate:
        editingTeam?.createdDate || new Date().toISOString().split("T")[0],
      lastUpdated: new Date().toISOString().split("T")[0],
    };

    if (editingTeam) {
      updateTeam(editingTeam.id, teamData);
    } else {
      addTeam(teamData);
    }

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-6xl w-full max-h-[95vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {editingTeam ? "Edit Team" : "Create New Team"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Team Information */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-3">Team Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Team Name *
                </label>
                <input
                  type="text"
                  value={formData.teamName}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      teamName: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Production Team A"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Team Type *
                </label>
                <select
                  value={formData.teamType}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      teamType: e.target.value as Team["teamType"],
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  {teamTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department *
                </label>
                <select
                  value={formData.department}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      department: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      status: e.target.value as Team["status"],
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>
            </div>
          </div>

          {/* Team Lead Information */}
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-medium text-green-900 mb-3">
              Team Lead Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="inline h-4 w-4 mr-1" />
                  Team Lead Name *
                </label>
                <input
                  type="text"
                  value={formData.teamLead}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      teamLead: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone className="inline h-4 w-4 mr-1" />
                  Contact Number *
                </label>
                <input
                  type="tel"
                  value={formData.teamLeadContact}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      teamLeadContact: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail className="inline h-4 w-4 mr-1" />
                  Email Address *
                </label>
                <input
                  type="email"
                  value={formData.teamLeadEmail}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      teamLeadEmail: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Team Members */}
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-purple-900">Team Members</h3>
              <button
                type="button"
                onClick={addMember}
                className="bg-purple-600 text-white px-3 py-1 rounded-lg hover:bg-purple-700 flex items-center space-x-1 text-sm"
              >
                <Plus className="h-4 w-4" />
                <span>Add Member</span>
              </button>
            </div>

            <div className="space-y-4">
              {members.map((member, index) => (
                <div
                  key={member.id}
                  className="bg-white p-4 rounded-lg border border-purple-200"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900">
                      Member {index + 1}
                    </h4>
                    <button
                      type="button"
                      onClick={() => removeMember(member.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Name *
                      </label>
                      <input
                        type="text"
                        value={member.name}
                        onChange={(e) =>
                          updateMember(member.id, "name", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Role *
                      </label>
                      <input
                        type="text"
                        value={member.role}
                        onChange={(e) =>
                          updateMember(member.id, "role", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., Senior Operator"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Contact *
                      </label>
                      <input
                        type="tel"
                        value={member.contact}
                        onChange={(e) =>
                          updateMember(member.id, "contact", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email *
                      </label>
                      <input
                        type="email"
                        value={member.email}
                        onChange={(e) =>
                          updateMember(member.id, "email", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Experience
                      </label>
                      <input
                        type="text"
                        value={member.experience}
                        onChange={(e) =>
                          updateMember(member.id, "experience", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., 5 years"
                      />
                    </div>
                  </div>

                  {/* Skills */}
                  <div className="mt-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Skills
                    </label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {member.skills.map((skill, skillIndex) => (
                        <span
                          key={skillIndex}
                          className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm flex items-center space-x-1"
                        >
                          <span>{skill}</span>
                          <button
                            type="button"
                            onClick={() =>
                              removeSkillFromMember(member.id, skillIndex)
                            }
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex space-x-2">
                      <select
                        onChange={(e) => {
                          if (e.target.value) {
                            addSkillToMember(member.id, e.target.value);
                            e.target.value = "";
                          }
                        }}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select skill to add</option>
                        {commonSkills
                          .filter((skill) => !member.skills.includes(skill))
                          .map((skill) => (
                            <option key={skill} value={skill}>
                              {skill}
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Team Capacity */}
          <div className="bg-orange-50 p-4 rounded-lg">
            <h3 className="font-medium text-orange-900 mb-3">
              Team Capacity & Specializations
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Orders per Day
                </label>
                <input
                  type="number"
                  value={capacity.maxOrdersPerDay}
                  onChange={(e) =>
                    setCapacity((prev) => ({
                      ...prev,
                      maxOrdersPerDay: parseInt(e.target.value) || 0,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Quantity per Day
                </label>
                <input
                  type="number"
                  value={capacity.maxQuantityPerDay}
                  onChange={(e) =>
                    setCapacity((prev) => ({
                      ...prev,
                      maxQuantityPerDay: parseInt(e.target.value) || 0,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="0"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Specializations
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {capacity.specializations.map((spec, index) => (
                  <span
                    key={index}
                    className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-sm flex items-center space-x-1"
                  >
                    <span>{spec}</span>
                    <button
                      type="button"
                      onClick={() => removeSpecialization(index)}
                      className="text-orange-600 hover:text-orange-800"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newSpecialization}
                  onChange={(e) => setNewSpecialization(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Add specialization"
                />
                <button
                  type="button"
                  onClick={addSpecialization}
                  className="bg-orange-600 text-white px-3 py-2 rounded-lg hover:bg-orange-700"
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          {/* Working Hours */}
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h3 className="font-medium text-yellow-900 mb-3">
              Working Hours & Schedule
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="inline h-4 w-4 mr-1" />
                  Start Time
                </label>
                <input
                  type="time"
                  value={workingHours.startTime}
                  onChange={(e) =>
                    setWorkingHours((prev) => ({
                      ...prev,
                      startTime: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Time
                </label>
                <input
                  type="time"
                  value={workingHours.endTime}
                  onChange={(e) =>
                    setWorkingHours((prev) => ({
                      ...prev,
                      endTime: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Break Time
                </label>
                <input
                  type="text"
                  value={workingHours.breakTime}
                  onChange={(e) =>
                    setWorkingHours((prev) => ({
                      ...prev,
                      breakTime: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="12:00-13:00"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Working Days
              </label>
              <div className="flex flex-wrap gap-2">
                {weekDays.map((day) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleWorkingDay(day)}
                    className={`px-3 py-1 rounded text-sm transition-colors duration-200 ${
                      workingHours.workingDays.includes(day)
                        ? "bg-yellow-600 text-white"
                        : "bg-white text-gray-600 border border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {day.slice(0, 3)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Equipment */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-gray-900">Equipment & Tools</h3>
              <button
                type="button"
                onClick={addEquipment}
                className="bg-gray-600 text-white px-3 py-1 rounded-lg hover:bg-gray-700 flex items-center space-x-1 text-sm"
              >
                <Plus className="h-4 w-4" />
                <span>Add Equipment</span>
              </button>
            </div>

            <div className="space-y-2">
              {equipment.map((item, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => updateEquipment(index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Equipment name"
                  />
                  {equipment.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeEquipment(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              disabled={
                !formData.teamName || !formData.teamLead || members.length === 0
              }
            >
              {editingTeam ? "Update" : "Create"} Team
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TeamForm;
