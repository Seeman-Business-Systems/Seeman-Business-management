import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import Modal from '../../components/ui/Modal';
import InventoryTable from './InventoryTable';
import usePageTitle from '../../hooks/usePageTitle';
import type { EnrichedInventoryRecord, InventoryRecord } from '../../types/inventory';
import { useGetInventoryQuery, useSetReorderLevelsMutation, useAddStockMutation, useAdjustInventoryMutation } from '../../store/api/inventoryApi';
import { useGetWarehousesQuery } from '../../store/api/warehousesApi';
import { useGetBrandsQuery } from '../../store/api/brandsApi';
import { useGetProductsQuery } from '../../store/api/productsApi';
import { ProductType } from '../../types/product';
import { useToast } from '../../context/ToastContext';

type TabType = 'all' | 'tyre' | 'battery' | 'spare_part';

const tabs: { key: TabType; label: string; type?: ProductType }[] = [
  { key: 'all', label: 'All' },
  { key: 'tyre', label: 'Tyres', type: ProductType.TYRE },
  { key: 'battery', label: 'Batteries', type: ProductType.BATTERY },
  { key: 'spare_part', label: 'Spare Parts', type: ProductType.SPARE_PART },
];

function Inventory() {
  usePageTitle('Inventory');

  const { showToast } = useToast();

  const [searchParams] = useSearchParams();

  // Tab filter
  const [activeTab, setActiveTab] = useState<TabType>('all');

  // Backend filters
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>(
    searchParams.get('warehouseId') ?? 'all'
  );
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);

  // Client-side filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [resultsPerPage, setResultsPerPage] = useState(10);

  // Reorder levels modal
  const [reorderRecord, setReorderRecord] = useState<InventoryRecord | null>(null);
  const [minQty, setMinQty] = useState('');
  const [maxQty, setMaxQty] = useState('');

  // Adjust stock modal
  const [adjustRecord, setAdjustRecord] = useState<EnrichedInventoryRecord | null>(null);
  const [adjustType, setAdjustType] = useState<'add' | 'remove'>('add');
  const [adjustQty, setAdjustQty] = useState('');
  const [adjustReason, setAdjustReason] = useState('Physical count correction');
  const [adjustNotes, setAdjustNotes] = useState('');

  // Add stock modal
  const [addStockRecord, setAddStockRecord] = useState<EnrichedInventoryRecord | null>(null);
  const [stockQty, setStockQty] = useState('');
  const [stockNotes, setStockNotes] = useState('');

  const { data: inventory = [], isLoading, isFetching } = useGetInventoryQuery({
    warehouseId: selectedWarehouse !== 'all' ? Number(selectedWarehouse) : undefined,
    lowInventory: showLowStockOnly || undefined,
  });

  const { data: warehouses = [] } = useGetWarehousesQuery();
  const { data: brands = [] } = useGetBrandsQuery();
  const { data: products = [] } = useGetProductsQuery({ includeRelations: true });
  const [setReorderLevels, { isLoading: isSavingReorder }] = useSetReorderLevelsMutation();
  const [addStock, { isLoading: isAddingStock }] = useAddStockMutation();
  const [adjustInventory, { isLoading: isAdjusting }] = useAdjustInventoryMutation();

  // Build productId → product info lookup
  const productInfoMap = useMemo(() => {
    const map = new Map<number, { brandName: string; brandId: number; productType: ProductType }>();
    products.forEach((p) => {
      map.set(p.id, {
        brandName: p.brand?.name ?? '',
        brandId: p.brand?.id ?? 0,
        productType: p.productType,
      });
    });
    return map;
  }, [products]);

  // Enrich inventory records with product-level info
  const enrichedInventory: EnrichedInventoryRecord[] = useMemo(() => {
    return inventory.map((r) => {
      const productId = r.variant?.productId;
      const info = productId ? productInfoMap.get(productId) : undefined;
      return {
        ...r,
        brandName: info?.brandName,
        brandId: info?.brandId,
        productType: info?.productType,
      };
    });
  }, [inventory, productInfoMap]);

  const currentTabType = tabs.find((t) => t.key === activeTab)?.type;

  // Client-side filtering (tab + search + brand)
  const filtered = useMemo(() => {
    return enrichedInventory.filter((r) => {
      if (currentTabType !== undefined && r.productType !== currentTabType) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesSearch =
          r.variant?.variantName?.toLowerCase().includes(q) ||
          r.variant?.sku?.toLowerCase().includes(q);
        if (!matchesSearch) return false;
      }
      if (selectedBrand !== 'all' && r.brandId !== Number(selectedBrand)) return false;
      return true;
    });
  }, [enrichedInventory, currentTabType, searchQuery, selectedBrand]);

  const total = filtered.length;
  const totalPages = Math.ceil(total / resultsPerPage);
  const startIndex = (currentPage - 1) * resultsPerPage;
  const endIndex = Math.min(startIndex + resultsPerPage, total);
  const paginatedRecords = filtered.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedWarehouse, showLowStockOnly, selectedBrand, activeTab, resultsPerPage]);

  const lowStockCount = inventory.filter((r) => r.isLowInventory).length;

  // Reorder levels handlers
  const openReorderModal = (record: InventoryRecord) => {
    setReorderRecord(record);
    setMinQty(record.minimumQuantity.toString());
    setMaxQty(record.maximumQuantity?.toString() ?? '');
  };

  const closeReorderModal = () => {
    setReorderRecord(null);
    setMinQty('');
    setMaxQty('');
  };

  const handleSaveReorderLevels = async () => {
    if (!reorderRecord) return;
    const min = Number(minQty);
    if (!minQty || isNaN(min) || min < 0) {
      showToast('error', 'Minimum quantity must be a valid number');
      return;
    }
    try {
      await setReorderLevels({
        variantId: reorderRecord.variantId,
        warehouseId: reorderRecord.warehouseId,
        minimumQuantity: min,
        maximumQuantity: maxQty ? Number(maxQty) : null,
      }).unwrap();
      showToast('success', 'Reorder levels updated');
      closeReorderModal();
    } catch {
      showToast('error', 'Failed to update reorder levels');
    }
  };

  // Adjust stock handlers
  const openAdjustModal = (record: EnrichedInventoryRecord) => {
    setAdjustRecord(record);
    setAdjustType('add');
    setAdjustQty('');
    setAdjustReason('Physical count correction');
    setAdjustNotes('');
  };

  const closeAdjustModal = () => {
    setAdjustRecord(null);
    setAdjustQty('');
    setAdjustNotes('');
  };

  const handleAdjustStock = async () => {
    if (!adjustRecord) return;
    const qty = Number(adjustQty);
    if (!adjustQty || isNaN(qty) || qty < 1) {
      showToast('error', 'Quantity must be at least 1');
      return;
    }
    const adjustmentQuantity = adjustType === 'add' ? qty : -qty;
    const notes = adjustNotes.trim() || adjustReason;
    try {
      await adjustInventory({
        variantId: adjustRecord.variantId,
        warehouseId: adjustRecord.warehouseId,
        adjustmentQuantity,
        notes,
      }).unwrap();
      showToast('success', `Stock ${adjustType === 'add' ? 'increased' : 'reduced'} by ${qty}`);
      closeAdjustModal();
    } catch (err: any) {
      const msg = err?.data?.message ?? 'Failed to adjust stock';
      showToast('error', msg);
    }
  };

  // Add stock handlers
  const openAddStockModal = (record: EnrichedInventoryRecord) => {
    setAddStockRecord(record);
    setStockQty('');
    setStockNotes('');
  };

  const closeAddStockModal = () => {
    setAddStockRecord(null);
    setStockQty('');
    setStockNotes('');
  };

  const handleAddStock = async () => {
    if (!addStockRecord) return;
    const qty = Number(stockQty);
    if (!stockQty || isNaN(qty) || qty < 1) {
      showToast('error', 'Quantity must be at least 1');
      return;
    }
    try {
      await addStock({
        variantId: addStockRecord.variantId,
        warehouseId: addStockRecord.warehouseId,
        quantity: qty,
        notes: stockNotes.trim() || undefined,
      }).unwrap();
      showToast('success', `${qty} units added to stock`);
      closeAddStockModal();
    } catch {
      showToast('error', 'Failed to add stock');
    }
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

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
          <p className="ml-3 text-gray-500">Loading inventory…</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-3">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Inventory</h1>
            {lowStockCount > 0 && (
              <p className="text-sm text-red-600 mt-0.5">
                <i className="fa-solid fa-triangle-exclamation mr-1" />
                {lowStockCount} item{lowStockCount > 1 ? 's' : ''} below minimum stock
              </p>
            )}
          </div>
          <Link
            to="/inventory/containers"
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
          >
            <i className="fa-solid fa-ship" />
            Containers
          </Link>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
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
            <div className="relative w-full">
              <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by variant name or SKU"
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
              {/* Warehouse filter */}
              <div className="relative flex-1 min-w-[140px]">
                <select
                  value={selectedWarehouse}
                  onChange={(e) => setSelectedWarehouse(e.target.value)}
                  className="w-full appearance-none pl-9 pr-8 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 bg-white cursor-pointer"
                >
                  <option value="all">All warehouses</option>
                  {warehouses.map((w) => (
                    <option key={w.id} value={w.id}>{w.name}</option>
                  ))}
                </select>
                <i className="fa-solid fa-warehouse absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                <i className="fa-solid fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
              </div>

              {/* Brand filter */}
              <div className="relative flex-1 min-w-[130px]">
                <select
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  className="w-full appearance-none pl-9 pr-8 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 bg-white cursor-pointer"
                >
                  <option value="all">All brands</option>
                  {brands.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
                <i className="fa-solid fa-tag absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                <i className="fa-solid fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
              </div>

              {/* Low stock toggle */}
              <button
                onClick={() => setShowLowStockOnly((v) => !v)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium border transition-colors cursor-pointer ${
                  showLowStockOnly
                    ? 'bg-red-50 border-red-300 text-red-700'
                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <i className="fa-solid fa-triangle-exclamation text-red-500" />
                Low Stock Only
                {lowStockCount > 0 && (
                  <span className={`ml-1 px-1.5 py-0.5 rounded-full text-xs font-semibold ${
                    showLowStockOnly ? 'bg-red-200 text-red-800' : 'bg-red-100 text-red-700'
                  }`}>
                    {lowStockCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <InventoryTable
          records={paginatedRecords}
          startIndex={startIndex}
          endIndex={endIndex}
          total={total}
          resultsPerPage={resultsPerPage}
          onResultsPerPageChange={setResultsPerPage}
          onSetReorderLevels={openReorderModal}
          onAddStock={openAddStockModal}
          onAdjustStock={openAdjustModal}
        />

        {/* Pagination */}
        {(
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

      {/* Set Reorder Levels Modal */}
      <Modal
        isOpen={!!reorderRecord}
        onClose={closeReorderModal}
        title="Set Reorder Levels"
        leftButton={{ text: 'Cancel', onClick: closeReorderModal, variant: 'secondary' }}
        rightButton={{ text: isSavingReorder ? 'Saving...' : 'Save', onClick: handleSaveReorderLevels, variant: 'primary' }}
      >
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-sm font-medium text-gray-900">{reorderRecord?.variant?.variantName}</p>
            <p className="text-xs font-mono text-gray-400 mt-0.5">{reorderRecord?.variant?.sku}</p>
            <p className="text-xs text-gray-500 mt-1">
              <i className="fa-solid fa-warehouse mr-1" />
              {reorderRecord?.warehouse?.name}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Minimum Quantity <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="0"
              value={minQty}
              onChange={(e) => setMinQty(e.target.value)}
              placeholder="e.g. 10"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-transparent"
            />
            <p className="text-xs text-gray-400 mt-1">Alert shown when stock falls below this level</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Maximum Quantity <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              type="number"
              min="0"
              value={maxQty}
              onChange={(e) => setMaxQty(e.target.value)}
              placeholder="e.g. 100"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-transparent"
            />
          </div>
        </div>
      </Modal>

      {/* Add Stock Modal */}
      <Modal
        isOpen={!!addStockRecord}
        onClose={closeAddStockModal}
        title="Add Stock"
        leftButton={{ text: 'Cancel', onClick: closeAddStockModal, variant: 'secondary' }}
        rightButton={{ text: isAddingStock ? 'Adding...' : 'Add Stock', onClick: handleAddStock, variant: 'primary' }}
      >
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-sm font-medium text-gray-900">{addStockRecord?.variant?.variantName}</p>
            <p className="text-xs font-mono text-gray-400 mt-0.5">{addStockRecord?.variant?.sku}</p>
            <p className="text-xs text-gray-500 mt-1">
              <i className="fa-solid fa-warehouse mr-1" />
              {addStockRecord?.warehouse?.name}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quantity <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="1"
              value={stockQty}
              onChange={(e) => setStockQty(e.target.value)}
              placeholder="e.g. 50"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              value={stockNotes}
              onChange={(e) => setStockNotes(e.target.value)}
              rows={2}
              placeholder="e.g. Stock received from supplier"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 resize-none"
            />
          </div>
        </div>
      </Modal>

      {/* Adjust Stock Modal */}
      <Modal
        isOpen={!!adjustRecord}
        onClose={closeAdjustModal}
        title="Adjust Stock"
        leftButton={{ text: 'Cancel', onClick: closeAdjustModal, variant: 'secondary' }}
        rightButton={{ text: isAdjusting ? 'Saving...' : 'Save Adjustment', onClick: handleAdjustStock, variant: 'primary' }}
      >
        <div className="space-y-4">
          {/* Item info */}
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-sm font-medium text-gray-900">{adjustRecord?.variant?.variantName}</p>
            <p className="text-xs font-mono text-gray-400 mt-0.5">{adjustRecord?.variant?.sku}</p>
            <p className="text-xs text-gray-500 mt-1">
              <i className="fa-solid fa-warehouse mr-1" />
              {adjustRecord?.warehouse?.name}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Current stock: <span className="font-semibold text-gray-700">{adjustRecord?.totalQuantity ?? 0}</span>
            </p>
          </div>

          {/* Add / Remove toggle */}
          <div className="flex rounded-lg border border-gray-200 overflow-hidden">
            <button
              onClick={() => setAdjustType('add')}
              className={`flex-1 py-2.5 text-sm font-medium transition-colors cursor-pointer ${
                adjustType === 'add'
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <i className="fa-solid fa-plus mr-1.5" />
              Add
            </button>
            <button
              onClick={() => setAdjustType('remove')}
              className={`flex-1 py-2.5 text-sm font-medium transition-colors cursor-pointer ${
                adjustType === 'remove'
                  ? 'bg-red-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <i className="fa-solid fa-minus mr-1.5" />
              Remove
            </button>
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quantity <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="1"
              value={adjustQty}
              onChange={(e) => setAdjustQty(e.target.value)}
              placeholder="e.g. 5"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-transparent"
            />
            {adjustQty && !isNaN(Number(adjustQty)) && Number(adjustQty) > 0 && (
              <p className="text-xs mt-1.5 font-medium">
                {adjustType === 'add' ? (
                  <span className="text-green-600">
                    New total: {(adjustRecord?.totalQuantity ?? 0) + Number(adjustQty)}
                  </span>
                ) : (
                  <span className={
                    (adjustRecord?.totalQuantity ?? 0) - Number(adjustQty) < 0
                      ? 'text-red-600'
                      : 'text-gray-600'
                  }>
                    New total: {(adjustRecord?.totalQuantity ?? 0) - Number(adjustQty)}
                    {(adjustRecord?.totalQuantity ?? 0) - Number(adjustQty) < 0 && ' (will fail — not enough stock)'}
                  </span>
                )}
              </p>
            )}
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
            <select
              value={adjustReason}
              onChange={(e) => setAdjustReason(e.target.value)}
              className="w-full appearance-none px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 bg-white cursor-pointer"
            >
              <option>Physical count correction</option>
              <option>Damaged / Write-off</option>
              <option>Found stock</option>
              <option>Theft / Loss</option>
              <option>Other</option>
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              value={adjustNotes}
              onChange={(e) => setAdjustNotes(e.target.value)}
              rows={2}
              placeholder="Additional details..."
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 resize-none"
            />
          </div>
        </div>
      </Modal>
    </Layout>
  );
}

export default Inventory;
