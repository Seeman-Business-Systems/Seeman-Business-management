import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import Modal from '../../components/ui/Modal';
import usePageTitle from '../../hooks/usePageTitle';
import { useGetSupplyQuery, useFulfilSupplyMutation, useCancelSupplyMutation, useAssignSupplyItemWarehouseMutation } from '../../store/api/suppliesApi';
import { useGetWarehousesQuery } from '../../store/api/warehousesApi';
import type { SupplyStatus } from '../../types/supply';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';

const statusStyles: Record<SupplyStatus, string> = {
  DRAFT:      'bg-yellow-100 text-yellow-800',
  FULFILLED:  'bg-green-100 text-green-800',
  CANCELLED:  'bg-red-100 text-red-800',
};

const statusIcons: Record<SupplyStatus, string> = {
  DRAFT:      'fa-clock',
  FULFILLED:  'fa-circle-check',
  CANCELLED:  'fa-ban',
};

function SupplyDetail() {
  usePageTitle('Supply Details');
  const { id } = useParams<{ id: string }>();
  const supplyId = id ? Number(id) : undefined;

  const { showToast } = useToast();
  const { can } = useAuth();
  const canFulfil = can('supply:fulfil');
  const canCancel = can('supply:cancel');

  const { data: supply, isLoading, error } = useGetSupplyQuery(supplyId!, { skip: !supplyId });
  const [fulfilSupply, { isLoading: isFulfilling }] = useFulfilSupplyMutation();
  const [cancelSupply, { isLoading: isCancelling }] = useCancelSupplyMutation();
  const [assignWarehouse, { isLoading: isAssigning }] = useAssignSupplyItemWarehouseMutation();
  const { data: warehouses = [] } = useGetWarehousesQuery();

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showFulfilModal, setShowFulfilModal] = useState(false);
  const [fulfilNotes, setFulfilNotes] = useState('');

  const handleFulfil = async () => {
    if (!supplyId) return;
    try {
      await fulfilSupply({ id: supplyId, notes: fulfilNotes || undefined }).unwrap();
      setShowFulfilModal(false);
      setFulfilNotes('');
      showToast('success', 'Supply marked as fulfilled');
      if (supply?.saleId) {
        showToast('info', `Sale ${supply.saleNumber} has been fulfilled automatically`);
      }
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'data' in err
        ? (err as { data?: { message?: string } }).data?.message
        : undefined;
      showToast('error', msg ?? 'Failed to fulfil supply');
    }
  };

  const handleCancel = async () => {
    if (!supplyId) return;
    try {
      await cancelSupply(supplyId).unwrap();
      setShowCancelModal(false);
      showToast('success', 'Supply cancelled');
    } catch {
      showToast('error', 'Failed to cancel supply');
    }
  };

  const formatDate = (s: string) =>
    new Date(s).toLocaleString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
        </div>
      </Layout>
    );
  }

  if (error || !supply) {
    return (
      <Layout>
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
            <i className="fa-solid fa-truck-fast text-2xl text-red-500" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Supply not found</h2>
          <Link to="/supplies" className="inline-flex items-center gap-2 mt-4 text-indigo-600 hover:text-indigo-800">
            <i className="fa-solid fa-arrow-left" /> Back to Supplies
          </Link>
        </div>
      </Layout>
    );
  }

  const totalItems = supply.items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <>
      <Layout>
        <div className="space-y-6">
          <Link to="/supplies" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors">
            <i className="fa-solid fa-arrow-left" />
            <span>Back to Supplies</span>
          </Link>

          {/* Header */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
                  <i className="fa-solid fa-truck-fast text-2xl text-indigo-600" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900 font-mono">
                    {supply.supplyNumber}
                  </h1>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[supply.status]}`}>
                      <i className={`fa-solid ${statusIcons[supply.status]}`} />
                      {supply.status.charAt(0) + supply.status.slice(1).toLowerCase()}
                    </span>
                    <span className="text-sm text-gray-500">
                      {totalItems} item{totalItems !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {supply.status === 'DRAFT' && (
                  <>
                    {canFulfil && (
                      <button
                        onClick={() => setShowFulfilModal(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                      >
                        <i className="fa-solid fa-circle-check" />
                        Mark Fulfilled
                      </button>
                    )}
                    {canCancel && (
                      <button
                        onClick={() => setShowCancelModal(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                      >
                        <i className="fa-solid fa-ban" />
                        Cancel
                      </button>
                    )}
                  </>
                )}
                <Link
                  to={`/sales/${supply.saleId}`}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors text-sm font-medium"
                >
                  <i className="fa-solid fa-receipt" />
                  <span className="hidden sm:inline">View Sale</span> {supply.saleNumber}
                </Link>
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <i className="fa-solid fa-boxes-stacked text-indigo-500" />
              Items
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Product / Variant</th>
                    <th className="text-left py-3 pr-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Warehouse</th>
                    <th className="text-right py-3 pr-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {supply.items.map((item) => (
                    <tr key={item.id}>
                      <td className="py-3 pr-4 text-sm text-gray-900">
                        {item.variantName ?? <span className="text-gray-400 italic">Unknown variant</span>}
                      </td>
                      <td className="py-3 pr-4 text-sm">
                        {supply.status === 'DRAFT' ? (
                          <select
                            value={item.warehouseId ?? ''}
                            onChange={async (e) => {
                              const wId = Number(e.target.value);
                              if (!wId) return;
                              try {
                                await assignWarehouse({ supplyId: supply.id, itemId: item.id, warehouseId: wId }).unwrap();
                                showToast('success', 'Warehouse assigned');
                              } catch {
                                showToast('error', 'Failed to assign warehouse');
                              }
                            }}
                            disabled={isAssigning}
                            className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                          >
                            <option value="">— select —</option>
                            {warehouses.map((w) => (
                              <option key={w.id} value={w.id}>{w.name}</option>
                            ))}
                          </select>
                        ) : (
                          <span className="text-gray-700">{item.warehouseName ?? <span className="text-gray-400 italic">None</span>}</span>
                        )}
                      </td>
                      <td className="py-3 pr-4 text-sm text-gray-700 text-right font-medium">
                        {item.quantity}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-gray-200">
                    <td className="pt-3 text-sm font-semibold text-gray-900">Total units</td>
                    <td />
                    <td className="pt-3 pr-4 text-sm font-semibold text-gray-900 text-right">{totalItems}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Notes */}
          {supply.notes && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <i className="fa-solid fa-note-sticky text-indigo-500" />
                Notes
              </h2>
              <p className="text-sm text-gray-700 whitespace-pre-line">{supply.notes}</p>
            </div>
          )}

          {/* Meta */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <i className="fa-solid fa-circle-info text-indigo-500" />
              Details
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
                  <i className="fa-solid fa-plus text-gray-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Created</p>
                  <p className="text-gray-900 font-medium">{formatDate(supply.createdAt)}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
                  <i className="fa-solid fa-rotate text-gray-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Last Updated</p>
                  <p className="text-gray-900 font-medium">{formatDate(supply.updatedAt)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>

      {/* Fulfil modal */}
      <Modal
        isOpen={showFulfilModal}
        onClose={() => { setShowFulfilModal(false); setFulfilNotes(''); }}
        title="Mark Supply as Fulfilled"
        leftButton={{ text: 'Cancel', onClick: () => { setShowFulfilModal(false); setFulfilNotes(''); }, variant: 'secondary' }}
        rightButton={{ text: isFulfilling ? 'Saving…' : 'Mark Fulfilled', onClick: handleFulfil, variant: 'primary' }}
      >
        <p className="text-gray-600 mb-4">
          Confirm that <span className="font-semibold text-gray-900">{supply.supplyNumber}</span> has been waybilled to the customer.
        </p>
        <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
        <textarea
          value={fulfilNotes}
          onChange={(e) => setFulfilNotes(e.target.value)}
          rows={3}
          placeholder="Delivery notes, signature reference, etc."
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
        />
      </Modal>

      {/* Cancel modal */}
      <Modal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title="Cancel Supply"
        leftButton={{ text: 'Back', onClick: () => setShowCancelModal(false), variant: 'secondary' }}
        rightButton={{ text: isCancelling ? 'Cancelling…' : 'Cancel Supply', onClick: handleCancel, variant: 'danger' }}
      >
        <p className="text-gray-600">
          Are you sure you want to cancel <span className="font-semibold text-gray-900">{supply.supplyNumber}</span>? This cannot be undone.
        </p>
      </Modal>
    </>
  );
}

export default SupplyDetail;
