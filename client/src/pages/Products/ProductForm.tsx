import { useState, useEffect } from 'react';
import type { Product, ProductFormData, VariantFormData } from '../../types/product';
import { ProductType, ProductTypeLabels, ProductStatus, ProductStatusLabels } from '../../types/product';
import { useGetBrandsQuery } from '../../store/api/brandsApi';
import { useGetCategoriesQuery } from '../../store/api/categoriesApi';
import VariantForm from './VariantForm';

interface ProductFormProps {
  initialData?: Partial<Product>;
  initialVariants?: VariantFormData[];
  onSubmit: (data: ProductFormData, variants: VariantFormData[]) => Promise<void>;
  submitLabel: string;
  isSubmitting: boolean;
  defaultProductType?: ProductType;
}

function ProductForm({
  initialData,
  initialVariants = [],
  onSubmit,
  submitLabel,
  isSubmitting,
  defaultProductType,
}: ProductFormProps) {
  const { data: brands, isLoading: loadingBrands } = useGetBrandsQuery();
  const { data: categories, isLoading: loadingCategories } = useGetCategoriesQuery();

  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    productType: defaultProductType || '',
    status: ProductStatus.ACTIVE,
    brandId: '',
    categoryId: '',
  });

  const [variants, setVariants] = useState<VariantFormData[]>(initialVariants);
  const [variantModalOpen, setVariantModalOpen] = useState(false);
  const [editingVariant, setEditingVariant] = useState<VariantFormData | null>(null);
  const [editingVariantIndex, setEditingVariantIndex] = useState<number | null>(null);

  const [errors, setErrors] = useState<Partial<Record<keyof ProductFormData, string>>>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        description: initialData.description || '',
        productType: initialData.productType || '',
        status: initialData.status || ProductStatus.ACTIVE,
        brandId: initialData.brandId || '',
        categoryId: initialData.categoryId || '',
      });
    }
  }, [initialData]);

  useEffect(() => {
    if (initialVariants.length > 0) {
      setVariants(initialVariants);
    }
  }, [initialVariants]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name as keyof ProductFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof ProductFormData, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    }
    if (!formData.productType) {
      newErrors.productType = 'Product type is required';
    }
    if (!formData.status) {
      newErrors.status = 'Status is required';
    }
    if (!formData.brandId) {
      newErrors.brandId = 'Brand is required';
    }
    if (!formData.categoryId) {
      newErrors.categoryId = 'Category is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit(formData, variants);
  };

  const openAddVariant = () => {
    setEditingVariant(null);
    setEditingVariantIndex(null);
    setVariantModalOpen(true);
  };

  const openEditVariant = (variant: VariantFormData, index: number) => {
    setEditingVariant(variant);
    setEditingVariantIndex(index);
    setVariantModalOpen(true);
  };

  const handleVariantSubmit = (data: VariantFormData) => {
    if (editingVariantIndex !== null) {
      setVariants((prev) =>
        prev.map((v, i) => (i === editingVariantIndex ? { ...data, id: v.id } : v))
      );
    } else {
      setVariants((prev) => [...prev, data]);
    }
    setVariantModalOpen(false);
    setEditingVariant(null);
    setEditingVariantIndex(null);
  };

  const removeVariant = (index: number) => {
    setVariants((prev) => prev.filter((_, i) => i !== index));
  };

  const formatPrice = (price: string): string => {
    const num = parseFloat(price);
    if (isNaN(num)) return '-';
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  if (loadingBrands || loadingCategories) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        <p className="text-sm text-gray-500">
          Fields marked with <span className="text-red-500">*</span> are required
        </p>

        {/* Basic Information */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-4">Basic Information</h3>

          {/* Product Name */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 ${
                errors.name ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="e.g., Michelin Pilot Sport 4"
            />
            {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
              placeholder="Product description (optional)"
            />
          </div>
        </div>

        {/* Classification */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-4">Classification</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Product Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Type <span className="text-red-500">*</span>
              </label>
              <select
                name="productType"
                value={formData.productType}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 bg-white ${
                  errors.productType ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value="">Select product type</option>
                {Object.entries(ProductTypeLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              {errors.productType && (
                <p className="mt-1 text-sm text-red-500">{errors.productType}</p>
              )}
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status <span className="text-red-500">*</span>
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 bg-white ${
                  errors.status ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value="">Select status</option>
                {Object.entries(ProductStatusLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              {errors.status && <p className="mt-1 text-sm text-red-500">{errors.status}</p>}
            </div>

            {/* Brand */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Brand <span className="text-red-500">*</span>
              </label>
              <select
                name="brandId"
                value={formData.brandId}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 bg-white ${
                  errors.brandId ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value="">Select brand</option>
                {brands?.map((brand) => (
                  <option key={brand.id} value={brand.id}>
                    {brand.name}
                  </option>
                ))}
              </select>
              {errors.brandId && <p className="mt-1 text-sm text-red-500">{errors.brandId}</p>}
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 bg-white ${
                  errors.categoryId ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value="">Select category</option>
                {categories?.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {errors.categoryId && (
                <p className="mt-1 text-sm text-red-500">{errors.categoryId}</p>
              )}
            </div>
          </div>
        </div>

        {/* Variants Section */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-700">
              Product Variants ({variants.length})
            </h3>
            <button
              type="button"
              onClick={openAddVariant}
              className="px-3 py-1.5 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors cursor-pointer"
            >
              <i className="fa-solid fa-plus mr-1" />
              Add Variant
            </button>
          </div>

          {variants.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <i className="fa-solid fa-boxes-stacked text-3xl mb-2" />
              <p className="text-sm">No variants added yet</p>
              <p className="text-xs text-gray-400 mt-1">
                Click "Add Variant" to add product variants
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {variants.map((variant, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900 truncate">
                        {variant.variantName}
                      </span>
                      <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                        {variant.sku}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-0.5">
                      {formatPrice(variant.sellingPrice)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      type="button"
                      onClick={() => openEditVariant(variant, index)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 cursor-pointer"
                    >
                      <i className="fa-solid fa-pen text-sm" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeVariant(index)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 cursor-pointer"
                    >
                      <i className="fa-solid fa-trash text-sm" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isSubmitting ? 'Saving...' : submitLabel}
          </button>
        </div>
      </form>

      {/* Variant Modal */}
      <VariantForm
        isOpen={variantModalOpen}
        onClose={() => {
          setVariantModalOpen(false);
          setEditingVariant(null);
          setEditingVariantIndex(null);
        }}
        onSubmit={handleVariantSubmit}
        initialData={editingVariant}
      />
    </>
  );
}

export default ProductForm;
