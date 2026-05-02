import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import { useGetProductsQuery } from '../../store/api/productsApi';
import { useGetWarehousesQuery } from '../../store/api/warehousesApi';
import { useCreateContainerMutation } from '../../store/api/inventoryBatchApi';
import { useToast } from '../../context/ToastContext';
import type { Product, ProductVariant } from '../../types/product';

interface ContainerLineItem {
  key: string;
  variantId: number;
  variantName: string;
  sku: string;
  productName: string;
  warehouseId: number;
  quantity: number;
}

function CreateContainer() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [batchNumber, setBatchNumber] = useState('');
  const [arrivedAt, setArrivedAt] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<ContainerLineItem[]>([]);
  const [variantSearch, setVariantSearch] = useState('');
  const [showVariantSearch, setShowVariantSearch] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const { data: products = [] } = useGetProductsQuery({ includeRelations: true });
  const { data: warehouses = [] } = useGetWarehousesQuery({});
  const [createContainer, { isLoading }] = useCreateContainerMutation();

  const allVariants: (ProductVariant & { productName: string })[] = useMemo(() => {
    return products.flatMap((p: Product) =>
      (p.variants ?? []).map((v) => ({ ...v, productName: p.name }))
    );
  }, [products]);

  const filteredVariants = useMemo(() => {
    if (!variantSearch.trim()) return allVariants.slice(0, 20);
    const q = variantSearch.toLowerCase();
    return allVariants
      .filter(
        (v) =>
          v.variantName.toLowerCase().includes(q) ||
          v.sku.toLowerCase().includes(q) ||
          v.productName.toLowerCase().includes(q)
      )
      .slice(0, 20);
  }, [allVariants, variantSearch]);

  const addItem = (variant: ProductVariant & { productName: string }) => {
    setItems((prev) => [
      ...prev,
      {
        key: `${variant.id}-${Date.now()}-${Math.random()}`,
        variantId: variant.id,
        variantName: variant.variantName,
        sku: variant.sku,
        productName: variant.productName,
        warehouseId: 0,
        quantity: 1,
      },
    ]);
    setVariantSearch('');
    setShowVariantSearch(false);
  };

  const removeItem = (key: string) => {
    setItems((prev) => prev.filter((i) => i.key !== key));
  };

  const updateItem = (key: string, patch: Partial<ContainerLineItem>) => {
    setItems((prev) => prev.map((i) => (i.key === key ? { ...i, ...patch } : i)));
  };

  const totalUnits = items.reduce((s, i) => s + i.quantity, 0);

  const handleSubmit = async () => {
    setFormError(null);

    if (!batchNumber.trim()) {
      setFormError('Container number is required.');
      return;
    }
    if (!arrivedAt) {
      setFormError('Please pick an arrival date.');
      return;
    }
    if (items.length === 0) {
      setFormError('Add at least one variant to the container.');
      return;
    }
    const noWarehouse = items.find((i) => !i.warehouseId);
    if (noWarehouse) {
      setFormError(`Pick a destination warehouse for "${noWarehouse.variantName}".`);
      return;
    }
    const badQty = items.find((i) => i.quantity < 1);
    if (badQty) {
      setFormError(`"${badQty.variantName}" has an invalid quantity.`);
      return;
    }

    try {
      const result = await createContainer({
        batchNumber: batchNumber.trim(),
        arrivedAt,
        notes: notes.trim() || undefined,
        items: items.map((i) => ({
          variantId: i.variantId,
          warehouseId: i.warehouseId,
          quantity: i.quantity,
        })),
      }).unwrap();
      showToast('success', 'Container created');
      navigate(`/inventory/containers/${result.id}`);
    } catch (err: any) {
      setFormError(err?.data?.message ?? 'Failed to create container.');
    }
  };

  return (
    <Layout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/inventory/containers')}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 cursor-pointer"
          >
            <i className="fa-solid fa-arrow-left" />
          </button>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">New Container</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left: Items */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <h2 className="text-sm font-semibold text-gray-700 mb-3">Add Items</h2>
              <div className="relative">
                <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search variant by name or SKU..."
                  value={variantSearch}
                  onChange={(e) => {
                    setVariantSearch(e.target.value);
                    setShowVariantSearch(true);
                  }}
                  onFocus={() => setShowVariantSearch(true)}
                  onBlur={() => setTimeout(() => setShowVariantSearch(false), 150)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-transparent"
                />
                {showVariantSearch && filteredVariants.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
                    {filteredVariants.map((v) => (
                      <button
                        key={v.id}
                        onMouseDown={() => addItem(v)}
                        className="w-full px-4 py-3 text-left hover:bg-indigo-50 flex items-center justify-between gap-2 border-b border-gray-50 last:border-0 cursor-pointer"
                      >
                        <div>
                          <p className="text-sm font-medium text-gray-900">{v.variantName}</p>
                          <p className="text-xs text-gray-500 font-mono">{v.sku}</p>
                          <p className="text-xs text-gray-400">{v.productName}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-700">
                  Contents ({items.length} item{items.length !== 1 ? 's' : ''})
                </h2>
                <span className="text-xs text-gray-500">{totalUnits.toLocaleString()} total units</span>
              </div>
              {items.length === 0 ? (
                <div className="px-4 py-12 text-center text-gray-400">
                  <i className="fa-solid fa-box-open text-3xl mb-2" />
                  <p className="text-sm">No items added yet</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {items.map((item) => (
                    <div key={item.key} className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{item.variantName}</p>
                          <p className="text-xs font-mono text-gray-400 mt-0.5">{item.sku}</p>
                          <p className="text-xs text-gray-400">{item.productName}</p>
                        </div>
                        <button
                          onClick={() => removeItem(item.key)}
                          className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 cursor-pointer"
                        >
                          <i className="fa-solid fa-xmark text-xs" />
                        </button>
                      </div>
                      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Destination warehouse</label>
                          <select
                            value={item.warehouseId || ''}
                            onChange={(e) => updateItem(item.key, { warehouseId: Number(e.target.value) })}
                            className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 bg-white"
                          >
                            <option value="">Select warehouse</option>
                            {warehouses.map((w) => (
                              <option key={w.id} value={w.id}>{w.name}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Quantity</label>
                          <input
                            type="number"
                            min={1}
                            value={item.quantity}
                            onChange={(e) => updateItem(item.key, { quantity: Math.max(1, Number(e.target.value)) })}
                            className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: Container Details */}
          <div className="space-y-4">
            {formError && (
              <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
                <i className="fa-solid fa-circle-exclamation mt-0.5 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 space-y-4">
              <h2 className="text-sm font-semibold text-gray-700">Container Details</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Container Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. CON-2024-047"
                  value={batchNumber}
                  onChange={(e) => setBatchNumber(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Arrival Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={arrivedAt}
                  onChange={(e) => setArrivedAt(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 resize-none"
                />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <h2 className="text-sm font-semibold text-gray-700 mb-3">Summary</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Items</span>
                  <span>{items.length}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Total units</span>
                  <span>{totalUnits.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={isLoading || items.length === 0}
              className="w-full py-3 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  Creating...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-check" />
                  Create Container
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default CreateContainer;
