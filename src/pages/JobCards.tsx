import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  Filter,
  Eye,
  CreditCard as Edit,
  CheckCircle,
  Clock,
  Trash2,
  Workflow,
} from "lucide-react";
import {
  useJobCards,
  useUpdateJobCard,
  useDeleteJobCard,
  useBindingAdvices,
} from "../hooks/useApiQueries";
import JobCardForm from "../components/forms/JobCardForm";

const JobCards = () => {
  const navigate = useNavigate();

  // Use React Query hooks for data operations
  const {
    data: jobCards = [],
    isLoading: jobCardsLoading,
    error: jobCardsError,
  } = useJobCards();
  const { data: bindingAdvices = [] } = useBindingAdvices();
  const updateJobCard = useUpdateJobCard();
  const deleteJobCard = useDeleteJobCard();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editingJobCard, setEditingJobCard] = useState(null);

  // Filter job cards based on search and status
  const filteredJobCards = jobCards.filter((jobCard) => {
    const matchesSearch =
      (jobCard.clientName || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (jobCard.id || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || jobCard.currentStage === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const productionStages = [
    { key: "designing", label: "Designing", color: "bg-purple-500" },
    { key: "procurement", label: "Procurement", color: "bg-blue-500" },
    { key: "printing", label: "Printing", color: "bg-yellow-500" },
    { key: "cutting", label: "Cutting & Folding", color: "bg-orange-500" },
    { key: "binding", label: "Gathering & Binding", color: "bg-green-500" },
    { key: "quality_check", label: "Quality Check", color: "bg-indigo-500" },
    { key: "packing", label: "Packing", color: "bg-pink-500" },
    { key: "completed", label: "Completed", color: "bg-emerald-500" },
  ];

  const getStageInfo = (stage: string) => {
    return productionStages.find((s) => s.key === stage) || productionStages[0];
  };

  const handleEdit = (jobCard) => {
    setEditingJobCard(jobCard);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this job card?")) {
      deleteJobCard.mutate(id);
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingJobCard(null);
  };

  const handleCompleteJob = (jobCardId: string) => {
    if (
      window.confirm(
        "Are you sure you want to mark this job as completed? This will finalize inventory consumption."
      )
    ) {
      updateJobCard.mutate({
        id: jobCardId,
        data: {
          currentStage: "completed",
          status: "completed",
          completionDate: new Date().toISOString(),
          progress: 100,
        },
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Job Cards</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Create Job Card</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by job card ID or client..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="flex space-x-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Stages</option>
              {productionStages.map((stage) => (
                <option key={stage.key} value={stage.key}>
                  {stage.label}
                </option>
              ))}
            </select>
            <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200">
              <Filter className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Production Pipeline Overview */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Production Pipeline
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {productionStages.map((stage) => {
            const count = filteredJobCards.filter(
              (jc) => jc.currentStage === stage.key
            ).length;
            return (
              <div key={stage.key} className="text-center">
                <div
                  className={`w-12 h-12 ${stage.color} rounded-full flex items-center justify-center mx-auto mb-2`}
                >
                  <span className="text-white font-bold">{count}</span>
                </div>
                <div className="text-xs text-gray-600">{stage.label}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Job Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredJobCards.map((jobCard) => {
          const stageInfo = getStageInfo(jobCard.currentStage);
          return (
            <div
              key={jobCard.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {jobCard.id}
                </h3>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => navigate(`/job-cards/${jobCard.id}/stages`)}
                    className="text-indigo-600 hover:text-indigo-800"
                    title="Manage Production Stages"
                  >
                    <Workflow className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleEdit(jobCard)}
                    className="text-blue-600 hover:text-blue-800"
                    title="View Details"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleEdit(jobCard)}
                    className="text-green-600 hover:text-green-800"
                    title="Edit Job Card"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  {jobCard.currentStage !== "completed" && (
                    <button
                      onClick={() => handleCompleteJob(jobCard.id)}
                      className="text-purple-600 hover:text-purple-800"
                      title="Mark as Completed"
                    >
                      <CheckCircle className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(jobCard.id)}
                    className="text-red-600 hover:text-red-800"
                    title="Delete Job Card"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="text-sm text-gray-500">Client</div>
                  <div className="font-medium text-gray-900">
                    {jobCard.clientName}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-500">Size</div>
                    <div className="font-medium text-gray-900">
                      {jobCard.notebookSize}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Quantity</div>
                    <div className="font-medium text-gray-900">
                      {(jobCard.quantity || 0).toLocaleString()}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm text-gray-500">Current Stage</div>
                    <div
                      className={`px-2 py-1 rounded-full text-xs font-medium text-white ${stageInfo.color}`}
                    >
                      {stageInfo.label}
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${stageInfo.color}`}
                      style={{ width: `${jobCard.progress}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {jobCard.progress}% Complete
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-200">
                  <div>
                    <div className="text-sm text-gray-500 flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      Started
                    </div>
                    <div className="text-sm font-medium text-gray-900">
                      {new Date(jobCard.startDate).toLocaleDateString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 flex items-center">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Expected
                    </div>
                    <div className="text-sm font-medium text-gray-900">
                      {new Date(
                        jobCard.estimatedCompletion
                      ).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-sm text-gray-500">Assigned To</div>
                  <div className="text-sm font-medium text-gray-900">
                    {jobCard.assignedTo}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-sm font-medium text-gray-500">Total Job Cards</h3>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {jobCards.length}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-sm font-medium text-gray-500">In Production</h3>
          <p className="text-2xl font-bold text-blue-600 mt-1">
            {jobCards.filter((jc) => jc.currentStage !== "completed").length}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-sm font-medium text-gray-500">Completed Today</h3>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {jobCards.filter((jc) => jc.currentStage === "completed").length}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-sm font-medium text-gray-500">
            Average Progress
          </h3>
          <p className="text-2xl font-bold text-purple-600 mt-1">
            {jobCards.length > 0
              ? Math.round(
                  jobCards.reduce((sum, jc) => sum + jc.progress, 0) /
                    jobCards.length
                )
              : 0}
            %
          </p>
        </div>
      </div>

      <JobCardForm
        isOpen={showForm}
        onClose={handleCloseForm}
        editingJobCard={editingJobCard}
      />
    </div>
  );
};

export default JobCards;
