import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import Modal from '../../components/ui/Modal';
import ProductsTable from './ProductsTable';
import BrandsModal from './BrandsModal';
import usePageTitle from '../../hooks/usePageTitle';
import useDebounce from '../../hooks/useDebounce';
import { ProductType, ProductStatus, ProductStatusLabels } from '../../types/product';
import { useGetProductsQuery, useDeleteProductMutation } from '../../store/api/productsApi';
import { useGetBrandsQuery } from '../../store/api/brandsApi';
import { useGetCategoriesQuery } from '../../store/api/categoriesApi';
import { useToast } from '../../context/ToastContext';

type TabType = 'all' | 'tyre' | 'battery' | 'spare_part';

const tabs: { key: TabType; label: string; type?: ProductType }[] = [
  { key: 'all', label: 'All' },
  { key: 'tyre', label: 'Tyres', type: ProductType.TYRE },
  { key: 'battery', label: 'Batteries', type: ProductType.BATTERY },
  { key: 'spare_part', label: 'Spare Parts', type: ProductType.SPARE_PART },
];

function Products() {
  usePageTitle('Products');

  const [searchParams, setSearchParams] = useSearchParams();
  const { showToast } = useToast();

  const urlTab = searchParams.get('type') as TabType | null;
  const [activeTab, setActiveTab] = useState<TabType>(urlTab || 'all');

  // Filters — all sent to backend
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 400);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Selection
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [actionValue, setActionValue] = useState('');

  // Modals
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [singleDeleteId, setSingleDeleteId] = useState<number | null>(null);
  const [showBrandsModal, setShowBrandsModal] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [resultsPerPage, setResultsPerPage] = useState(10);

  const currentTab = tabs.find((t) => t.key === activeTab);

  // All filtering happens on the backend
  const { data: products = [], isLoading, isFetching } = useGetProductsQuery({
    name: debouncedSearch || undefined,
    status: selectedStatus !== 'all' ? (Number(selectedStatus) as ProductStatus) : undefined,
    productType: currentTab?.type,
    brandId: selectedBrand !== 'all' ? Number(selectedBrand) : undefined,
    categoryId: selectedCategory !== 'all' ? Number(selectedCategory) : undefined,
    includeRelations: true,
  });

  const { data: brands = [] } = useGetBrandsQuery();
  const { data: categories = [] } = useGetCategoriesQuery();
  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();

  // Client-side pagination only
  const total = products.length;
  const totalPages = Math.ceil(total / resultsPerPage);
  const startIndex = (currentPage - 1) * resultsPerPage;
  const endIndex = Math.min(startIndex + resultsPerPage, total);
  const paginatedProducts = products.slice(startIndex, endIndex);

  // Reset page when any filter changes
  useEffect(() => {
    setCurrentPage(1);
    setSelectedIds(new Set());
  }, [debouncedSearch, selectedStatus, selectedBrand, selectedCategory, activeTab, resultsPerPage]);

  // Update URL when tab changes
  useEffect(() => {
    if (activeTab === 'all') {
      searchParams.delete('type');
    } else {
      searchParams.set('type', activeTab);
    }
    setSearchParams(searchParams, { replace: true });
  }, [activeTab]);

  // Selection
  const isAllSelected =
    paginatedProducts.length > 0 && paginatedProducts.every((p) => selectedIds.has(p.id));
  const isSomeSelected = paginatedProducts.some((p) => selectedIds.has(p.id));

  const toggleSelectAll = () => {
    const newSet = new Set(selectedIds);
    if (isAllSelected) {
      paginatedProducts.forEach((p) => newSet.delete(p.id));
    } else {
      paginatedProducts.forEach((p) => newSet.add(p.id));
    }
    setSelectedIds(newSet);
  };

  const toggleSelectOne = (id: number) => {
    const newSet = new Set(selectedIds);
    newSet.has(id) ? newSet.delete(id) : newSet.add(id);
    setSelectedIds(newSet);
  };

  const handleSingleDelete = (id: number) => {
    setSingleDeleteId(id);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    const idsToDelete = singleDeleteId ? [singleDeleteId] : Array.from(selectedIds);
    if (idsToDelete.length === 0) return;

    try {
      await Promise.all(idsToDelete.map((id) => deleteProduct(id).unwrap()));
      showToast('success', `${idsToDelete.length} product${idsToDelete.length > 1 ? 's' : ''} deleted successfully`);
      setSelectedIds(new Set());
      setSingleDeleteId(null);
      setActionValue('');
      setShowDeleteModal(false);
    } catch {
      showToast('error', 'Failed to delete products');
    }
  };

  const handleActionChange = (value: string) => {
    setActionValue(value);
    if (value === 'delete') setShowDeleteModal(true);
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setSelectedIds(new Set());
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else if (currentPage <= 3) {
      pages.push(1, 2, 3, 4, '...', totalPages);
    } else if (currentPage >= totalPages - 2) {
      pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    } else {
      pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
    }
    return pages;
  };

  const getAddProductUrl = () =>
    activeTab === 'all' ? '/products/new' : `/products/new?type=${activeTab}`;

  if (isLoading && products.length === 0) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-3">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Products</h1>
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setShowBrandsModal(true)}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm sm:text-base cursor-pointer"
            >
              <i className="fa-solid fa-tag" />
              <span className="hidden sm:inline">Manage Brands</span>
              <span className="sm:hidden">Brands</span>
            </button>
            <Link
              to={getAddProductUrl()}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm sm:text-base"
            >
              <i className="fa-solid fa-plus" />
              <span>Add Product</span>
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => handleTabChange(tab.key)}
                className={`flex-shrink-0 px-4 sm:px-6 py-3 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
                  activeTab === tab.key
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4">
          <div className="flex flex-col gap-3">
            {/* Search */}
            <div className="relative w-full">
              <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by product name"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-transparent"
              />
              {isFetching && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600" />
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              {/* Status */}
              <div className="relative flex-1 min-w-[130px]">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full appearance-none pl-9 pr-8 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 bg-white cursor-pointer"
                >
                  <option value="all">All statuses</option>
                  {Object.entries(ProductStatusLabels).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
                <i className="fa-solid fa-circle-check absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                <i className="fa-solid fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
              </div>

              {/* Brand */}
              <div className="relative flex-1 min-w-[130px]">
                <select
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  className="w-full appearance-none pl-9 pr-8 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 bg-white cursor-pointer"
                >
                  <option value="all">All brands</option>
                  {brands.map((brand) => (
                    <option key={brand.id} value={brand.id}>{brand.name}</option>
                  ))}
                </select>
                <i className="fa-solid fa-tag absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                <i className="fa-solid fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
              </div>

              {/* Category */}
              <div className="relative flex-1 min-w-[130px]">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full appearance-none pl-9 pr-8 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 bg-white cursor-pointer"
                >
                  <option value="all">All categories</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                <i className="fa-solid fa-folder absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                <i className="fa-solid fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
              </div>

              {/* Actions */}
              <div className="relative flex-1 min-w-[130px]">
                <select
                  value={actionValue}
                  onChange={(e) => handleActionChange(e.target.value)}
                  disabled={selectedIds.size === 0}
                  className="w-full appearance-none pl-9 pr-8 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 bg-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">Actions</option>
                  <option value="delete">Delete</option>
                </select>
                <i className="fa-solid fa-sliders absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                <i className="fa-solid fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <ProductsTable
          products={paginatedProducts}
          selectedIds={selectedIds}
          onSelectOne={toggleSelectOne}
          onSelectAll={toggleSelectAll}
          isAllSelected={isAllSelected}
          isSomeSelected={isSomeSelected}
          startIndex={startIndex}
          endIndex={endIndex}
          total={total}
          resultsPerPage={resultsPerPage}
          onResultsPerPageChange={setResultsPerPage}
          onDelete={handleSingleDelete}
        />

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-4 sm:px-6 py-3 sm:py-4">
            <div className="flex items-center justify-between gap-4">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <i className="fa-solid fa-arrow-left" />
                Previous
              </button>
              <div className="flex items-center gap-1">
                {getPageNumbers().map((page, index) =>
                  typeof page === 'number' ? (
                    <button
                      key={index}
                      onClick={() => setCurrentPage(page)}
                      className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                        currentPage === page ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {page}
                    </button>
                  ) : (
                    <span key={index} className="px-2 text-gray-400">{page}</span>
                  )
                )}
              </div>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
                <i className="fa-solid fa-arrow-right" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => { setShowDeleteModal(false); setSingleDeleteId(null); setActionValue(''); }}
        title="Delete Product"
        leftButton={{
          text: 'Cancel',
          onClick: () => { setShowDeleteModal(false); setSingleDeleteId(null); setActionValue(''); },
          variant: 'secondary',
        }}
        rightButton={{
          text: isDeleting ? 'Deleting...' : 'Delete',
          onClick: handleDeleteConfirm,
          variant: 'danger',
        }}
      >
        <p className="text-gray-600">
          {singleDeleteId ? (
            <>Are you sure you want to delete <span className="font-semibold text-gray-900">{products.find((p) => p.id === singleDeleteId)?.name}</span>? This action cannot be undone.</>
          ) : (
            <>Are you sure you want to delete {selectedIds.size} product{selectedIds.size > 1 ? 's' : ''}? This action cannot be undone.</>
          )}
        </p>
      </Modal>

      <BrandsModal isOpen={showBrandsModal} onClose={() => setShowBrandsModal(false)} />
    </Layout>
  );
}

export default Products;
