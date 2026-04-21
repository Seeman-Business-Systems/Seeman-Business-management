import { useState, useEffect } from 'react';
import Modal from '../../components/ui/Modal';
import {
  useGetBrandsQuery,
  useCreateBrandMutation,
  useUpdateBrandMutation,
  useDeleteBrandMutation,
} from '../../store/api/brandsApi';
import { useToast } from '../../context/ToastContext';
import type { Brand } from '../../types/product';

interface BrandsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ViewMode = 'list' | 'add' | 'edit';

function BrandsModal({ isOpen, onClose }: BrandsModalProps) {
  const { showToast } = useToast();
  const { data: brands = [], isLoading } = useGetBrandsQuery();

  const [createBrand, { isLoading: isCreating }] = useCreateBrandMutation();
  const [updateBrand, { isLoading: isUpdating }] = useUpdateBrandMutation();
  const [deleteBrand, { isLoading: isDeleting }] = useDeleteBrandMutation();

  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  // Reset form when modal closes or view changes
  useEffect(() => {
    if (!isOpen) {
      setViewMode('list');
      setEditingBrand(null);
      setName('');
      setDescription('');
      setDeleteConfirmId(null);
    }
  }, [isOpen]);

  const handleClose = () => {
    setViewMode('list');
    setEditingBrand(null);
    setName('');
    setDescription('');
    setDeleteConfirmId(null);
    onClose();
  };

  const handleAddClick = () => {
    setName('');
    setDescription('');
    setViewMode('add');
  };

  const handleEditClick = (brand: Brand) => {
    setEditingBrand(brand);
    setName(brand.name);
    setDescription(brand.description || '');
    setViewMode('edit');
  };

  const handleBackToList = () => {
    setViewMode('list');
    setEditingBrand(null);
    setName('');
    setDescription('');
  };

  const handleCreate = async () => {
    if (!name.trim()) {
      showToast('error', 'Brand name is required');
      return;
    }

    try {
      await createBrand({
        name: name.trim(),
        description: description.trim() || null,
      }).unwrap();
      showToast('success', `Brand "${name}" created successfully`);
      handleBackToList();
    } catch (error) {
      showToast('error', 'Failed to create brand');
      console.error('Failed to create brand:', error);
    }
  };

  const handleUpdate = async () => {
    if (!editingBrand || !name.trim()) {
      showToast('error', 'Brand name is required');
      return;
    }

    try {
      await updateBrand({
        id: editingBrand.id,
        name: name.trim(),
        description: description.trim() || null,
      }).unwrap();
      showToast('success', `Brand "${name}" updated successfully`);
      handleBackToList();
    } catch (error) {
      showToast('error', 'Failed to update brand');
      console.error('Failed to update brand:', error);
    }
  };

  const handleDelete = async (id: number) => {
    const brand = brands.find((b) => b.id === id);
    try {
      await deleteBrand(id).unwrap();
      showToast('success', `Brand "${brand?.name}" deleted successfully`);
      setDeleteConfirmId(null);
    } catch (error) {
      showToast('error', 'Failed to delete brand');
      console.error('Failed to delete brand:', error);
    }
  };

  const isSaving = isCreating || isUpdating;

  // List View
  if (viewMode === 'list') {
    return (
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        title="Manage Brands"
        size="lg"
        rightButton={{
          text: 'Add Brand',
          onClick: handleAddClick,
          variant: 'primary',
        }}
      >
        <div className="space-y-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
            </div>
          ) : brands.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <i className="fa-solid fa-tag text-3xl mb-2" />
              <p className="text-sm">No brands found</p>
              <p className="text-xs text-gray-400 mt-1">Click "Add Brand" to create one</p>
            </div>
          ) : (
            <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
              {brands.map((brand) => (
                <div
                  key={brand.id}
                  className="flex items-center justify-between py-3 px-2 hover:bg-gray-50 rounded-lg"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900">{brand.name}</p>
                    {brand.description && (
                      <p className="text-sm text-gray-500 truncate">{brand.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 ml-4">
                    <button
                      onClick={() => handleEditClick(brand)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 cursor-pointer"
                    >
                      <i className="fa-solid fa-pen text-sm" />
                    </button>
                    {deleteConfirmId === brand.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDelete(brand.id)}
                          disabled={isDeleting}
                          className="px-2 py-1 text-xs font-medium text-white bg-red-600 rounded hover:bg-red-700 cursor-pointer disabled:opacity-50"
                        >
                          {isDeleting ? '...' : 'Yes'}
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          className="px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded hover:bg-gray-200 cursor-pointer"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirmId(brand.id)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 cursor-pointer"
                      >
                        <i className="fa-solid fa-trash text-sm" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>
    );
  }

  // Add/Edit View
  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={viewMode === 'add' ? 'Add Brand' : 'Edit Brand'}
      leftButton={{
        text: 'Back',
        onClick: handleBackToList,
        variant: 'secondary',
      }}
      rightButton={{
        text: isSaving ? 'Saving...' : viewMode === 'add' ? 'Create Brand' : 'Save Changes',
        onClick: viewMode === 'add' ? handleCreate : handleUpdate,
        variant: 'primary',
      }}
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Brand Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
            placeholder="e.g., Michelin, Bridgestone"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
            placeholder="Optional description"
          />
        </div>
      </div>
    </Modal>
  );
}

export default BrandsModal;
