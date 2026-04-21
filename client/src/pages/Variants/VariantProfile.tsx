import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import Modal from '../../components/ui/Modal';
import usePageTitle from '../../hooks/usePageTitle';
import { ProductType, ProductTypeLabels, ProductStatus, ProductStatusLabels } from '../../types/product';
import { useGetInventoryQuery, useSetReorderLevelsMutation } from '../../store/api/inventoryApi';
import { useGetProductQuery } from '../../store/api/productsApi';
import { useGetWarehousesQuery } from '../../store/api/warehousesApi';
import { useCreateInventoryBatchMutation, useReceiveInventoryBatchMutation } from '../../store/api/inventoryBatchesApi';
import { useToast } from '../../context/ToastContext';
import type { InventoryRecord } from '../../types/inventory';

const typeStyles: Record<ProductType, string> = {
  [ProductType.TYRE]: 'bg-blue-100 text-blue-800',
  [ProductType.BATTERY]: 'bg-yellow-100 text-yellow-800',
  [ProductType.SPARE_PART]: 'bg-purple-100 text-purple-800',
};

const statusStyles: Record<ProductStatus, string> = {
  [ProductStatus.ACTIVE]: 'bg-green-100 text-green-800',
  [ProductStatus.INACTIVE]: 'bg-gray-100 text-gray-800',
  [ProductStatus.DISCONTINUED]: 'bg-red-100 text-red-800',
};

const warehouseTypeLabels: Record<number, string> = {
  1: 'Main Warehouse',
  2: 'Regional',
  3: 'Plaza',
  4: 'Retail Store',
};

function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

