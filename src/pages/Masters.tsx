import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Plus,
  Search,
  Filter,
  CreditCard as Edit,
  Trash2,
  Settings,
  ArrowLeft,
} from "lucide-react";
import {
  usePaperSizes,
  useNotebookTypes,
  useCalculationRules,
  useClients,
  useTeams,
  useCreatePaperSize,
  useUpdatePaperSize,
  useDeletePaperSize,
  useCreateNotebookType,
  useUpdateNotebookType,
  useDeleteNotebookType,
  useCreateCalculationRule,
  useUpdateCalculationRule,
  useDeleteCalculationRule,
  useCreateClient,
  useUpdateClient,
  useDeleteClient,
  useCreateTeam,
  useUpdateTeam,
  useDeleteTeam,
} from "../hooks/useApiQueries";
import ClientForm from "../components/forms/ClientForm";
import PaperSizeForm from "../components/forms/PaperSizeForm";
import NotebookTypeForm from "../components/forms/NotebookTypeForm";

const Masters = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  // Use React Query hooks for data operations
  const { data: paperSizes = [], isLoading: paperSizesLoading } =
    usePaperSizes();
  const { data: notebookTypes = [], isLoading: notebookTypesLoading } =
    useNotebookTypes();
  const { data: calculationRules = [], isLoading: calculationRulesLoading } =
    useCalculationRules();
  const { data: clients = [], isLoading: clientsLoading } = useClients();
  const { data: teams = [], isLoading: teamsLoading } = useTeams();

  // Mutation hooks
  const createClientMutation = useCreateClient();
  const updateClientMutation = useUpdateClient();
  const deleteClientMutation = useDeleteClient();

  const createPaperSizeMutation = useCreatePaperSize();
  const updatePaperSizeMutation = useUpdatePaperSize();
  const deletePaperSizeMutation = useDeletePaperSize();

  const createNotebookTypeMutation = useCreateNotebookType();
  const updateNotebookTypeMutation = useUpdateNotebookType();
  const deleteNotebookTypeMutation = useDeleteNotebookType();

  const createCalculationRuleMutation = useCreateCalculationRule();
  const updateCalculationRuleMutation = useUpdateCalculationRule();
  const deleteCalculationRuleMutation = useDeleteCalculationRule();

  const createTeamMutation = useCreateTeam();
  const updateTeamMutation = useUpdateTeam();
  const deleteTeamMutation = useDeleteTeam();

  // Loading state
  const loading =
    paperSizesLoading ||
    notebookTypesLoading ||
    calculationRulesLoading ||
    clientsLoading ||
    teamsLoading;

  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  // Check if current user can approve clients (Admin or Production Manager only)
  const canApproveClients =
    user?.role === "Admin" || user?.role === "Production Manager";

  // Client form handlers
  const handleCreateClient = (clientData: any) => {
    createClientMutation.mutate(clientData, {
      onSuccess: () => {
        setShowForm(false);
        setEditingItem(null);
      },
    });
  };

  const handleUpdateClient = (id: string, clientData: any) => {
    updateClientMutation.mutate(
      { id, data: clientData },
      {
        onSuccess: () => {
          setShowForm(false);
          setEditingItem(null);
        },
      }
    );
  };

  const handleDeleteClient = (id: string) => {
    if (window.confirm("Are you sure you want to delete this client?")) {
      deleteClientMutation.mutate(id);
    }
  };

  const handleClientStatusChange = (id: string, newStatus: string) => {
    // Check if user has permission to approve
    if (!canApproveClients) {
      alert(
        "You don't have permission to approve/reject clients. Only Admin and Production Manager can perform this action."
      );
      return;
    }

    const updates: any = { status: newStatus };

    if (newStatus === "approved") {
      updates.approvedDate = new Date().toISOString().split("T")[0];
      updates.approvedBy = user?.name || "Unknown User";
    }

    updateClientMutation.mutate({ id, data: updates });
  };

  // Paper Size handlers
  const handleCreatePaperSize = (paperSizeData: any) => {
    createPaperSizeMutation.mutate(paperSizeData, {
      onSuccess: () => {
        setShowForm(false);
        setEditingItem(null);
      },
    });
  };

  const handleUpdatePaperSize = (id: string, paperSizeData: any) => {
    updatePaperSizeMutation.mutate(
      { id, data: paperSizeData },
      {
        onSuccess: () => {
          setShowForm(false);
          setEditingItem(null);
        },
      }
    );
  };

  const handleDeletePaperSize = (id: string) => {
    if (window.confirm("Are you sure you want to delete this paper size?")) {
      deletePaperSizeMutation.mutate(id);
    }
  };

  // Notebook Type handlers
  const handleCreateNotebookType = (notebookTypeData: any) => {
    createNotebookTypeMutation.mutate(notebookTypeData, {
      onSuccess: () => {
        setShowForm(false);
        setEditingItem(null);
      },
    });
  };

  const handleUpdateNotebookType = (id: string, notebookTypeData: any) => {
    updateNotebookTypeMutation.mutate(
      { id, data: notebookTypeData },
      {
        onSuccess: () => {
          setShowForm(false);
          setEditingItem(null);
        },
      }
    );
  };

  const handleDeleteNotebookType = (id: string) => {
    if (window.confirm("Are you sure you want to delete this notebook type?")) {
      deleteNotebookTypeMutation.mutate(id);
    }
  };

  // Get current path to determine which master to show
  const currentPath = location.pathname
    .replace("/masters/", "")
    .replace("/masters", "");

  const renderPaperSizes = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Paper Size Master</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add Paper Size</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search paper sizes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200">
            <Filter className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Dimensions
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Sheets/Reem
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paperSizes
              .filter(
                (size) =>
                  size.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  size.type.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map((size) => (
                <tr key={size.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-blue-600">
                    {size.id}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {size.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {size.dimensions}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 capitalize">
                    {size.type}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {size.sheetsPerReem}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 text-xs rounded-full ${
                        size.active
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {size.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setEditingItem(size);
                          setShowForm(true);
                        }}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeletePaperSize(size.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderNotebookTypes = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">
          Notebook Type Master
        </h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add Notebook Type</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search notebook types..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200">
            <Filter className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Paper Size
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Std Pages
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Pages/Sheet
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Steps
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {notebookTypes
              .filter(
                (type) =>
                  type.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  type.category.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map((type) => (
                <tr key={type.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-blue-600">
                    {type.id}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {type.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 capitalize">
                    {type.category}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {type.paperSize || "N/A"}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {type.pages || 96}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {type.pagesPerSheet || 24}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {type.steps || "N/A"}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setEditingItem(type);
                          setShowForm(true);
                        }}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteNotebookType(type.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderCalculationRules = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">
          Calculation Rules Master
        </h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add Rule</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search calculation rules..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200">
            <Filter className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {calculationRules
          .filter(
            (rule) =>
              rule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              rule.type.toLowerCase().includes(searchTerm.toLowerCase())
          )
          .map((rule) => (
            <div
              key={rule.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {rule.name}
                </h3>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                  {rule.type}
                </span>
              </div>

              <div className="space-y-3">
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Formula:</h4>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    {Object.entries(rule.formula).map(([key, value]) => (
                      <div key={key} className="text-sm">
                        <span className="font-mono text-blue-600">{key}:</span>
                        <span className="ml-2 text-gray-700">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {rule.variables && (
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">
                      Variables:
                    </h4>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      {Object.entries(rule.variables).map(([key, value]) => (
                        <div key={key} className="text-sm">
                          <span className="font-mono text-green-600">
                            {key}:
                          </span>
                          <span className="ml-2 text-gray-700">
                            {String(value)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-2 mt-4">
                <button className="text-blue-600 hover:text-blue-800">
                  <Edit className="h-4 w-4" />
                </button>
                <button className="text-red-600 hover:text-red-800">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
      </div>
    </div>
  );

  const renderClients = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Client Master</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add Client</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search clients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200">
            <Filter className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Contact Person
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Phone
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Credit Limit
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {clients
              .filter(
                (client) =>
                  (client.name || "")
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                  (client.contactPerson || "")
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase())
              )
              .map((client) => (
                <tr key={client.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-blue-600">
                    {client.id}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {client.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 capitalize">
                    {client.type}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {client.contactPerson}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {client.phone}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    ₹{(client.creditLimit || 0).toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <span
                        className={`px-3 py-1 text-xs rounded-full ${
                          client.status === "active"
                            ? "bg-green-100 text-green-800"
                            : client.status === "approved"
                            ? "bg-blue-100 text-blue-800"
                            : client.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : client.status === "rejected"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {client.status}
                      </span>
                      {client.status === "approved" && client.approvedDate && (
                        <div className="text-xs text-blue-600 font-medium mt-1">
                          Approved:{" "}
                          {new Date(client.approvedDate).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-2">
                      {client.status === "pending" && canApproveClients && (
                        <>
                          <button
                            onClick={() =>
                              handleClientStatusChange(client.id, "approved")
                            }
                            className="text-green-600 hover:text-green-800 text-xs px-2 py-1 border border-green-300 rounded"
                            title="Approve Client (Admin/Manager Only)"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() =>
                              handleClientStatusChange(client.id, "rejected")
                            }
                            className="text-red-600 hover:text-red-800 text-xs px-2 py-1 border border-red-300 rounded"
                            title="Reject Client (Admin/Manager Only)"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {client.status === "pending" && !canApproveClients && (
                        <span className="text-xs text-gray-500 italic">
                          Pending approval (Admin/Manager required)
                        </span>
                      )}
                      <button
                        onClick={() => {
                          setEditingItem(client);
                          setShowForm(true);
                        }}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClient(client.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderComingSoon = (title: string) => (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900">{title}</h2>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
        <Settings className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-600 mb-2">
          Coming Soon
        </h3>
        <p className="text-gray-500">
          This master data section is under development.
        </p>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (currentPath) {
      case "paper-sizes":
        return renderPaperSizes();
      case "notebook-types":
        return renderNotebookTypes();
      case "calculation-rules":
        return renderCalculationRules();
      case "clients":
        return renderClients();
      case "teams":
        return renderComingSoon("Team Setup Master");
      case "suppliers":
        return renderComingSoon("Supplier Master");
      case "transporters":
        return renderComingSoon("Transporter Master");
      case "users":
        return renderComingSoon("User Management");
      case "roles":
        return renderComingSoon("Role Management");
      case "settings":
        return renderComingSoon("System Settings");
      default:
        return (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">
              Master Data Management
            </h1>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <Settings className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                Select a Master
              </h3>
              <p className="text-gray-500">
                Choose a master data type from the sidebar to manage.
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {renderContent()}

      {/* Client Form Modal */}
      {showForm && currentPath === "clients" && (
        <ClientForm
          client={editingItem}
          onSubmit={(data) => {
            if (editingItem) {
              handleUpdateClient(editingItem.id, data);
            } else {
              handleCreateClient(data);
            }
          }}
          onClose={() => {
            setShowForm(false);
            setEditingItem(null);
          }}
          isLoading={
            createClientMutation.isPending || updateClientMutation.isPending
          }
        />
      )}

      {/* Paper Size Form Modal */}
      {showForm && currentPath === "paper-sizes" && (
        <PaperSizeForm
          isOpen={showForm}
          paperSize={editingItem}
          onSubmit={(data) => {
            if (editingItem) {
              handleUpdatePaperSize(editingItem.id, data);
            } else {
              handleCreatePaperSize(data);
            }
          }}
          onClose={() => {
            setShowForm(false);
            setEditingItem(null);
          }}
          isLoading={
            createPaperSizeMutation.isPending ||
            updatePaperSizeMutation.isPending
          }
        />
      )}

      {/* Notebook Type Form Modal */}
      {showForm && currentPath === "notebook-types" && (
        <NotebookTypeForm
          isOpen={showForm}
          notebookType={editingItem}
          onSubmit={(data) => {
            if (editingItem) {
              handleUpdateNotebookType(editingItem.id, data);
            } else {
              handleCreateNotebookType(data);
            }
          }}
          onClose={() => {
            setShowForm(false);
            setEditingItem(null);
          }}
          isLoading={
            createNotebookTypeMutation.isPending ||
            updateNotebookTypeMutation.isPending
          }
        />
      )}
    </div>
  );
};

export default Masters;
