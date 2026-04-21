import { useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import ProductForm from './ProductForm';
import usePageTitle from '../../hooks/usePageTitle';
import {
  useGetProductQuery,
  useUpdateProductMutation,
  useCreateProductVariantMutation,
  useUpdateProductVariantMutation,
  useDeleteProductVariantMutation,
} from '../../store/api/productsApi';
import { useToast } from '../../context/ToastContext';
import type { ProductFormData, VariantFormData } from '../../types/product';
import { ProductType, ProductStatus } from '../../types/product';

function EditProduct() {
  usePageTitle('Edit Product');
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const productId = Number(id);

  const {
    data: product,
    isLoading: loading,
    error: fetchError,
  } = useGetProductQuery({ id: productId, includeRelations: true }, { skip: !productId });

  const { showToast } = useToast();
  const [updateProduct, { isLoading: isUpdatingProduct }] = useUpdateProductMutation();
  const [createVariant, { isLoading: isCreatingVariant }] = useCreateProductVariantMutation();
  const [updateVariant, { isLoading: isUpdatingVariant }] = useUpdateProductVariantMutation();
  const [deleteVariant, { isLoading: isDeletingVariant }] = useDeleteProductVariantMutation();

  const isSubmitting =
    isUpdatingProduct || isCreatingVariant || isUpdatingVariant || isDeletingVariant;

  // Convert existing variants to form data format
  const initialVariants = useMemo((): VariantFormData[] => {
    if (!product?.variants) return [];
    return product.variants.map((v) => ({
      id: v.id,
      sku: v.sku,
      variantName: v.variantName,
      sellingPrice: v.sellingPrice.toString(),
      specifications: v.specifications,
    }));
  }, [product]);

  const handleSubmit = async (data: ProductFormData, variants: VariantFormData[]) => {
    try {
      // Update the product
      await updateProduct({
        id: productId,
        name: data.name,
        description: data.description || null,
        productType: data.productType as ProductType,
        status: data.status as ProductStatus,
        brandId: Number(data.brandId),
        categoryId: Number(data.categoryId),
      }).unwrap();

      // Handle variants
      const existingVariantIds = new Set(product?.variants?.map((v) => v.id) || []);
      const formVariantIds = new Set(variants.filter((v) => v.id).map((v) => v.id!));

      // Delete removed variants
      for (const existingId of existingVariantIds) {
        if (!formVariantIds.has(existingId)) {
          await deleteVariant({ productId, variantId: existingId }).unwrap();
        }
      }

      // Create or update variants
      for (const variant of variants) {
        if (variant.id && existingVariantIds.has(variant.id)) {
          // Update existing variant
          await updateVariant({
            productId,
            variantId: variant.id,
            sku: variant.sku,
            variantName: variant.variantName,
            sellingPrice: Number(variant.sellingPrice),
            specifications: variant.specifications,
          }).unwrap();
        } else {
          // Create new variant
          await createVariant({
            productId,
            sku: variant.sku,
            variantName: variant.variantName,
            sellingPrice: Number(variant.sellingPrice),
            specifications: variant.specifications,
          }).unwrap();
        }
      }

      showToast('success', `Product "${data.name}" updated successfully`);
      navigate('/products');
    } catch (err: unknown) {
      const errorMessage =
        err && typeof err === 'object' && 'data' in err
          ? (err as { data?: { message?: string } }).data?.message
          : 'Failed to update product';
      showToast('error', `An error occurred. Please try again. Error: ${errorMessage}`);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </Layout>
    );
  }

  if (fetchError || !product) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900">Product not found</h2>
          <p className="text-gray-600 mt-2">The product you're looking for doesn't exist.</p>
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
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link
            to="/products"
            className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <i className="fa-solid fa-arrow-left" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
            <p className="text-sm text-gray-500 mt-1">{product.name}</p>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <ProductForm
            initialData={product}
            initialVariants={initialVariants}
            onSubmit={handleSubmit}
            submitLabel="Save Changes"
            isSubmitting={isSubmitting}
          />
        </div>
      </div>
    </Layout>
  );
}

export default EditProduct;
