import React, { useState } from 'react';
import { 
  usePaperSizes,
  useNotebookTypes,
  useCalculationRules,
  useTeams,
  useClients,
  useActivePaperSizes,
  useActiveNotebookTypes,
  useActiveCalculationRules,
  useActiveTeams,
  useActiveClients,
  useMasterDataAnalytics,
  useBulkMasterDataOperations,
  useCreatePaperSize,
  useUpdatePaperSize,
  useDeletePaperSize,
  useTogglePaperSizeStatus,
  PaperSize,
  NotebookType,
  CalculationRule,
  Team,
  Client,
} from '../hooks/useMasterDataEnhanced';
import { PaperSizeForm, NotebookTypeForm, TeamForm } from '../components/forms/MasterDataForms';
import { Plus, Edit, Trash2, ToggleLeft, ToggleRight, Search, Filter } from 'lucide-react';

const MasterDataEnhanced: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'paperSizes' | 'notebookTypes' | 'calculationRules' | 'teams' | 'clients' | 'analytics'>('paperSizes');
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  // Queries
  const { data: paperSizes, isLoading: paperSizesLoading } = usePaperSizes();
  const { data: notebookTypes, isLoading: notebookTypesLoading } = useNotebookTypes();
  const { data: calculationRules, isLoading: calculationRulesLoading } = useCalculationRules();
  const { data: teams, isLoading: teamsLoading } = useTeams();
  const { data: clients, isLoading: clientsLoading } = useClients();
  const { data: analytics, isLoading: analyticsLoading } = useMasterDataAnalytics();

  // Mutations
  const createPaperSize = useCreatePaperSize();
  const updatePaperSize = useUpdatePaperSize();
  const deletePaperSize = useDeletePaperSize();
  const togglePaperSizeStatus = useTogglePaperSizeStatus();
  const { bulkStatusUpdate, bulkDelete } = useBulkMasterDataOperations();

  const tabs = [
    { id: 'paperSizes', label: 'Paper Sizes', count: paperSizes?.length || 0 },
    { id: 'notebookTypes', label: 'Notebook Types', count: notebookTypes?.length || 0 },
    { id: 'calculationRules', label: 'Calculation Rules', count: calculationRules?.length || 0 },
    { id: 'teams', label: 'Teams', count: teams?.length || 0 },
    { id: 'clients', label: 'Clients', count: clients?.length || 0 },
    { id: 'analytics', label: 'Analytics', count: 0 },
  ];

  const handleCreate = () => {
    setEditingItem(null);
    setShowForm(true);
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await deletePaperSize.mutateAsync(id);
      } catch (error) {
        console.error('Delete failed:', error);
      }
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      await togglePaperSizeStatus.mutateAsync(id);
    } catch (error) {
      console.error('Status toggle failed:', error);
    }
  };

  const handleBulkStatusUpdate = async (status: 'active' | 'inactive') => {
    if (selectedItems.length === 0) return;
    
    try {
      await bulkStatusUpdate.mutateAsync({
        entity: activeTab,
        ids: selectedItems,
        status,
      });
      setSelectedItems([]);
    } catch (error) {
      console.error('Bulk status update failed:', error);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedItems.length === 0) return;
    
    if (window.confirm(`Are you sure you want to delete ${selectedItems.length} items?`)) {
      try {
        await bulkDelete.mutateAsync({
          entity: activeTab,
          ids: selectedItems,
        });
        setSelectedItems([]);
      } catch (error) {
        console.error('Bulk delete failed:', error);
      }
    }
  };

  const handleFormSubmit = async (data: any) => {
    try {
      if (editingItem) {
        await updatePaperSize.mutateAsync({ id: editingItem.id, data });
      } else {
        await createPaperSize.mutateAsync(data);
      }
      setShowForm(false);
      setEditingItem(null);
    } catch (error) {
      console.error('Form submission failed:', error);
    }
  };

  const getCurrentData = () => {
    switch (activeTab) {
      case 'paperSizes': return paperSizes || [];
      case 'notebookTypes': return notebookTypes || [];
      case 'calculationRules': return calculationRules || [];
      case 'teams': return teams || [];
      case 'clients': return clients || [];
      default: return [];
    }
  };

  const getCurrentLoading = () => {
    switch (activeTab) {
      case 'paperSizes': return paperSizesLoading;
      case 'notebookTypes': return notebookTypesLoading;
      case 'calculationRules': return calculationRulesLoading;
      case 'teams': return teamsLoading;
      case 'clients': return clientsLoading;
      default: return false;
    }
  };

  const filteredData = getCurrentData().filter((item: any) =>
    item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.department?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderForm = () => {
    switch (activeTab) {
      case 'paperSizes':
        return (
          <PaperSizeForm
            data={editingItem}
            onSubmit={handleFormSubmit}
            onCancel={() => setShowForm(false)}
            isLoading={createPaperSize.isPending || updatePaperSize.isPending}
          />
        );
      case 'notebookTypes':
        return (
          <NotebookTypeForm
            data={editingItem}
            onSubmit={handleFormSubmit}
            onCancel={() => setShowForm(false)}
            isLoading={false}
          />
        );
      case 'teams':
        return (
          <TeamForm
            data={editingItem}
            onSubmit={handleFormSubmit}
            onCancel={() => setShowForm(false)}
            isLoading={false}
          />
        );
      default:
        return null;
    }
  };

  const renderAnalytics = () => {
    if (analyticsLoading) return <div>Loading analytics...</div>;
    if (!analytics) return <div>No analytics data available</div>;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(analytics).map(([key, data]) => (
          <div key={key} className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4 capitalize">
              {key.replace(/([A-Z])/g, ' $1').trim()}
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Total:</span>
                <span className="font-medium">{(data as any).total}</span>
              </div>
              <div className="flex justify-between">
                <span>Active:</span>
                <span className="font-medium text-green-600">{(data as any).active}</span>
              </div>
              {(data as any).byCategory && (
                <div className="mt-4">
                  <h4 className="font-medium mb-2">By Category:</h4>
                  {Object.entries((data as any).byCategory).map(([category, count]) => (
                    <div key={category} className="flex justify-between text-sm">
                      <span>{category}:</span>
                      <span>{count as number}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderTable = () => {
    if (getCurrentLoading()) {
      return <div className="text-center py-8">Loading...</div>;
    }

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 border-b">
                <input
                  type="checkbox"
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedItems(filteredData.map((item: any) => item.id));
                    } else {
                      setSelectedItems([]);
                    }
                  }}
                  checked={selectedItems.length === filteredData.length && filteredData.length > 0}
                />
              </th>
              <th className="px-4 py-2 border-b text-left">Name</th>
              <th className="px-4 py-2 border-b text-left">Category/Type</th>
              <th className="px-4 py-2 border-b text-left">Status</th>
              <th className="px-4 py-2 border-b text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((item: any) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 border-b">
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(item.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedItems([...selectedItems, item.id]);
                      } else {
                        setSelectedItems(selectedItems.filter(id => id !== item.id));
                      }
                    }}
                  />
                </td>
                <td className="px-4 py-2 border-b font-medium">{item.name}</td>
                <td className="px-4 py-2 border-b">
                  {item.category || item.department || item.type || '-'}
                </td>
                <td className="px-4 py-2 border-b">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    item.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {item.status}
                  </span>
                </td>
                <td className="px-4 py-2 border-b">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(item)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleToggleStatus(item.id)}
                      className="text-yellow-600 hover:text-yellow-800"
                    >
                      {item.status === 'active' ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Enhanced Master Data Management</h1>
        
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label} {tab.count > 0 && `(${tab.count})`}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {activeTab === 'analytics' ? (
        renderAnalytics()
      ) : (
        <>
          {/* Toolbar */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {selectedItems.length > 0 && (
                <>
                  <button
                    onClick={() => handleBulkStatusUpdate('active')}
                    className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Activate Selected
                  </button>
                  <button
                    onClick={() => handleBulkStatusUpdate('inactive')}
                    className="px-3 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
                  >
                    Deactivate Selected
                  </button>
                  <button
                    onClick={handleBulkDelete}
                    className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    Delete Selected
                  </button>
                </>
              )}
              <button
                onClick={handleCreate}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-2"
              >
                <Plus size={20} />
                <span>Add New</span>
              </button>
            </div>
          </div>

          {/* Content */}
          {showForm ? (
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">
                {editingItem ? 'Edit' : 'Create'} {activeTab.replace(/([A-Z])/g, ' $1').trim()}
              </h2>
              {renderForm()}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow">
              {renderTable()}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MasterDataEnhanced;
