import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import Modal from '../../components/ui/Modal';
import usePageTitle from '../../hooks/usePageTitle';
import { ProductType, ProductTypeLabels, ProductStatus, ProductStatusLabels } from '../../types/product';
import { useGetInventoryQuery, useSetReorderLevelsMutation, useAdjustInventoryMutation, useAddStockMutation } from '../../store/api/inventoryApi';
import { useGetProductQuery, useUpdateProductVariantMutation } from '../../store/api/productsApi';
import { useGetWarehousesQuery } from '../../store/api/warehousesApi';
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
  5: 'Garage',
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

  const { data: inventoryRecords = [], isLoading: inventoryLoading } = useGetInventoryQuery({ variantId });
  const variantData = inventoryRecords[0]?.variant ?? null;
  const productId = variantData?.productId;

  const { data: product, isLoading: productLoading } = useGetProductQuery(
    { id: productId!, includeRelations: true },
    { skip: !productId }
  );

  const { data: allWarehouses = [] } = useGetWarehousesQuery();

  const [setReorderLevels, { isLoading: isSavingReorder }] = useSetReorderLevelsMutation();
  const [adjustInventory, { isLoading: isAdjusting }] = useAdjustInventoryMutation();
  const [addStock, { isLoading: isAddingStock }] = useAddStockMutation();
  const [updateVariant, { isLoading: isUpdatingPrice }] = useUpdateProductVariantMutation();

  // Edit price
  const [editPriceOpen, setEditPriceOpen] = useState(false);
  const [newPrice, setNewPrice] = useState('');

  // Reorder levels
  const [reorderRecord, setReorderRecord] = useState<InventoryRecord | null>(null);
  const [minQty, setMinQty] = useState('');
  const [maxQty, setMaxQty] = useState('');

  // Add stock (existing warehouse row)
  const [addStockRecord, setAddStockRecord] = useState<InventoryRecord | null>(null);
  const [stockQty, setStockQty] = useState('');
  const [stockNotes, setStockNotes] = useState('');

  // Add to new warehouse
  const [addToWarehouseOpen, setAddToWarehouseOpen] = useState(false);
  const [newWarehouseId, setNewWarehouseId] = useState('');
  const [newStockQty, setNewStockQty] = useState('');
  const [newStockNotes, setNewStockNotes] = useState('');

  // Adjust stock
  const [adjustRecord, setAdjustRecord] = useState<InventoryRecord | null>(null);
  const [adjustType, setAdjustType] = useState<'add' | 'remove'>('add');
  const [adjustQty, setAdjustQty] = useState('');
  const [adjustReason, setAdjustReason] = useState('Physical count correction');
  const [adjustNotes, setAdjustNotes] = useState('');

  const existingWarehouseIds = new Set(inventoryRecords.map((r) => r.warehouseId));
  const availableWarehouses = allWarehouses.filter((w) => !existingWarehouseIds.has(w.id));

  const totalQuantity = inventoryRecords.reduce((s, r) => s + r.totalQuantity, 0);
  const availableQuantity = inventoryRecords.reduce((s, r) => s + r.availableQuantity, 0);

  const handleSaveReorderLevels = async () => {
    if (!reorderRecord) return;
    const min = Number(minQty);
    if (!minQty || isNaN(min) || min < 0) { showToast('error', 'Minimum quantity must be a valid number'); return; }
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

  const handleAddStock = async () => {
    if (!addStockRecord) return;
    const qty = Number(stockQty);
    if (!stockQty || qty < 1) { showToast('error', 'Quantity must be at least 1'); return; }
    try {
      await addStock({
        variantId: addStockRecord.variantId,
        warehouseId: addStockRecord.warehouseId,
        quantity: qty,
        notes: stockNotes.trim() || undefined,
      }).unwrap();
      showToast('success', `${qty} units added to stock`);
      setAddStockRecord(null);
      setStockQty('');
      setStockNotes('');
    } catch {
      showToast('error', 'Failed to add stock');
    }
  };

  const handleAddToWarehouse = async () => {
    const warehouseId = Number(newWarehouseId);
    const qty = Number(newStockQty);
    if (!newWarehouseId || !warehouseId) { showToast('error', 'Please select a warehouse'); return; }
    if (!newStockQty || qty < 1) { showToast('error', 'Quantity must be at least 1'); return; }
    try {
      await addStock({
        variantId,
        warehouseId,
        quantity: qty,
        notes: newStockNotes.trim() || undefined,
      }).unwrap();
      showToast('success', `${qty} units added to warehouse`);
      setAddToWarehouseOpen(false);
      setNewWarehouseId('');
      setNewStockQty('');
      setNewStockNotes('');
    } catch {
      showToast('error', 'Failed to add stock to warehouse');
    }
  };

  const handleAdjustStock = async () => {
    if (!adjustRecord) return;
    const qty = Number(adjustQty);
    if (!adjustQty || isNaN(qty) || qty < 1) { showToast('error', 'Quantity must be at least 1'); return; }
    const adjustmentQuantity = adjustType === 'add' ? qty : -qty;
    try {
      await adjustInventory({
        variantId: adjustRecord.variantId,
        warehouseId: adjustRecord.warehouseId,
        adjustmentQuantity,
        notes: adjustNotes.trim() || adjustReason,
      }).unwrap();
      showToast('success', `Stock ${adjustType === 'add' ? 'increased' : 'reduced'} by ${qty}`);
      setAdjustRecord(null);
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'data' in err
        ? (err as { data?: { message?: string } }).data?.message
        : undefined;
      showToast('error', msg ?? 'Failed to adjust stock');
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
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-gray-900">
                {variantData.sellingPrice != null ? formatPrice(variantData.sellingPrice) : '—'}
              </span>
              <button
                onClick={() => { setNewPrice(variantData.sellingPrice?.toString() ?? ''); setEditPriceOpen(true); }}
                className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                title="Edit price"
              >
                <i className="fa-solid fa-pen text-xs" />
              </button>
              <Link
                to={`/variants/${variantId}/activities`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium ml-2"
              >
                <i className="fa-solid fa-clock-rotate-left" />
                <span className="hidden sm:inline">View Activities</span>
              </Link>
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
                onClick={() => { setAddToWarehouseOpen(true); setNewWarehouseId(''); setNewStockQty(''); setNewStockNotes(''); }}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors text-sm font-medium cursor-pointer"
              >
                <i className="fa-solid fa-plus" />
                Add to Warehouse
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="text-center p-3 sm:p-4 bg-green-50 rounded-lg">
              <p className="text-lg sm:text-2xl font-bold text-green-700">{availableQuantity}</p>
              <p className="text-xs text-green-600 mt-1">Available</p>
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
                      <td className="py-3 pr-4 hidden md:table-cell text-gray-700">{record.totalQuantity}</td>
                      <td className="py-3 pr-4 hidden md:table-cell text-gray-500">{record.minimumQuantity}</td>
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2 whitespace-nowrap">
                          <button
                            onClick={() => { setAddStockRecord(record); setStockQty(''); setStockNotes(''); }}
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
                          <button
                            onClick={() => { setAdjustRecord(record); setAdjustType('add'); setAdjustQty(''); setAdjustReason('Physical count correction'); setAdjustNotes(''); }}
                            className="text-xs px-2.5 py-1 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 font-medium cursor-pointer"
                          >
                            <i className="fa-solid fa-arrows-up-down mr-1" />
                            Adjust
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

      {/* Edit Price Modal */}
      <Modal
        isOpen={editPriceOpen}
        onClose={() => setEditPriceOpen(false)}
        title="Edit Selling Price"
        leftButton={{ text: 'Cancel', onClick: () => setEditPriceOpen(false), variant: 'secondary' }}
        rightButton={{
          text: isUpdatingPrice ? 'Saving…' : 'Save Price',
          onClick: async () => {
            const price = Number(newPrice);
            if (!newPrice || isNaN(price) || price < 0) { showToast('error', 'Enter a valid price'); return; }
            try {
              await updateVariant({ productId: productId!, variantId, sellingPrice: price }).unwrap();
              showToast('success', 'Price updated');
              setEditPriceOpen(false);
            } catch {
              showToast('error', 'Failed to update price');
            }
          },
          variant: 'primary',
        }}
      >
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-sm font-medium text-gray-900">{variantData?.variantName}</p>
            <p className="text-xs font-mono text-gray-400 mt-0.5">{variantData?.sku}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Selling Price (₦) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={newPrice ? Number(newPrice).toLocaleString('en-NG') : ''}
              onChange={(e) => {
                const raw = e.target.value.replace(/,/g, '');
                if (raw === '' || !isNaN(Number(raw))) setNewPrice(raw);
              }}
              placeholder="e.g. 25000"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-transparent"
              autoFocus
            />
          </div>
        </div>
      </Modal>

      {/* Reorder Levels Modal */}
      <Modal
        isOpen={!!reorderRecord}
        onClose={() => setReorderRecord(null)}
        title="Set Reorder Levels"
        leftButton={{ text: 'Cancel', onClick: () => setReorderRecord(null), variant: 'secondary' }}
        rightButton={{ text: isSavingReorder ? 'Saving…' : 'Save', onClick: handleSaveReorderLevels, variant: 'primary' }}
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
            <input type="number" min="0" value={minQty} onChange={(e) => setMinQty(e.target.value)} placeholder="e.g. 10"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-transparent" />
            <p className="text-xs text-gray-400 mt-1">Alert shown when stock falls below this level</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Maximum Quantity <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input type="number" min="0" value={maxQty} onChange={(e) => setMaxQty(e.target.value)} placeholder="e.g. 100"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-transparent" />
          </div>
        </div>
      </Modal>

      {/* Add Stock Modal */}
      <Modal
        isOpen={!!addStockRecord}
        onClose={() => setAddStockRecord(null)}
        title="Add Stock"
        leftButton={{ text: 'Cancel', onClick: () => setAddStockRecord(null), variant: 'secondary' }}
        rightButton={{ text: isAddingStock ? 'Adding…' : 'Add Stock', onClick: handleAddStock, variant: 'primary' }}
      >
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-sm font-medium text-gray-900">{variantData.variantName}</p>
            <p className="text-xs text-gray-500 mt-1">
              <i className="fa-solid fa-warehouse mr-1" />
              {addStockRecord?.warehouse?.name}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quantity <span className="text-red-500">*</span>
            </label>
            <input type="number" min="1" value={stockQty} onChange={(e) => setStockQty(e.target.value)} placeholder="e.g. 50"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-transparent" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input type="text" value={stockNotes} onChange={(e) => setStockNotes(e.target.value)} placeholder="e.g. stock received from supplier"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-transparent" />
          </div>
        </div>
      </Modal>

      {/* Add to Warehouse Modal */}
      <Modal
        isOpen={addToWarehouseOpen}
        onClose={() => setAddToWarehouseOpen(false)}
        title="Add to Warehouse"
        leftButton={{ text: 'Cancel', onClick: () => setAddToWarehouseOpen(false), variant: 'secondary' }}
        rightButton={{ text: isAddingStock ? 'Adding…' : 'Add', onClick: handleAddToWarehouse, variant: 'primary' }}
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
            <select value={newWarehouseId} onChange={(e) => setNewWarehouseId(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 bg-white">
              <option value="">Select a warehouse</option>
              {availableWarehouses.map((w) => (
                <option key={w.id} value={w.id}>{w.name} — {w.city}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quantity <span className="text-red-500">*</span>
            </label>
            <input type="number" min="1" value={newStockQty} onChange={(e) => setNewStockQty(e.target.value)} placeholder="e.g. 50"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-transparent" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input type="text" value={newStockNotes} onChange={(e) => setNewStockNotes(e.target.value)} placeholder="e.g. initial stock"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-transparent" />
          </div>
        </div>
      </Modal>

      {/* Adjust Stock Modal */}
      <Modal
        isOpen={!!adjustRecord}
        onClose={() => setAdjustRecord(null)}
        title="Adjust Stock"
        leftButton={{ text: 'Cancel', onClick: () => setAdjustRecord(null), variant: 'secondary' }}
        rightButton={{ text: isAdjusting ? 'Saving…' : 'Save Adjustment', onClick: handleAdjustStock, variant: 'primary' }}
      >
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-sm font-medium text-gray-900">{variantData?.variantName}</p>
            <p className="text-xs text-gray-500 mt-1">
              <i className="fa-solid fa-warehouse mr-1" />
              {adjustRecord?.warehouse?.name}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Current stock: <span className="font-semibold text-gray-700">{adjustRecord?.totalQuantity ?? 0}</span>
            </p>
          </div>
          <div className="flex rounded-lg border border-gray-200 overflow-hidden">
            <button onClick={() => setAdjustType('add')}
              className={`flex-1 py-2.5 text-sm font-medium transition-colors cursor-pointer ${adjustType === 'add' ? 'bg-green-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
              <i className="fa-solid fa-plus mr-1.5" />Add
            </button>
            <button onClick={() => setAdjustType('remove')}
              className={`flex-1 py-2.5 text-sm font-medium transition-colors cursor-pointer ${adjustType === 'remove' ? 'bg-red-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
              <i className="fa-solid fa-minus mr-1.5" />Remove
            </button>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quantity <span className="text-red-500">*</span>
            </label>
            <input type="number" min="1" value={adjustQty} onChange={(e) => setAdjustQty(e.target.value)} placeholder="e.g. 5"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-transparent" />
            {adjustQty && !isNaN(Number(adjustQty)) && Number(adjustQty) > 0 && (
              <p className="text-xs mt-1.5 font-medium">
                {adjustType === 'add' ? (
                  <span className="text-green-600">New total: {(adjustRecord?.totalQuantity ?? 0) + Number(adjustQty)}</span>
                ) : (
                  <span className={(adjustRecord?.totalQuantity ?? 0) - Number(adjustQty) < 0 ? 'text-red-600' : 'text-gray-600'}>
                    New total: {(adjustRecord?.totalQuantity ?? 0) - Number(adjustQty)}
                    {(adjustRecord?.totalQuantity ?? 0) - Number(adjustQty) < 0 && ' (will fail — not enough stock)'}
                  </span>
                )}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
            <select value={adjustReason} onChange={(e) => setAdjustReason(e.target.value)}
              className="w-full appearance-none px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 bg-white cursor-pointer">
              <option>Physical count correction</option>
              <option>Damaged / Write-off</option>
              <option>Found stock</option>
              <option>Theft / Loss</option>
              <option>Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea value={adjustNotes} onChange={(e) => setAdjustNotes(e.target.value)} rows={2}
              placeholder="Additional details…"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 resize-none" />
          </div>
        </div>
      </Modal>
    </Layout>
  );
}

export default VariantProfile;
