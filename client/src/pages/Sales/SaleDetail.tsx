import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import Modal from '../../components/ui/Modal';
import usePageTitle from '../../hooks/usePageTitle';
import { useGetSaleQuery, useRecordPaymentMutation, useCancelSaleMutation, useUpdateSaleMutation } from '../../store/api/salesApi';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { SaleStatus, PaymentStatus, PaymentMethod } from '../../types/sale';

function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString('en-NG', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function StatusBadge({ status }: { status: SaleStatus }) {
  const config = {
    [SaleStatus.FULFILLED]: 'bg-green-100 text-green-700',
    [SaleStatus.DRAFT]: 'bg-yellow-100 text-yellow-700',
    [SaleStatus.CANCELLED]: 'bg-red-100 text-red-700',
  };
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config[status]}`}>
      {status}
    </span>
  );
}

function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const config = {
    [PaymentStatus.PAID]: 'bg-green-100 text-green-700',
    [PaymentStatus.PARTIAL]: 'bg-yellow-100 text-yellow-700',
    [PaymentStatus.PENDING]: 'bg-gray-100 text-gray-600',
  };
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config[status]}`}>
      {status}
    </span>
  );
}

function SaleDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { can } = useAuth();
  const canEdit = can('sale:update');
  const canRecordPayment = can('payment:record');
  const canCancel = can('sale:cancel');
  usePageTitle('Sale Detail');

  const { data: sale, isLoading } = useGetSaleQuery(Number(id));
  const [recordPayment, { isLoading: isRecordingPayment }] = useRecordPaymentMutation();
  const [cancelSale, { isLoading: isCancelling }] = useCancelSaleMutation();
  const [updateSale, { isLoading: isUpdating }] = useUpdateSaleMutation();

  // Payment modal state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CASH);
  const [paymentReference, setPaymentReference] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');

  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editNotes, setEditNotes] = useState('');
  const [editPaymentMethod, setEditPaymentMethod] = useState<PaymentMethod | ''>('');

  // Fulfil confirmation modal state
  const [showFulfilModal, setShowFulfilModal] = useState(false);

  // Cancel confirmation modal state
  const [showCancelModal, setShowCancelModal] = useState(false);

  const handleRecordPayment = async () => {
    const amount = Number(paymentAmount);
    if (!paymentAmount || isNaN(amount) || amount <= 0) {
      showToast('error', 'Please enter a valid amount');
      return;
    }

    try {
      await recordPayment({
        saleId: Number(id),
        data: {
          amount,
          paymentMethod,
          reference: paymentReference.trim() || undefined,
          notes: paymentNotes.trim() || undefined,
        },
      }).unwrap();

      showToast('success', 'Payment recorded successfully');
      setShowPaymentModal(false);
      setPaymentAmount('');
      setPaymentReference('');
      setPaymentNotes('');
    } catch {
      showToast('error', 'Failed to record payment');
    }
  };

  const handleCancelSale = async () => {
    try {
      await cancelSale(Number(id)).unwrap();
      showToast('success', 'Sale cancelled');
      setShowCancelModal(false);
    } catch {
      showToast('error', 'Failed to cancel sale');
    }
  };

  const handleFulfilSale = async () => {
    try {
      await updateSale({ id: Number(id), data: { status: 'FULFILLED' } }).unwrap();
      showToast('success', 'Sale fulfilled');
      setShowFulfilModal(false);
    } catch {
      showToast('error', 'Failed to fulfil sale');
    }
  };

  const openEditModal = () => {
    if (!sale) return;
    setEditNotes(sale.notes ?? '');
    setEditPaymentMethod(sale.paymentMethod ?? '');
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    try {
      await updateSale({
        id: Number(id),
        data: {
          notes: editNotes.trim() || null,
          paymentMethod: editPaymentMethod || null,
        },
      }).unwrap();
      showToast('success', 'Sale updated');
      setShowEditModal(false);
    } catch {
      showToast('error', 'Failed to update sale');
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
        </div>
      </Layout>
    );
  }

  if (!sale) {
    return (
      <Layout>
        <div className="text-center py-12 text-gray-500">Sale not found</div>
      </Layout>
    );
  }

  const totalPaid = sale.payments.reduce((sum, p) => sum + p.amount, 0);
  const balanceDue = sale.totalAmount - totalPaid;

  return (
    <Layout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/sales')}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 cursor-pointer"
            >
              <i className="fa-solid fa-arrow-left" />
            </button>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-xl font-bold text-gray-900 font-mono">{sale.saleNumber}</h1>
                <StatusBadge status={sale.status} />
                {sale.paymentStatus && <PaymentStatusBadge status={sale.paymentStatus} />}
              </div>
              <p className="text-sm text-gray-500 mt-0.5">{formatDateTime(sale.soldAt)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to={`/sales/${sale.id}/receipt`}
              target="_blank"
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <i className="fa-solid fa-print" />
              Print Receipt
            </Link>
            {sale.status !== SaleStatus.CANCELLED && (
              <>
                {canEdit && (
                  <button
                    onClick={openEditModal}
                    className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <i className="fa-solid fa-pen" />
                    Edit
                  </button>
                )}
                {canEdit && sale.status === SaleStatus.DRAFT && (
                  <button
                    onClick={() => setShowFulfilModal(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors cursor-pointer"
                  >
                    <i className="fa-solid fa-circle-check" />
                    Fulfil
                  </button>
                )}
                {canRecordPayment && sale.status === SaleStatus.FULFILLED && sale.paymentStatus !== PaymentStatus.PAID && (
                  <button
                    onClick={() => setShowPaymentModal(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors cursor-pointer"
                  >
                    <i className="fa-solid fa-plus" />
                    Record Payment
                  </button>
                )}
                {canCancel && (
                  <button
                    onClick={() => setShowCancelModal(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 border border-red-200 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                  >
                    <i className="fa-solid fa-ban" />
                    Cancel
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left: Line Items + Info */}
          <div className="lg:col-span-2 space-y-4">
            {/* Customer & Sale Info */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <h2 className="text-sm font-semibold text-gray-700 mb-3">Sale Information</h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Customer</p>
                  <p className="font-medium text-gray-900 mt-0.5">
                    {sale.customer ? sale.customer.name : (
                      <span className="text-gray-400 italic">Walk-in Customer</span>
                    )}
                  </p>
                  {sale.customer?.phoneNumber && (
                    <p className="text-gray-500 text-xs mt-0.5">{sale.customer.phoneNumber}</p>
                  )}
                </div>
                <div>
                  <p className="text-gray-500">Sold By</p>
                  <p className="font-medium text-gray-900 mt-0.5">
                    {sale.soldBy ? `${sale.soldBy.firstName} ${sale.soldBy.lastName}` : '—'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Branch</p>
                  <p className="font-medium text-gray-900 mt-0.5">{sale.branch?.name ?? '—'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Payment Method</p>
                  <p className="font-medium text-gray-900 mt-0.5">{sale.paymentMethod}</p>
                </div>
                {sale.notes && (
                  <div className="col-span-2">
                    <p className="text-gray-500">Notes</p>
                    <p className="font-medium text-gray-900 mt-0.5">{sale.notes}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Line items */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="px-4 py-3 border-b border-gray-200">
                <h2 className="text-sm font-semibold text-gray-700">
                  Items ({sale.lineItems.length})
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Item</th>
                      <th className="text-right px-4 py-3 text-xs font-medium text-gray-500">Qty</th>
                      <th className="text-right px-4 py-3 text-xs font-medium text-gray-500">Unit Price</th>
                      <th className="text-right px-4 py-3 text-xs font-medium text-gray-500">Discount</th>
                      <th className="text-right px-4 py-3 text-xs font-medium text-gray-500">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sale.lineItems.map((item) => (
                      <tr key={item.id} className="border-b border-gray-50">
                        <td className="px-4 py-3">
                          <p className="text-sm font-medium text-gray-900">{item.variantName}</p>
                          <p className="text-xs font-mono text-gray-400">{item.sku}</p>
                        </td>
                        <td className="px-3 py-3 text-sm text-gray-700 text-right">{item.quantity}</td>
                        <td className="px-3 py-3 text-sm text-gray-700 text-right">{formatPrice(item.unitPrice)}</td>
                        <td className="px-3 py-3 text-sm text-gray-500 text-right">
                          {item.discountAmount > 0 ? `-${formatPrice(item.discountAmount)}` : '—'}
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold text-gray-900 text-right">
                          {formatPrice(item.lineTotal)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Payments */}
            {sale.payments.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="px-4 py-3 border-b border-gray-200">
                  <h2 className="text-sm font-semibold text-gray-700">
                    Payments ({sale.payments.length})
                  </h2>
                </div>
                <div className="divide-y divide-gray-50">
                  {sale.payments.map((payment) => (
                    <div key={payment.id} className="px-4 py-3 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{formatPrice(payment.amount)}</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {payment.paymentMethod}
                          {payment.reference && ` · Ref: ${payment.reference}`}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">{formatDateTime(payment.recordedAt)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: Total breakdown */}
          <div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <h2 className="text-sm font-semibold text-gray-700 mb-3">Total Breakdown</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>{formatPrice(sale.subtotal)}</span>
                </div>
                {sale.discountAmount > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>Discount</span>
                    <span>-{formatPrice(sale.discountAmount)}</span>
                  </div>
                )}
                <div className="border-t border-gray-200 pt-2 flex justify-between font-semibold text-gray-900">
                  <span>Total</span>
                  <span>{formatPrice(sale.totalAmount)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Amount Paid</span>
                  <span className="text-green-600 font-medium">{formatPrice(totalPaid)}</span>
                </div>
                <div className={`flex justify-between font-semibold ${balanceDue > 0 ? 'text-red-600' : 'text-gray-400'}`}>
                  <span>Balance Due</span>
                  <span>{formatPrice(Math.max(0, balanceDue))}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fulfil Confirmation Modal */}
      <Modal
        isOpen={showFulfilModal}
        onClose={() => setShowFulfilModal(false)}
        title="Fulfil Sale"
        leftButton={{ text: 'Cancel', onClick: () => setShowFulfilModal(false), variant: 'secondary' }}
        rightButton={{ text: isUpdating ? 'Fulfilling...' : 'Fulfil Sale', onClick: handleFulfilSale, variant: 'primary' }}
      >
        <div className="space-y-3">
          <p className="text-sm text-gray-600">
            Mark sale <span className="font-semibold font-mono">{sale.saleNumber}</span> as fulfilled?
          </p>
          <p className="text-sm text-gray-500">This will change the status from Draft to Fulfilled.</p>
        </div>
      </Modal>

      {/* Edit Sale Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Sale"
        leftButton={{ text: 'Cancel', onClick: () => setShowEditModal(false), variant: 'secondary' }}
        rightButton={{ text: isUpdating ? 'Saving...' : 'Save Changes', onClick: handleSaveEdit, variant: 'primary' }}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Method <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <div className="relative">
              <select
                value={editPaymentMethod}
                onChange={(e) => setEditPaymentMethod(e.target.value as PaymentMethod | '')}
                className="w-full appearance-none px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 bg-white cursor-pointer"
              >
                <option value="">— Not specified —</option>
                <option value={PaymentMethod.CASH}>Cash</option>
                <option value={PaymentMethod.CARD}>Card</option>
                <option value={PaymentMethod.TRANSFER}>Transfer</option>
                <option value={PaymentMethod.CREDIT}>Credit</option>
              </select>
              <i className="fa-solid fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              value={editNotes}
              onChange={(e) => setEditNotes(e.target.value)}
              rows={3}
              placeholder="Add a note..."
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 resize-none"
            />
          </div>
        </div>
      </Modal>

      {/* Record Payment Modal */}
      <Modal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        title="Record Payment"
        leftButton={{ text: 'Cancel', onClick: () => setShowPaymentModal(false), variant: 'secondary' }}
        rightButton={{
          text: isRecordingPayment ? 'Recording...' : 'Record Payment',
          onClick: handleRecordPayment,
          variant: 'primary',
        }}
      >
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-sm text-gray-600">
              Balance due: <span className="font-semibold text-gray-900">{formatPrice(Math.max(0, balanceDue))}</span>
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={paymentAmount ? Number(paymentAmount).toLocaleString('en-NG') : ''}
              onChange={(e) => {
                const raw = e.target.value.replace(/,/g, '');
                if (raw === '' || !isNaN(Number(raw))) setPaymentAmount(raw);
              }}
              placeholder={`e.g. ${Math.max(0, balanceDue).toFixed(0)}`}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Method <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full appearance-none px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 bg-white cursor-pointer"
              >
                <option value={PaymentMethod.CASH}>Cash</option>
                <option value={PaymentMethod.CARD}>Card</option>
                <option value={PaymentMethod.TRANSFER}>Transfer</option>
                <option value={PaymentMethod.CREDIT}>Credit</option>
              </select>
              <i className="fa-solid fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reference <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              type="text"
              value={paymentReference}
              onChange={(e) => setPaymentReference(e.target.value)}
              placeholder="Transaction reference..."
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              value={paymentNotes}
              onChange={(e) => setPaymentNotes(e.target.value)}
              rows={2}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-transparent resize-none"
            />
          </div>
        </div>
      </Modal>

      {/* Cancel Confirmation Modal */}
      <Modal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title="Cancel Sale"
        leftButton={{ text: 'Keep Sale', onClick: () => setShowCancelModal(false), variant: 'secondary' }}
        rightButton={{
          text: isCancelling ? 'Cancelling...' : 'Cancel Sale',
          onClick: handleCancelSale,
          variant: 'danger',
        }}
      >
        <div className="space-y-3">
          <p className="text-sm text-gray-600">
            Are you sure you want to cancel sale <span className="font-semibold font-mono">{sale.saleNumber}</span>?
          </p>
          <p className="text-sm text-gray-500">This action cannot be undone.</p>
        </div>
      </Modal>
    </Layout>
  );
}

export default SaleDetail;
