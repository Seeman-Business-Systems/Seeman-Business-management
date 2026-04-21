import { useState, useEffect } from 'react';
import Modal from '../../components/ui/Modal';
import type { VariantFormData } from '../../types/product';

interface VariantFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: VariantFormData) => void;
  initialData?: VariantFormData | null;
  isSubmitting?: boolean;
}

interface FormErrors {
  sku?: string;
  variantName?: string;
  sellingPrice?: string;
}

function VariantForm({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isSubmitting = false,
}: VariantFormProps) {
  const [formData, setFormData] = useState<VariantFormData>({
    sku: '',
    variantName: '',
    sellingPrice: '',
    specifications: null,
  });
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        id: initialData.id,
        sku: initialData.sku,
        variantName: initialData.variantName,
        sellingPrice: initialData.sellingPrice,
        specifications: initialData.specifications,
      });
    } else {
      setFormData({
        sku: '',
        variantName: '',
        sellingPrice: '',
        specifications: null,
      });
    }
    setErrors({});
  }, [initialData, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.sku.trim()) {
      newErrors.sku = 'SKU is required';
    } else if (formData.sku.length < 3) {
      newErrors.sku = 'SKU must be at least 3 characters';
    }

    if (!formData.variantName.trim()) {
      newErrors.variantName = 'Variant name is required';
    } else if (formData.variantName.length < 2) {
      newErrors.variantName = 'Variant name must be at least 2 characters';
    }

    if (!formData.sellingPrice) {
      newErrors.sellingPrice = 'Selling price is required';
    } else {
      const price = parseFloat(formData.sellingPrice);
      if (isNaN(price) || price < 0) {
        newErrors.sellingPrice = 'Selling price must be a positive number';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleChange = (field: keyof VariantFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const isEditing = !!initialData?.id;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Variant' : 'Add Variant'}
      size="md"
      leftButton={{
        text: 'Cancel',
        onClick: onClose,
        variant: 'secondary',
      }}
      rightButton={{
        text: isSubmitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Add Variant',
        onClick: handleSubmit,
        variant: 'primary',
      }}
    >
      <div className="space-y-4">
        {/* SKU */}
        <div>
          <label htmlFor="sku" className="block text-sm font-medium text-gray-700 mb-1">
            SKU <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="sku"
            value={formData.sku}
            onChange={(e) => handleChange('sku', e.target.value)}
            placeholder="e.g., TYR-001-BLK"
            className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-transparent ${
              errors.sku ? 'border-red-300' : 'border-gray-200'
            }`}
          />
          {errors.sku && <p className="mt-1 text-sm text-red-500">{errors.sku}</p>}
        </div>

        {/* Variant Name */}
        <div>
          <label htmlFor="variantName" className="block text-sm font-medium text-gray-700 mb-1">
            Variant Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="variantName"
            value={formData.variantName}
            onChange={(e) => handleChange('variantName', e.target.value)}
            placeholder="e.g., 205/55R16 Black"
            className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-transparent ${
              errors.variantName ? 'border-red-300' : 'border-gray-200'
            }`}
          />
          {errors.variantName && <p className="mt-1 text-sm text-red-500">{errors.variantName}</p>}
        </div>

        {/* Selling Price */}
        <div>
          <label htmlFor="sellingPrice" className="block text-sm font-medium text-gray-700 mb-1">
            Selling Price (NGN) <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
              ₦
            </span>
            <input
              type="number"
              id="sellingPrice"
              value={formData.sellingPrice}
              onChange={(e) => handleChange('sellingPrice', e.target.value)}
              placeholder="0.00"
              min="0"
              step="0.01"
              className={`w-full pl-8 pr-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-transparent ${
                errors.sellingPrice ? 'border-red-300' : 'border-gray-200'
              }`}
            />
          </div>
          {errors.sellingPrice && (
            <p className="mt-1 text-sm text-red-500">{errors.sellingPrice}</p>
          )}
        </div>
      </div>
    </Modal>
  );
}

export default VariantForm;
