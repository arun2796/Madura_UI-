import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface NotebookTypeFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  notebookType?: any;
  isLoading?: boolean;
}

const NotebookTypeForm: React.FC<NotebookTypeFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  notebookType,
  isLoading = false
}) => {
  const [formData, setFormData] = useState({
    name: '',
    category: 'notebook',
    pages: 96,
    paperSize: '',
    pagesPerSheet: 24,
    steps: '',
    active: true,
    description: ''
  });

  useEffect(() => {
    if (notebookType) {
      setFormData({
        name: notebookType.name || '',
        category: notebookType.category || 'notebook',
        pages: notebookType.pages || 96,
        paperSize: notebookType.paperSize || '',
        pagesPerSheet: notebookType.pagesPerSheet || 24,
        steps: notebookType.steps || '',
        active: notebookType.active !== undefined ? notebookType.active : true,
        description: notebookType.description || ''
      });
    } else {
      setFormData({
        name: '',
        category: 'notebook',
        pages: 96,
        paperSize: '',
        pagesPerSheet: 24,
        steps: '',
        active: true,
        description: ''
      });
    }
  }, [notebookType]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {notebookType ? 'Edit Notebook Type' : 'Add Notebook Type'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., CROWN IV LINE RULED"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="notebook">Notebook</option>
              <option value="register">Register</option>
              <option value="diary">Diary</option>
              <option value="planner">Planner</option>
              <option value="custom">Custom</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pages *
              </label>
              <input
                type="number"
                required
                min="1"
                value={formData.pages}
                onChange={(e) => setFormData(prev => ({ ...prev, pages: parseInt(e.target.value) || 96 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pages per Sheet
              </label>
              <input
                type="number"
                min="1"
                value={formData.pagesPerSheet}
                onChange={(e) => setFormData(prev => ({ ...prev, pagesPerSheet: parseInt(e.target.value) || 24 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Paper Size
            </label>
            <input
              type="text"
              value={formData.paperSize}
              onChange={(e) => setFormData(prev => ({ ...prev, paperSize: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., Crown 49 x 74"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Steps
            </label>
            <input
              type="text"
              value={formData.steps}
              onChange={(e) => setFormData(prev => ({ ...prev, steps: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., 4 x 3"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
              placeholder="Optional description..."
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="active"
              checked={formData.active}
              onChange={(e) => setFormData(prev => ({ ...prev, active: e.target.checked }))}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="active" className="ml-2 block text-sm text-gray-900">
              Active
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Saving...' : (notebookType ? 'Update' : 'Create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NotebookTypeForm;
