import { useState, useEffect } from 'react';
import Modal from '../../../components/ui/Modal';
import { useUpdateRoleMutation } from '../../../store/api/rolesApi';
import type { Role } from '../../../types/auth';
import { useToast } from '../../../context/ToastContext';

interface EditRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  role: Role | null;
  onRoleUpdated?: () => void;
}

function EditRoleModal({ isOpen, onClose, role, onRoleUpdated }: EditRoleModalProps) {
  const { showToast } = useToast();
  const [name, setName] = useState('');
  const [isManagement, setIsManagement] = useState(false);
  const [updateRole, { isLoading: saving }] = useUpdateRoleMutation();

  // Reset form when role changes
  useEffect(() => {
    if (role) {
      setName(role.name);
      setIsManagement(role.isManagement);
    }
  }, [role]);

  const handleSubmit = async () => {
    if (!role) return;

    try {
      await updateRole({ id: role.id, name, isManagement }).unwrap();
      showToast('success', `Role "${name}" updated successfully`);
      onRoleUpdated?.();
      onClose();
    } catch (error) {
      showToast('error', `Failed to update role. Please try again. Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Role"
      leftButton={{
        text: 'Cancel',
        onClick: onClose,
        variant: 'secondary',
      }}
      rightButton={{
        text: saving ? 'Saving…' : 'Save Changes',
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

export default EditRoleModal;