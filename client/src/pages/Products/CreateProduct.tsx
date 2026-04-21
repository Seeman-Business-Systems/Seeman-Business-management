import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import ProductForm from './ProductForm';
import usePageTitle from '../../hooks/usePageTitle';
import {
  useCreateProductMutation,
  useCreateProductVariantMutation,
} from '../../store/api/productsApi';
import { useToast } from '../../context/ToastContext';
import type { ProductFormData, VariantFormData } from '../../types/product';
import { ProductType, ProductStatus } from '../../types/product';

function CreateProduct() {
  usePageTitle('Add Product');
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [searchParams] = useSearchParams();

  const [createProduct, { isLoading: isCreatingProduct }] = useCreateProductMutation();
  const [createVariant, { isLoading: isCreatingVariant }] = useCreateProductVariantMutation();

  const isSubmitting = isCreatingProduct || isCreatingVariant;

  // Get default product type from URL
  const getDefaultProductType = (): ProductType | undefined => {
    const typeParam = searchParams.get('type');
    if (typeParam === 'tyre') return ProductType.TYRE;
    if (typeParam === 'battery') return ProductType.BATTERY;
    if (typeParam === 'spare_part') return ProductType.SPARE_PART;
    return undefined;
  };

  const handleSubmit = async (data: ProductFormData, variants: VariantFormData[]) => {
    try {
      // Create the product first
      const product = await createProduct({
        name: data.name,
        description: data.description || null,
        productType: data.productType as ProductType,
        status: data.status as ProductStatus,
        brandId: Number(data.brandId),
        categoryId: Number(data.categoryId),
      }).unwrap();

      // Create variants sequentially
      for (const variant of variants) {
        await createVariant({
          productId: product.id,
          sku: variant.sku,
          variantName: variant.variantName,
          sellingPrice: Number(variant.sellingPrice),
          specifications: variant.specifications,
        }).unwrap();
      }

      showToast('success', `Product "${data.name}" created successfully`);
      navigate('/products');
    } catch (err: unknown) {
      const errorMessage =
        err && typeof err === 'object' && 'data' in err
          ? (err as { data?: { message?: string } }).data?.message
          : 'Failed to create product';
      showToast('error', `An error occurred. Please try again. Error: ${errorMessage}`);
    }
  };

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
          <h1 className="text-2xl font-bold text-gray-900">Add Product</h1>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <ProductForm
            onSubmit={handleSubmit}
            submitLabel="Create Product"
            isSubmitting={isSubmitting}
            defaultProductType={getDefaultProductType()}
          />
        </div>
      </div>
    </Layout>
  );
}

export default CreateProduct;
