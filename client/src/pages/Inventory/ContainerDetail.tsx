import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import {
  useGetContainerQuery,
  useAddContainerItemMutation,
  useRemoveContainerItemMutation,
  useOffloadContainerMutation,
} from '../../store/api/inventoryBatchApi';
import { useGetProductsQuery } from '../../store/api/productsApi';
import { useGetWarehousesQuery } from '../../store/api/warehousesApi';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';

function ContainerDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { can } = useAuth();
  const canAdjust = can('inventory:adjust');
  const batchId = Number(id);

  const { data: container, isLoading } = useGetContainerQuery(batchId);
  const { data: productsData } = useGetProductsQuery({ includeRelations: true });
  const { data: warehouses = [] } = useGetWarehousesQuery({});
  const [addItem, { isLoading: addingItem }] = useAddContainerItemMutation();
  const [removeItem] = useRemoveContainerItemMutation();
  const [offload, { isLoading: offloading }] = useOffloadContainerMutation();

  const [showAddItem, setShowAddItem] = useState(false);
  const [showOffloadConfirm, setShowOffloadConfirm] = useState(false);
  const [confirmRemoveItem, setConfirmRemoveItem] = useState<{ id: number; name: string } | null>(null);
  const [addForm, setAddForm] = useState({ variantId: 0, warehouseId: 0, quantity: 1 });

  const allVariants = (productsData ?? []).flatMap((p: any) => (p.variants ?? []).map((v: any) => ({ ...v, productName: p.name })));

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.variantId || !addForm.warehouseId || addForm.quantity < 1) return;
    try {
      await addItem({ batchId, variantId: addForm.variantId, warehouseId: addForm.warehouseId, quantity: addForm.quantity }).unwrap();
      showToast('success', 'Item added to container');
      setShowAddItem(false);
      setAddForm({ variantId: 0, warehouseId: 0, quantity: 1 });
    } catch {
      showToast('error', 'Failed to add item');
    }
  };

  const handleRemoveItem = async () => {
    if (!confirmRemoveItem) return;
    try {
      await removeItem({ batchId, itemId: confirmRemoveItem.id }).unwrap();
      showToast('success', 'Item removed');
      setConfirmRemoveItem(null);
    } catch {
      showToast('error', 'Failed to remove item');
      setConfirmRemoveItem(null);
    }
  };

  const handleOffload = async () => {
    try {
      await offload(batchId).unwrap();
      showToast('success', 'Container offloaded — stock has been added to inventory');
      setShowOffloadConfirm(false);
    } catch (err: any) {
      showToast('error', err?.data?.message ?? 'Failed to offload container');
      setShowOffloadConfirm(false);
    }
  };

  if (isLoading) {
    return <Layout><div className="py-16 text-center text-gray-500">Loading container...</div></Layout>;
  }

  if (!container) {
    return (
      <Layout>
        <div className="py-16 text-center">
          <p className="text-gray-500">Container not found</p>
          <Link to="/inventory/containers" className="mt-4 inline-block text-indigo-600 text-sm hover:underline">← Back to Containers</Link>
        </div>
      </Layout>
    );
  }

  const items = container.items ?? [];

  return (
    <Layout>
    <div className="space-y-6">
      <button
        onClick={() => navigate('/inventory/containers')}
        className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors text-sm cursor-pointer"
      >
        <i className="fa-solid fa-arrow-left" />
        <span>Back to Containers</span>
      </button>

      {/* Breadcrumb & Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <Link to="/inventory" className="hover:text-indigo-600">Inventory</Link>
            <i className="fa-solid fa-chevron-right text-xs" />
            <Link to="/inventory/containers" className="hover:text-indigo-600">Containers</Link>
            <i className="fa-solid fa-chevron-right text-xs" />
            <span>{container.batchNumber}</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{container.batchNumber}</h1>
            {container.isOffloaded ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                <i className="fa-solid fa-circle-check" /> Offloaded
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                <i className="fa-solid fa-clock" /> Pending Offload
              </span>
            )}
          </div>
        </div>

        {!container.isOffloaded && canAdjust && (
          <button
            onClick={() => setShowOffloadConfirm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors shadow-sm"
          >
            <i className="fa-solid fa-truck-ramp-box" />
            Mark as Offloaded
          </button>
        )}
      </div>

      {/* Info Card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 grid grid-cols-2 md:grid-cols-3 gap-4">
        <div>
          <p className="text-xs text-gray-400 uppercase font-medium mb-1">Arrived</p>
          <p className="text-sm font-medium text-gray-800">{new Date(container.arrivedAt).toLocaleDateString()}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400 uppercase font-medium mb-1">Items</p>
          <p className="text-sm font-medium text-gray-800">{items.length}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400 uppercase font-medium mb-1">Total Units</p>
          <p className="text-sm font-medium text-gray-800">{items.reduce((s, i) => s + i.quantity, 0).toLocaleString()}</p>
        </div>
        {container.notes && (
          <div className="col-span-2 md:col-span-4">
            <p className="text-xs text-gray-400 uppercase font-medium mb-1">Notes</p>
            <p className="text-sm text-gray-700">{container.notes}</p>
          </div>
        )}
        {container.isOffloaded && container.offloadedAt && (
          <div className="col-span-2 md:col-span-4">
            <p className="text-xs text-gray-400 uppercase font-medium mb-1">Offloaded On</p>
            <p className="text-sm text-gray-700">{new Date(container.offloadedAt).toLocaleString()}</p>
          </div>
        )}
      </div>

      {/* Items */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Contents</h2>
          {!container.isOffloaded && canAdjust && (
            <button
              onClick={() => setShowAddItem(true)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
            >
              <i className="fa-solid fa-plus" /> Add Variant
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <i className="fa-solid fa-box-open text-3xl text-gray-200 mb-2 block" />
            <p className="text-gray-500 text-sm">No variants added yet</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Variant</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">SKU</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Destination</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">Quantity</th>
                {!container.isOffloaded && <th className="w-12 px-6 py-3" />}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/50">
                  <td className="px-6 py-4">
                    <Link to={`/variants/${item.variantId}`} className="font-medium text-gray-900 hover:text-indigo-600">
                      {item.variant?.variantName ?? '—'}
                    </Link>
                  </td>
                  <td className="px-6 py-4 hidden sm:table-cell">
                    <span className="text-xs font-mono text-gray-400">{item.variant?.sku ?? '—'}</span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-700">{item.warehouse?.name ?? '—'}</p>
                    {item.warehouse && <p className="text-xs text-gray-400">{item.warehouse.city}, {item.warehouse.state}</p>}
                  </td>
                  <td className="px-6 py-4 text-right font-semibold text-gray-800">{item.quantity.toLocaleString()}</td>
                  {!container.isOffloaded && (
                    <td className="px-4 py-4">
                      {canAdjust && (
                        <button
                          onClick={() => setConfirmRemoveItem({ id: item.id, name: item.variant?.variantName ?? `Item #${item.id}` })}
                          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-500 transition-colors"
                        >
                          <i className="fa-solid fa-trash text-sm" />
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Item Modal */}
      {showAddItem && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Add Variant</h2>
              <button onClick={() => setShowAddItem(false)} className="text-gray-400 hover:text-gray-600">
                <i className="fa-solid fa-xmark text-lg" />
              </button>
            </div>
            <form onSubmit={handleAddItem} className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Variant</label>
                <select
                  value={addForm.variantId || ''}
                  onChange={(e) => setAddForm({ ...addForm, variantId: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 bg-white"
                  required
                >
                  <option value="">Select variant</option>
                  {allVariants.map((v: any) => (
                    <option key={v.id} value={v.id}>{v.productName} — {v.variantName} ({v.sku})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Destination warehouse</label>
                <select
                  value={addForm.warehouseId || ''}
                  onChange={(e) => setAddForm({ ...addForm, warehouseId: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 bg-white"
                  required
                >
                  <option value="">Select warehouse</option>
                  {warehouses.map((w) => (
                    <option key={w.id} value={w.id}>{w.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                <input
                  type="number"
                  min={1}
                  value={addForm.quantity}
                  onChange={(e) => setAddForm({ ...addForm, quantity: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  required
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAddItem(false)} className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" disabled={addingItem} className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50">
                  {addingItem ? 'Adding...' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Remove Item Confirmation Modal */}
      {confirmRemoveItem && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm">
            <div className="px-6 py-5 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                  <i className="fa-solid fa-trash text-red-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">Remove Item</h2>
              </div>
            </div>
            <div className="px-6 py-4">
              <p className="text-sm text-gray-600">
                Are you sure you want to remove <span className="font-medium text-gray-900">{confirmRemoveItem.name}</span> from this container? This cannot be undone.
              </p>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
              <button
                onClick={() => setConfirmRemoveItem(null)}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleRemoveItem}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Offload Confirmation Modal */}
      {showOffloadConfirm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="px-6 py-5 border-b border-gray-100">
              <div className="flex items-center gap-3 mb-1">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <i className="fa-solid fa-truck-ramp-box text-green-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">Confirm Offload</h2>
              </div>
              <p className="text-sm text-gray-500 ml-13">This will add the following stock to inventory:</p>
            </div>

            <div className="px-6 py-4 max-h-64 overflow-y-auto divide-y divide-gray-100">
              {items.length === 0 ? (
                <p className="text-sm text-gray-500 py-2">No items in this container.</p>
              ) : (
                items.map((item) => (
                  <div key={item.id} className="py-2.5 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{item.variant?.variantName ?? '—'}</p>
                      <p className="text-xs text-gray-400">→ {item.warehouse?.name ?? 'Unassigned warehouse'}</p>
                    </div>
                    <span className="text-sm font-semibold text-green-700 flex-shrink-0">+{item.quantity.toLocaleString()} units</span>
                  </div>
                ))
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
              <button onClick={() => setShowOffloadConfirm(false)} className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                Cancel
              </button>
              <button
                onClick={handleOffload}
                disabled={offloading || items.length === 0}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                {offloading ? 'Offloading...' : 'Confirm Offload'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </Layout>
  );
}

export default ContainerDetail;
