import { useState } from 'react';
import Modal from '../../../components/ui/Modal';
import { useCreateRoleMutation } from '../../../store/api/rolesApi';
import { useToast } from '../../../context/ToastContext';

export interface CreateRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function CreateRoleModal({ isOpen, onClose }: CreateRoleModalProps) {
  const { showToast } = useToast();
  const [name, setName] = useState('');
  const [isManagement, setIsManagement] = useState(false);
  const [createRole, { isLoading: saving }] = useCreateRoleMutation();

  const handleClose = () => {
    setName('');
    setIsManagement(false);
    onClose();
  };

  const handleSubmit = async () => {
    if (!name.trim()) return;

    try {
      await createRole({ name, isManagement }).unwrap();
      showToast('success', `Role "${name}" created successfully`);
      setName('');
      setIsManagement(false);
      onClose();
    } catch (error) {
      showToast('error', `Failed to create role. Please try again. Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      console.error('Failed to create role:', error);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Add Role"
      leftButton={{
        text: 'Cancel',
        onClick: handleClose,
        variant: 'secondary',
      }}
      rightButton={{
        text: saving ? 'Creating…' : 'Create Role',
        onClick: handleSubmit,
        variant: 'primary',
      }}
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Role Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
            placeholder="Enter role name"
          />
        </div>
        <div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isManagement}
              onChange={(e) => setIsManagement(e.target.checked)}
              className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            />
            <span className="text-sm font-medium text-gray-700">
              Management Role
            </span>
          </label>
          <p className="text-xs text-gray-500 mt-1 ml-7">
            Management roles have elevated permissions
          </p>
        </div>
      </div>
    </Modal>
  );
}

export default CreateRoleModal;