function VariantProfile() {
  usePageTitle('Variant Details');

  const { id } = useParams<{ id: string }>();
  const variantId = Number(id);
  const { showToast } = useToast();

  // Fetch all inventory records for this variant
  const { data: inventoryRecords = [], isLoading: inventoryLoading } = useGetInventoryQuery({ variantId });

  // Derive variant and product data from inventory records
  const variantData = inventoryRecords[0]?.variant ?? null;
  const productId = variantData?.productId;

  const { data: product, isLoading: productLoading } = useGetProductQuery(
    { id: productId!, includeRelations: true },
    { skip: !productId }
  );

  const { data: allWarehouses = [] } = useGetWarehousesQuery();

  const [setReorderLevels, { isLoading: isSavingReorder }] = useSetReorderLevelsMutation();
  const [createBatch, { isLoading: isCreatingBatch }] = useCreateInventoryBatchMutation();
  const [receiveBatch, { isLoading: isReceivingBatch }] = useReceiveInventoryBatchMutation();

  const isAddingStock = isCreatingBatch || isReceivingBatch;

  // Reorder levels modal
  const [reorderRecord, setReorderRecord] = useState<InventoryRecord | null>(null);
  const [minQty, setMinQty] = useState('');
  const [maxQty, setMaxQty] = useState('');

  // Add stock modal
  const [addStockRecord, setAddStockRecord] = useState<InventoryRecord | null>(null);
  const [stockQty, setStockQty] = useState('');
  const [stockCost, setStockCost] = useState('');
  const [stockBatchNum, setStockBatchNum] = useState('');
  const [stockSupplierId, setStockSupplierId] = useState('');
  const [stockExpiry, setStockExpiry] = useState('');

  // Add to warehouse modal
  const [addToWarehouseOpen, setAddToWarehouseOpen] = useState(false);
  const [newWarehouseId, setNewWarehouseId] = useState('');
  const [newStockQty, setNewStockQty] = useState('');
  const [newStockCost, setNewStockCost] = useState('');
  const [newStockSupplierId, setNewStockSupplierId] = useState('');
  const [newStockBatchNum, setNewStockBatchNum] = useState('');
  const [newStockExpiry, setNewStockExpiry] = useState('');

  // Warehouses where this variant has no inventory record yet
  const existingWarehouseIds = new Set(inventoryRecords.map((r) => r.warehouseId));
  const availableWarehouses = allWarehouses.filter((w) => !existingWarehouseIds.has(w.id));

  const openAddToWarehouse = () => {
    setNewWarehouseId('');
    setNewStockQty('');
    setNewStockCost('');
    setNewStockSupplierId('');
    setNewStockBatchNum(`BATCH-${Date.now()}`);
    setNewStockExpiry('');
    setAddToWarehouseOpen(true);
  };

  const handleAddToWarehouse = async () => {
    const warehouseId = Number(newWarehouseId);
    const qty = Number(newStockQty);
    const cost = Number(newStockCost);
    const supplierId = Number(newStockSupplierId);

    if (!newWarehouseId || !warehouseId) { showToast('error', 'Please select a warehouse'); return; }
    if (!newStockQty || qty < 1) { showToast('error', 'Quantity must be at least 1'); return; }
    if (!newStockCost || cost < 0) { showToast('error', 'Cost price must be a valid number'); return; }
    if (!newStockSupplierId || supplierId < 1) { showToast('error', 'Supplier ID is required'); return; }

    try {
      const batch = await createBatch({
        variantId,
        warehouseId,
        batchNumber: newStockBatchNum || `BATCH-${Date.now()}`,
        supplierId,
        quantityReceived: qty,
        costPricePerUnit: cost,
        expiryDate: newStockExpiry || null,
      }).unwrap();
      await receiveBatch(batch.id).unwrap();
      showToast('success', `Variant added to warehouse with ${qty} units`);
      setAddToWarehouseOpen(false);
    } catch {
      showToast('error', 'Failed to add variant to warehouse');
    }
  };

  // Computed totals
  const totalQuantity = inventoryRecords.reduce((s, r) => s + r.totalQuantity, 0);
  const reservedQuantity = inventoryRecords.reduce((s, r) => s + r.reservedQuantity, 0);
  const availableQuantity = inventoryRecords.reduce((s, r) => s + r.availableQuantity, 0);

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
      setReorderRecord(null);
    } catch {
      showToast('error', 'Failed to update reorder levels');
    }
  };

  const openAddStock = (record: InventoryRecord) => {
    setAddStockRecord(record);
    setStockBatchNum(`BATCH-${Date.now()}`);
    setStockQty('');
    setStockCost('');
    setStockSupplierId('');
    setStockExpiry('');
  };

  const handleAddStock = async () => {
    if (!addStockRecord) return;
    const qty = Number(stockQty);
    const cost = Number(stockCost);
    const supplierId = Number(stockSupplierId);

    if (!stockQty || qty < 1) { showToast('error', 'Quantity must be at least 1'); return; }
    if (!stockCost || cost < 0) { showToast('error', 'Cost price must be a valid number'); return; }
    if (!stockSupplierId || supplierId < 1) { showToast('error', 'Supplier ID is required'); return; }

    try {
      const batch = await createBatch({
        variantId: addStockRecord.variantId,
        warehouseId: addStockRecord.warehouseId,
        batchNumber: stockBatchNum || `BATCH-${Date.now()}`,
        supplierId,
        quantityReceived: qty,
        costPricePerUnit: cost,
        expiryDate: stockExpiry || null,
      }).unwrap();
      await receiveBatch(batch.id).unwrap();
      showToast('success', `${qty} units added to stock`);
      setAddStockRecord(null);
    } catch {
      showToast('error', 'Failed to add stock');
    }
  };

  const isLoading = inventoryLoading || productLoading;

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
        </div>
      </Layout>
    );
  }

  if (!variantData) {
    return (
      <Layout>
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <i className="fa-solid fa-box-open text-2xl text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Variant not found</h2>
          <p className="text-gray-600 mt-2">No inventory data found for this variant.</p>
          <Link to="/inventory" className="inline-flex items-center gap-2 mt-4 text-indigo-600 hover:text-indigo-800">
            <i className="fa-solid fa-arrow-left" />
            Back to Inventory
          </Link>
        </div>
      </Layout>
    );
  }

  const specifications = variantData.specifications as Record<string, string> | null;

  return (
    <Layout>
      <div className="space-y-6">
        {/* Back */}
        <Link to="/inventory" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors">
          <i className="fa-solid fa-arrow-left" />
          <span>Back to Inventory</span>
        </Link>

        {/* Header Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
                <i className="fa-solid fa-box text-2xl text-indigo-600" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{variantData.variantName}</h1>
                <p className="text-sm font-mono text-gray-400 mt-0.5">{variantData.sku}</p>
                {product && (
                  <Link
                    to={`/products/${product.id}`}
                    className="text-sm text-indigo-600 hover:text-indigo-800 mt-1 inline-flex items-center gap-1"
                  >
                    <i className="fa-solid fa-layer-group text-xs" />
                    {product.name}
                  </Link>
                )}
              </div>
            </div>
            <div className="text-xl font-bold text-gray-900">
              {variantData.sellingPrice != null ? formatPrice(variantData.sellingPrice) : '—'}
            </div>
          </div>
        </div>

        {/* Stock Summary */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <i className="fa-solid fa-boxes-stacked text-indigo-500" />
              Stock Summary
            </h2>
            {availableWarehouses.length > 0 && (
              <button
                onClick={openAddToWarehouse}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors text-sm font-medium cursor-pointer"
              >
                <i className="fa-solid fa-plus" />
                Add to Warehouse
              </button>
            )}
          </div>
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="text-center p-3 sm:p-4 bg-green-50 rounded-lg">
              <p className="text-lg sm:text-2xl font-bold text-green-700">{availableQuantity}</p>
              <p className="text-xs text-green-600 mt-1">Available</p>
            </div>
            <div className="text-center p-3 sm:p-4 bg-amber-50 rounded-lg">
              <p className="text-lg sm:text-2xl font-bold text-amber-700">{reservedQuantity}</p>
              <p className="text-xs text-amber-600 mt-1">Reserved</p>
            </div>
            <div className="text-center p-3 sm:p-4 bg-indigo-50 rounded-lg">
              <p className="text-lg sm:text-2xl font-bold text-indigo-700">{totalQuantity}</p>
              <p className="text-xs text-indigo-600 mt-1">Total</p>
            </div>
          </div>

          {/* Per-warehouse table */}
          {inventoryRecords.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 pr-4 font-medium text-gray-500">Warehouse</th>
                    <th className="text-left py-2 pr-4 font-medium text-gray-500 hidden sm:table-cell">Type</th>
                    <th className="text-left py-2 pr-4 font-medium text-gray-500">Available</th>
                    <th className="text-left py-2 pr-4 font-medium text-gray-500 hidden sm:table-cell">Reserved</th>
                    <th className="text-left py-2 pr-4 font-medium text-gray-500 hidden md:table-cell">Total</th>
                    <th className="text-left py-2 pr-4 font-medium text-gray-500 hidden md:table-cell">Min</th>
                    <th className="text-left py-2 font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {inventoryRecords.map((record) => (
                    <tr key={record.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-3 pr-4">
                        <p className="font-medium text-gray-900">{record.warehouse?.name ?? '—'}</p>
                        <p className="text-xs text-gray-400">{record.warehouse?.city}, {record.warehouse?.state}</p>
                      </td>
                      <td className="py-3 pr-4 hidden sm:table-cell text-gray-500">
                        {record.warehouse ? warehouseTypeLabels[record.warehouse.warehouseType] ?? '—' : '—'}
                      </td>
                      <td className="py-3 pr-4">
                        {record.isLowInventory ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                            <i className="fa-solid fa-triangle-exclamation" />
                            {record.availableQuantity}
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                            {record.availableQuantity}
                          </span>
                        )}
                      </td>
                      <td className="py-3 pr-4 hidden sm:table-cell text-gray-700">{record.reservedQuantity}</td>
                      <td className="py-3 pr-4 hidden md:table-cell text-gray-700">{record.totalQuantity}</td>
                      <td className="py-3 pr-4 hidden md:table-cell text-gray-500">{record.minimumQuantity}</td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openAddStock(record)}
                            className="text-xs px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 font-medium cursor-pointer"
                          >
                            <i className="fa-solid fa-plus mr-1" />
                            Add Stock
                          </button>
                          <button
                            onClick={() => { setReorderRecord(record); setMinQty(record.minimumQuantity.toString()); setMaxQty(record.maximumQuantity?.toString() ?? ''); }}
                            className="text-xs px-2.5 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium cursor-pointer"
                          >
                            <i className="fa-solid fa-sliders mr-1" />
                            Reorder
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-gray-400 italic text-center py-4">No inventory records for this variant</p>
          )}
        </div>

        {/* Product Info + Specs Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Product Info */}
          {product && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <i className="fa-solid fa-layer-group text-indigo-500" />
                Product Details
              </h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Type</span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${typeStyles[product.productType]}`}>
                    {ProductTypeLabels[product.productType]}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Status</span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[product.status]}`}>
                    {ProductStatusLabels[product.status]}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Brand</span>
                  <span className="text-sm font-medium text-gray-900">{product.brand?.name ?? '—'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Category</span>
                  <span className="text-sm font-medium text-gray-900">{product.category?.name ?? '—'}</span>
                </div>
                {product.description && (
                  <div className="pt-2 border-t border-gray-100">
                    <p className="text-sm text-gray-500">{product.description}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Specifications */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <i className="fa-solid fa-ruler-combined text-indigo-500" />
              Specifications
            </h2>
            {specifications && Object.keys(specifications).length > 0 ? (
              <div className="space-y-2">
                {Object.entries(specifications).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                    <span className="text-sm text-gray-500 capitalize">{key.replace(/_/g, ' ')}</span>
                    <span className="text-sm font-medium text-gray-900 font-mono">{String(value)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 italic">No specifications recorded</p>
            )}
          </div>
        </div>

      </div>

      {/* Reorder Levels Modal */}
      <Modal
        isOpen={!!reorderRecord}
        onClose={() => setReorderRecord(null)}
        title="Set Reorder Levels"
        leftButton={{ text: 'Cancel', onClick: () => setReorderRecord(null), variant: 'secondary' }}
        rightButton={{ text: isSavingReorder ? 'Saving...' : 'Save', onClick: handleSaveReorderLevels, variant: 'primary' }}
      >
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-sm font-medium text-gray-900">{variantData.variantName}</p>
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
        onClose={() => setAddStockRecord(null)}
        title="Add Stock"
        leftButton={{ text: 'Cancel', onClick: () => setAddStockRecord(null), variant: 'secondary' }}
        rightButton={{ text: isAddingStock ? 'Adding...' : 'Add Stock', onClick: handleAddStock, variant: 'primary' }}
      >
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-sm font-medium text-gray-900">{variantData.variantName}</p>
            <p className="text-xs text-gray-500 mt-1">
              <i className="fa-solid fa-warehouse mr-1" />
              {addStockRecord?.warehouse?.name}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
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
                Cost / Unit <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                value={stockCost}
                onChange={(e) => setStockCost(e.target.value)}
                placeholder="e.g. 15000"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-transparent"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Supplier ID <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="1"
              value={stockSupplierId}
              onChange={(e) => setStockSupplierId(e.target.value)}
              placeholder="Enter supplier ID"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Batch Number</label>
            <input
              type="text"
              value={stockBatchNum}
              onChange={(e) => setStockBatchNum(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 font-mono focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Expiry Date <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              type="date"
              value={stockExpiry}
              onChange={(e) => setStockExpiry(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-transparent"
            />
          </div>
        </div>
      </Modal>
      {/* Add to Warehouse Modal */}
      <Modal
        isOpen={addToWarehouseOpen}
        onClose={() => setAddToWarehouseOpen(false)}
        title="Add to Warehouse"
        leftButton={{ text: 'Cancel', onClick: () => setAddToWarehouseOpen(false), variant: 'secondary' }}
        rightButton={{ text: isAddingStock ? 'Adding...' : 'Add', onClick: handleAddToWarehouse, variant: 'primary' }}
      >
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-sm font-medium text-gray-900">{variantData?.variantName}</p>
            <p className="text-xs font-mono text-gray-400 mt-0.5">{variantData?.sku}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Warehouse <span className="text-red-500">*</span>
            </label>
            <select
              value={newWarehouseId}
              onChange={(e) => setNewWarehouseId(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 bg-white"
            >
              <option value="">Select a warehouse</option>
              {availableWarehouses.map((w) => (
                <option key={w.id} value={w.id}>{w.name} — {w.city}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantity <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                value={newStockQty}
                onChange={(e) => setNewStockQty(e.target.value)}
                placeholder="e.g. 50"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cost / Unit <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                value={newStockCost}
                onChange={(e) => setNewStockCost(e.target.value)}
                placeholder="e.g. 15000"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-transparent"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Supplier ID <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="1"
              value={newStockSupplierId}
              onChange={(e) => setNewStockSupplierId(e.target.value)}
              placeholder="Enter supplier ID"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Batch Number</label>
            <input
              type="text"
              value={newStockBatchNum}
              onChange={(e) => setNewStockBatchNum(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 font-mono focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Expiry Date <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              type="date"
              value={newStockExpiry}
              onChange={(e) => setNewStockExpiry(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-transparent"
            />
          </div>
        </div>
      </Modal>
    </Layout>
  );
}

export default VariantProfile;
