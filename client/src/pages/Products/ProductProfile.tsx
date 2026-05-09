import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import Modal from '../../components/ui/Modal';
import VariantForm from './VariantForm';
import usePageTitle from '../../hooks/usePageTitle';
import {
  ProductStatus,
  ProductStatusLabels,
  ProductType,
  ProductTypeLabels,
} from '../../types/product';
import type { ProductVariant, VariantFormData } from '../../types/product';
import {
  useGetProductQuery,
  useDeleteProductMutation,
  useCreateProductVariantMutation,
  useUpdateProductVariantMutation,
  useDeleteProductVariantMutation,
} from '../../store/api/productsApi';
import { useToast } from '../../context/ToastContext';

const statusStyles: Record<ProductStatus, string> = {
  [ProductStatus.ACTIVE]: 'bg-green-100 text-green-800',
  [ProductStatus.INACTIVE]: 'bg-gray-100 text-gray-800',
  [ProductStatus.DISCONTINUED]: 'bg-red-100 text-red-800',
};

const typeStyles: Record<ProductType, string> = {
  [ProductType.TYRE]: 'bg-blue-100 text-blue-800',
  [ProductType.BATTERY]: 'bg-yellow-100 text-yellow-800',
  [ProductType.SPARE_PART]: 'bg-purple-100 text-purple-800',
};

const typeIcons: Record<ProductType, string> = {
  [ProductType.TYRE]: 'fa-solid fa-circle-notch',
  [ProductType.BATTERY]: 'fa-solid fa-car-battery',
  [ProductType.SPARE_PART]: 'fa-solid fa-gears',
};

