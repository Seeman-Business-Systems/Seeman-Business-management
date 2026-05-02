import { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import usePageTitle from '../../hooks/usePageTitle';
import { useGetProductsQuery } from '../../store/api/productsApi';
import { useGetBranchesQuery } from '../../store/api/branchesApi';
import { useCreateSaleMutation } from '../../store/api/salesApi';
import { useGetCustomersQuery } from '../../store/api/customersApi';
import { useLazyGetInventoryQuery } from '../../store/api/inventoryApi';
import type { InventoryRecord } from '../../types/inventory';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { PaymentMethod } from '../../types/sale';
import type { CreateSaleLineItemRequest } from '../../types/sale';
import type { ProductVariant, Product } from '../../types/product';
import type { Customer } from '../../types/customer';

interface CartItem {
  variantId: number;
  variantName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  discountAmount: number;
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

function CreateSale() {
  usePageTitle('New Sale');
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { user } = useAuth();

  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string>(() => user?.branch?.id ? String(user.branch.id) : '');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | ''>('');
  const [saleDiscount, setSaleDiscount] = useState('');
  const [notes, setNotes] = useState('');
  const [variantSearch, setVariantSearch] = useState('');
  const [showVariantSearch, setShowVariantSearch] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerSearch, setCustomerSearch] = useState('');
  const [showCustomerSearch, setShowCustomerSearch] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const customerRef = useRef<HTMLDivElement>(null);

  const { data: products = [] } = useGetProductsQuery({ includeRelations: true });
  const { data: branches = [] } = useGetBranchesQuery();
  const { data: customers = [] } = useGetCustomersQuery(
    customerSearch.trim() ? { name: customerSearch.trim() } : undefined
  );
  const [createSale, { isLoading }] = useCreateSaleMutation();
  const [fetchInventory] = useLazyGetInventoryQuery();

  // variantId → total available quantity across all warehouses
  const [stockMap, setStockMap] = useState<Record<number, number>>({});

  useEffect(() => {
    fetchInventory(undefined)
      .unwrap()
      .then((records) => {
        const map: Record<number, number> = {};
        for (const r of records) {
          map[r.variantId] = (map[r.variantId] ?? 0) + r.availableQuantity;
        }
        setStockMap(map);
      })
      .catch(() => {});
  }, [fetchInventory]);

  // Flatten all variants with product info
  const allVariants: (ProductVariant & { productName: string })[] = useMemo(() => {
    return products.flatMap((p: Product) =>
      (p.variants ?? []).map((v) => ({
        ...v,
        productName: p.name,
      }))
    );
  }, [products]);

  // Filter variants by search
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

  const addToCart = (variant: ProductVariant & { productName: string }) => {
    const available = stockMap[variant.id] ?? 0;
    const inCart = cart.find((item) => item.variantId === variant.id)?.quantity ?? 0;

    if (available <= 0) {
      showToast('error', `"${variant.variantName}" is out of stock.`);
      setVariantSearch('');
      setShowVariantSearch(false);
      return;
    }

    if (inCart >= available) {
      showToast('warning', `Only ${available} unit${available === 1 ? '' : 's'} available for "${variant.variantName}".`);
      setVariantSearch('');
      setShowVariantSearch(false);
      return;
    }

    const existing = cart.find((item) => item.variantId === variant.id);
    if (existing) {
      setCart((prev) =>
        prev.map((item) =>
          item.variantId === variant.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCart((prev) => [
        ...prev,
        {
          variantId: variant.id,
          variantName: variant.variantName,
          sku: variant.sku,
          quantity: 1,
          unitPrice: Number(variant.sellingPrice),
          discountAmount: 0,
        },
      ]);
    }
    setVariantSearch('');
    setShowVariantSearch(false);
  };

  const removeFromCart = (variantId: number) => {
    setCart((prev) => prev.filter((item) => item.variantId !== variantId));
  };

  const updateCartItem = (variantId: number, field: keyof CartItem, value: number) => {
    setCart((prev) =>
      prev.map((item) =>
        item.variantId === variantId ? { ...item, [field]: value } : item
      )
    );
  };

  const subtotal = cart.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice - item.discountAmount,
    0
  );
  const discountAmount = Number(saleDiscount) || 0;
  const totalAmount = subtotal - discountAmount;

  const handleSubmit = async () => {
    setFormError(null);

    if (!selectedBranch) {
      setFormError('Please select a branch before recording the sale.');
      return;
    }
    if (cart.length === 0) {
      setFormError('Please add at least one item to the cart.');
      return;
    }
    const zeroPrice = cart.find((item) => item.unitPrice <= 0);
    if (zeroPrice) {
      setFormError(`"${zeroPrice.variantName}" has no unit price set. Please enter a price greater than 0.`);
      return;
    }
    const zeroQty = cart.find((item) => item.quantity <= 0);
    if (zeroQty) {
      setFormError(`"${zeroQty.variantName}" has an invalid quantity. Please enter at least 1.`);
      return;
    }

    const lineItems: CreateSaleLineItemRequest[] = cart.map((item) => ({
      variantId: item.variantId,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      discountAmount: item.discountAmount || undefined,
    }));

    try {
      const sale = await createSale({
        branchId: Number(selectedBranch),
        paymentMethod: paymentMethod || null,
        lineItems,
        customerId: selectedCustomer?.id,
        discountAmount: discountAmount || undefined,
        notes: notes.trim() || undefined,
      }).unwrap();

      showToast('success', `Sale ${sale.saleNumber} recorded successfully`);

      const soldVariantIds = new Set(cart.map((item) => item.variantId));
      const { data: lowStockRecords } = await fetchInventory({ lowInventory: true });
      if (lowStockRecords) {
        const lowSoldItems = lowStockRecords.filter((r: InventoryRecord) => soldVariantIds.has(r.variantId));
        for (const record of lowSoldItems) {
          const name = record.variant?.variantName ?? `Variant #${record.variantId}`;
          showToast('warning', `Stock for "${name}" is running low — consider restocking`);
        }
      }

      navigate(`/sales/${sale.id}`);
    } catch (err: unknown) {
      const apiMessage =
        err && typeof err === 'object' && 'data' in err
          ? (err as { data?: { message?: string } }).data?.message
          : null;
      setFormError(typeof apiMessage === 'string' ? apiMessage : 'Failed to record sale. Please check the form and try again.');
    }
  };

  return (
    <Layout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/sales')}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 cursor-pointer"
          >
            <i className="fa-solid fa-arrow-left" />
          </button>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">New Sale</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left: Line Items */}
          <div className="lg:col-span-2 space-y-4">
            {/* Variant search */}
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
                        onMouseDown={() => addToCart(v)}
                        className="w-full px-4 py-3 text-left hover:bg-indigo-50 flex items-center justify-between gap-2 border-b border-gray-50 last:border-0 cursor-pointer"
                      >
                        <div>
                          <p className="text-sm font-medium text-gray-900">{v.variantName}</p>
                          <p className="text-xs text-gray-500 font-mono">{v.sku}</p>
                          <p className="text-xs text-gray-400">{v.productName}</p>
                        </div>
                        <span className="text-sm font-semibold text-indigo-600 flex-shrink-0">
                          {formatPrice(Number(v.sellingPrice))}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Cart items */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="px-4 py-3 border-b border-gray-200">
                <h2 className="text-sm font-semibold text-gray-700">
                  Cart ({cart.length} item{cart.length !== 1 ? 's' : ''})
                </h2>
              </div>
              {cart.length === 0 ? (
                <div className="px-4 py-12 text-center text-gray-400">
                  <i className="fa-solid fa-cart-shopping text-3xl mb-2" />
                  <p className="text-sm">No items added yet</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {cart.map((item) => (
                    <div key={item.variantId} className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{item.variantName}</p>
                          <p className="text-xs font-mono text-gray-400 mt-0.5">{item.sku}</p>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.variantId)}
                          className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 cursor-pointer"
                        >
                          <i className="fa-solid fa-xmark text-xs" />
                        </button>
                      </div>
                      <div className="mt-3 grid grid-cols-3 gap-2">
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Qty</label>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateCartItem(item.variantId, 'quantity', Math.max(1, Number(e.target.value)))}
                            className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Unit Price</label>
                          <input
                            type="text"
                            inputMode="numeric"
                            value={item.unitPrice === 0 ? '' : item.unitPrice.toLocaleString('en-NG')}
                            onChange={(e) => { const n = Number(e.target.value.replace(/,/g, '')); if (!isNaN(n)) updateCartItem(item.variantId, 'unitPrice', n); }}
                            className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Discount</label>
                          <input
                            type="text"
                            inputMode="numeric"
                            value={item.discountAmount === 0 ? '' : item.discountAmount.toLocaleString('en-NG')}
                            onChange={(e) => { const n = Number(e.target.value.replace(/,/g, '')); if (!isNaN(n)) updateCartItem(item.variantId, 'discountAmount', n); }}
                            className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
                          />
                        </div>
                      </div>
                      <div className="mt-2 text-right">
                        <span className="text-sm font-semibold text-gray-900">
                          {formatPrice(item.quantity * item.unitPrice - item.discountAmount)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: Summary & Payment */}
          <div className="space-y-4">
            {/* Validation error */}
            {formError && (
              <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
                <i className="fa-solid fa-circle-exclamation mt-0.5 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* Sale settings */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 space-y-4">
              <h2 className="text-sm font-semibold text-gray-700">Sale Details</h2>

              {/* Customer */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
                {selectedCustomer ? (
                  <div className="flex items-center justify-between px-3 py-2.5 border border-indigo-200 bg-indigo-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{selectedCustomer.name}</p>
                      <p className="text-xs text-gray-500">{selectedCustomer.phoneNumber}</p>
                    </div>
                    <button
                      onClick={() => { setSelectedCustomer(null); setCustomerSearch(''); }}
                      className="text-gray-400 hover:text-gray-600 cursor-pointer ml-2"
                    >
                      <i className="fa-solid fa-xmark text-xs" />
                    </button>
                  </div>
                ) : (
                  <div className="relative" ref={customerRef}>
                    <i className="fa-solid fa-user absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                    <input
                      type="text"
                      placeholder="Search customer or leave as walk-in"
                      value={customerSearch}
                      onChange={(e) => { setCustomerSearch(e.target.value); setShowCustomerSearch(true); }}
                      onFocus={() => setShowCustomerSearch(true)}
                      onBlur={() => setTimeout(() => setShowCustomerSearch(false), 150)}
                      className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-transparent"
                    />
                    {showCustomerSearch && customers.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
                        {customers.slice(0, 10).map((c) => (
                          <button
                            key={c.id}
                            onMouseDown={() => { setSelectedCustomer(c); setCustomerSearch(''); setShowCustomerSearch(false); }}
                            className="w-full px-4 py-2.5 text-left hover:bg-indigo-50 border-b border-gray-50 last:border-0 cursor-pointer"
                          >
                            <p className="text-sm font-medium text-gray-900">{c.name}</p>
                            <p className="text-xs text-gray-500">{c.phoneNumber}{c.companyName ? ` · ${c.companyName}` : ''}</p>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Branch */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Branch <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={selectedBranch}
                    onChange={(e) => setSelectedBranch(e.target.value)}
                    className="w-full appearance-none pl-9 pr-8 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 bg-white cursor-pointer"
                  >
                    <option value="">Select branch</option>
                    {branches.map((b: any) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                  <i className="fa-solid fa-code-branch absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                  <i className="fa-solid fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                </div>
              </div>

              {/* Payment method */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Method <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <div className="relative">
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod | '')}
                    className="w-full appearance-none pl-9 pr-8 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 bg-white cursor-pointer"
                  >
                    <option value="">— Not specified —</option>
                    <option value={PaymentMethod.CASH}>Cash</option>
                    <option value={PaymentMethod.CARD}>Card</option>
                    <option value={PaymentMethod.TRANSFER}>Transfer</option>
                    <option value={PaymentMethod.CREDIT}>Credit</option>
                  </select>
                  <i className="fa-solid fa-credit-card absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                  <i className="fa-solid fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                </div>
              </div>

              {/* Sale-level discount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sale Discount <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={saleDiscount ? Number(saleDiscount).toLocaleString('en-NG') : ''}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/,/g, '');
                    if (raw === '' || !isNaN(Number(raw))) setSaleDiscount(raw);
                  }}
                  placeholder="0"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="Add a note..."
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 resize-none"
                />
              </div>
            </div>

            {/* Summary */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <h2 className="text-sm font-semibold text-gray-700 mb-3">Summary</h2>
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-sm text-red-600">
                    <span>Discount</span>
                    <span>-{formatPrice(discountAmount)}</span>
                  </div>
                )}
                <div className="border-t border-gray-200 pt-2 flex justify-between text-base font-semibold text-gray-900">
                  <span>Total</span>
                  <span>{formatPrice(totalAmount)}</span>
                </div>
              </div>
            </div>

            {/* Record Sale button */}
            <button
              onClick={handleSubmit}
              disabled={isLoading || cart.length === 0}
              className="w-full py-3 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  Recording…
                </>
              ) : (
                <>
                  <i className="fa-solid fa-check" />
                  Record Sale
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default CreateSale;