function ProductProfile() {
  usePageTitle('Product Details');
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const productId = Number(id);
  const { showToast } = useToast();

  const {
    data: product,
    isLoading,
    error,
  } = useGetProductQuery({ id: productId, includeRelations: true }, { skip: !productId });

  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();
  const [createVariant] = useCreateProductVariantMutation();
  const [updateVariant] = useUpdateProductVariantMutation();
  const [deleteVariant, { isLoading: isDeletingVariant }] = useDeleteProductVariantMutation();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showVariantModal, setShowVariantModal] = useState(false);
  const [editingVariant, setEditingVariant] = useState<VariantFormData | null>(null);
  const [variantToDelete, setVariantToDelete] = useState<number | null>(null);
  const [isSubmittingVariant, setIsSubmittingVariant] = useState(false);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleDelete = async () => {
    if (!product) return;

    try {
      await deleteProduct(product.id).unwrap();
      showToast('success', `Product "${product.name}" deleted successfully`);
      setShowDeleteModal(false);
      navigate('/products');
    } catch (err) {
      console.error('Failed to delete product:', err);
      showToast('error', 'Failed to delete product');
    }
  };

  const openAddVariant = () => {
    setEditingVariant(null);
    setShowVariantModal(true);
  };

  const openEditVariant = (variant: ProductVariant) => {
    setEditingVariant({
      id: variant.id,
      sku: variant.sku,
      variantName: variant.variantName,
      sellingPrice: variant.sellingPrice.toString(),
      specifications: variant.specifications,
    });
    setShowVariantModal(true);
  };

  const handleVariantSubmit = async (data: VariantFormData) => {
    if (!product) return;
    setIsSubmittingVariant(true);

    try {
      if (data.id) {
        await updateVariant({
          productId: product.id,
          variantId: data.id,
          sku: data.sku,
          variantName: data.variantName,
          sellingPrice: Number(data.sellingPrice),
          specifications: data.specifications,
        }).unwrap();
        showToast('success', 'Variant updated successfully');
      } else {
        await createVariant({
          productId: product.id,
          sku: data.sku,
          variantName: data.variantName,
          sellingPrice: Number(data.sellingPrice),
          specifications: data.specifications,
        }).unwrap();
        showToast('success', 'Variant added successfully');
      }
      setShowVariantModal(false);
      setEditingVariant(null);
    } catch (err) {
      console.error('Failed to save variant:', err);
      showToast('error', 'Failed to save variant');
    } finally {
      setIsSubmittingVariant(false);
    }
  };

  const handleDeleteVariant = async () => {
    if (!product || !variantToDelete) return;

    try {
      await deleteVariant({ productId: product.id, variantId: variantToDelete }).unwrap();
      showToast('success', 'Variant deleted successfully');
      setVariantToDelete(null);
    } catch (err) {
      console.error('Failed to delete variant:', err);
      showToast('error', 'Failed to delete variant');
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </Layout>
    );
  }

  if (error || !product) {
    return (
      <Layout>
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
            <i className="fa-solid fa-box-open text-2xl text-red-500" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Product not found</h2>
          <p className="text-gray-600 mt-2">
            The product you're looking for doesn't exist or has been removed.
          </p>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 mt-4 text-indigo-600 hover:text-indigo-800"
          >
            <i className="fa-solid fa-arrow-left" />
            Back to Products
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Back Button */}
        <Link
          to="/products"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <i className="fa-solid fa-arrow-left" />
          <span>Back to Products</span>
        </Link>

        {/* Header Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            {/* Product Identity */}
            <div className="flex items-center gap-4">
              <div
                className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center flex-shrink-0 ${typeStyles[product.productType]}`}
              >
                <i className={`${typeIcons[product.productType]} text-2xl sm:text-3xl`} />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{product.name}</h1>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${typeStyles[product.productType]}`}
                  >
                    {ProductTypeLabels[product.productType]}
                  </span>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[product.status]}`}
                  >
                    {ProductStatusLabels[product.status]}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                to={`/products/${product.id}/edit`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
              >
                <i className="fa-solid fa-pen-to-square" />
                Edit
              </Link>
            </div>
          </div>
        </div>

        {/* Info Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Product Details */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <i className="fa-solid fa-box text-indigo-500" />
              Product Details
            </h2>
            <div className="space-y-4">
              {product.description && (
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
                    <i className="fa-solid fa-align-left text-indigo-500" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Description</p>
                    <p className="text-gray-900">{product.description}</p>
                  </div>
                </div>
              )}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
                  <i className="fa-solid fa-tag text-indigo-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Brand</p>
                  <p className="text-gray-900 font-medium">
                    {product.brand?.name || (
                      <span className="text-gray-400 italic">Not set</span>
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
                  <i className="fa-solid fa-folder text-indigo-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Category</p>
                  <p className="text-gray-900 font-medium">
                    {product.category?.name || (
                      <span className="text-gray-400 italic">Not set</span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* System Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <i className="fa-solid fa-circle-info text-indigo-500" />
              System Information
            </h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
                  <i className="fa-solid fa-user-plus text-gray-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Created By</p>
                  <p className="text-gray-900 font-medium">
                    {product.createdBy ? (
                      `${product.createdBy.firstName} ${product.createdBy.lastName}`
                    ) : (
                      <span className="text-gray-400 italic">System</span>
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
                  <i className="fa-solid fa-plus text-gray-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Created</p>
                  <p className="text-gray-900 font-medium">{formatDate(product.createdAt)}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
                  <i className="fa-solid fa-rotate text-gray-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Last Updated</p>
                  <p className="text-gray-900 font-medium">{formatDate(product.updatedAt)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Variants Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <i className="fa-solid fa-boxes-stacked text-indigo-500" />
              Sizes ({product.variants?.length || 0})
            </h2>
            <button
              onClick={openAddVariant}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors cursor-pointer"
            >
              <i className="fa-solid fa-plus" />
              Add Size
            </button>
          </div>

          {!product.variants || product.variants.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <i className="fa-solid fa-boxes-stacked text-3xl mb-2" />
              <p className="text-sm">No variants added yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">SKU</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">
                      Size Name
                    </th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">
                      Selling Price
                    </th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-500 hidden sm:table-cell">
                      Created
                    </th>
                    <th className="w-24 px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {product.variants.map((variant) => (
                    <tr key={variant.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <span className="font-mono text-sm text-gray-700">{variant.sku}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-medium text-gray-900">{variant.variantName}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-gray-900 font-medium">
                          {formatPrice(variant.sellingPrice)}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <span className="text-sm text-gray-500">
                          {formatDate(variant.createdAt)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openEditVariant(variant)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 cursor-pointer"
                          >
                            <i className="fa-solid fa-pen text-sm" />
                          </button>
                          <button
                            onClick={() => setVariantToDelete(variant.id)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 cursor-pointer"
                          >
                            <i className="fa-solid fa-trash text-sm" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Danger Zone */}
        <div className="bg-white rounded-xl shadow-sm border border-red-200 p-6">
          <h2 className="text-lg font-semibold text-red-600 mb-2">Danger Zone</h2>
          <p className="text-sm text-gray-500 mb-4">
            Permanently delete this product and all its variants. This action cannot be undone.
          </p>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium cursor-pointer"
          >
            <i className="fa-solid fa-trash" />
            Delete Product
          </button>
        </div>
      </div>

      {/* Add/Edit Variant Modal */}
      <VariantForm
        isOpen={showVariantModal}
        onClose={() => {
          setShowVariantModal(false);
          setEditingVariant(null);
        }}
        onSubmit={handleVariantSubmit}
        initialData={editingVariant}
        isSubmitting={isSubmittingVariant}
      />

      {/* Delete Variant Modal */}
      <Modal
        isOpen={variantToDelete !== null}
        onClose={() => setVariantToDelete(null)}
        title="Delete Variant"
        leftButton={{
          text: 'Cancel',
          onClick: () => setVariantToDelete(null),
          variant: 'secondary',
        }}
        rightButton={{
          text: isDeletingVariant ? 'Deleting...' : 'Delete',
          onClick: handleDeleteVariant,
          variant: 'danger',
        }}
      >
        <p className="text-gray-600">
          Are you sure you want to delete this variant? This action cannot be undone.
        </p>
      </Modal>

      {/* Delete Product Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Product"
        leftButton={{
          text: 'Cancel',
          onClick: () => setShowDeleteModal(false),
          variant: 'secondary',
        }}
        rightButton={{
          text: isDeleting ? 'Deleting...' : 'Delete',
          onClick: handleDelete,
          variant: 'danger',
        }}
      >
        <p className="text-gray-600">
          Are you sure you want to delete{' '}
          <span className="font-semibold text-gray-900">{product.name}</span> and all its variants?
          This action cannot be undone.
        </p>
      </Modal>
    </Layout>
  );
}

export default ProductProfile;
