import { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { Product } from '../../types/product';
import { ProductStatus, ProductStatusLabels, ProductType, ProductTypeLabels } from '../../types/product';

interface ProductsTableProps {
  products: Product[];
  selectedIds: Set<number>;
  onSelectOne: (id: number) => void;
  onSelectAll: () => void;
  isAllSelected: boolean;
  isSomeSelected: boolean;
  startIndex: number;
  endIndex: number;
  total: number;
  resultsPerPage: number;
  onResultsPerPageChange: (value: number) => void;
  onDelete: (productId: number) => void;
}

const statusStyles: Record<ProductStatus, string> = {
  [ProductStatus.ACTIVE]: 'bg-green-100 text-green-800',
  [ProductStatus.INACTIVE]: 'bg-gray-100 text-gray-800',
  [ProductStatus.DISCONTINUED]: 'bg-red-100 text-red-800',
};

const typeStyles: Record<ProductType, string> = {
  [ProductType.TYRE]: 'bg-blue-100 text-blue-800',
  [ProductType.BATTERY]: 'bg-yellow-100 text-yellow-800',
  [ProductType.SPARE_PART]: 'bg-purple-100 text-purple-800',
};

function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

function getPriceRange(product: Product): string {
  const variants = product.variants ?? [];
  if (variants.length === 0) return '—';
  const prices = variants.map((v) => v.sellingPrice).filter((p) => p != null);
  if (prices.length === 0) return '—';
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  return min === max ? formatPrice(min) : `${formatPrice(min)} – ${formatPrice(max)}`;
}

function ProductsTable({
  products,
  selectedIds,
  onSelectOne,
  onSelectAll,
  isAllSelected,
  isSomeSelected,
  startIndex,
  endIndex,
  total,
  resultsPerPage,
  onResultsPerPageChange,
  onDelete,
}: ProductsTableProps) {
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const openRowMenu = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    setOpenMenuId(openMenuId === id ? null : id);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      {/* Results count and per page */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
        <p className="text-sm text-gray-600">
          Showing {total > 0 ? startIndex + 1 : 0} - {endIndex} of {total} products
        </p>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Results per page:</span>
          <select
            value={resultsPerPage}
            onChange={(e) => onResultsPerPageChange(Number(e.target.value))}
            className="appearance-none px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-transparent bg-white cursor-pointer"
          >
            <option value={6}>6</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden">
        {products.length === 0 ? (
          <div className="px-4 py-12 text-center text-gray-500">No products found</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {products.map((product) => (
              <div
                key={product.id}
                className={`p-4 ${selectedIds.has(product.id) ? 'bg-indigo-50' : ''}`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(product.id)}
                    onChange={() => onSelectOne(product.id)}
                    className="w-4 h-4 mt-1 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/products/${product.id}`}
                      className="font-medium text-gray-900 hover:text-indigo-600 block truncate"
                    >
                      {product.name}
                    </Link>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {(product.variants?.length ?? 0)} variant{(product.variants?.length ?? 0) !== 1 ? 's' : ''}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${typeStyles[product.productType]}`}>
                        {ProductTypeLabels[product.productType]}
                      </span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusStyles[product.status]}`}>
                        {ProductStatusLabels[product.status]}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-sm">
                      <span className="text-gray-500">{product.brand?.name || '—'}</span>
                      <span className="font-semibold text-gray-900">{getPriceRange(product)}</span>
                    </div>
                  </div>
                  <div className="relative flex-shrink-0" ref={openMenuId === product.id ? menuRef : null}>
                    <button
                      onClick={(e) => openRowMenu(e, product.id)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 cursor-pointer"
                    >
                      <i className="fa-solid fa-ellipsis-vertical" />
                    </button>
                    {openMenuId === product.id && (
                      <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                        <Link
                          to={`/products/${product.id}`}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                        >
                          <i className="fa-solid fa-eye text-gray-400 w-4" />
                          View Product
                        </Link>
                        <Link
                          to={`/products/${product.id}/edit`}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                        >
                          <i className="fa-solid fa-pen text-gray-400 w-4" />
                          Edit Product
                        </Link>
                        <button
                          onClick={() => { setOpenMenuId(null); onDelete(product.id); }}
                          className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                        >
                          <i className="fa-solid fa-trash text-red-400 w-4" />
                          Delete Product
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="w-12 px-6 py-4">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = !isAllSelected && isSomeSelected;
                  }}
                  onChange={onSelectAll}
                  className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
              </th>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Product</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Type</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-500 hidden lg:table-cell">Brand</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-500 hidden xl:table-cell">Category</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-500 hidden lg:table-cell">Variants</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Price</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Status</th>
              <th className="w-12 px-6 py-4"></th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-6 py-12 text-center text-gray-500">
                  No products found
                </td>
              </tr>
            ) : (
              products.map((product, index) => (
                <tr
                  key={product.id}
                  className={`border-b border-gray-100 hover:bg-indigo-50 ${
                    index % 2 === 0 ? 'bg-indigo-50/30' : ''
                  } ${selectedIds.has(product.id) ? 'bg-indigo-100' : ''}`}
                >
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(product.id)}
                      onChange={() => onSelectOne(product.id)}
                      className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <Link
                      to={`/products/${product.id}`}
                      className="font-medium text-gray-900 hover:text-indigo-600 block"
                    >
                      {product.name}
                    </Link>
                    {product.variants && product.variants.length > 0 && (
                      <p className="text-xs text-gray-400 mt-0.5 font-mono">
                        {product.variants[0].sku}
                        {product.variants.length > 1 && ` +${product.variants.length - 1} more`}
                      </p>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${typeStyles[product.productType]}`}>
                      {ProductTypeLabels[product.productType]}
                    </span>
                  </td>
                  <td className="px-6 py-4 hidden lg:table-cell">
                    <span className="text-gray-700">{product.brand?.name || '—'}</span>
                  </td>
                  <td className="px-6 py-4 hidden xl:table-cell">
                    <span className="text-gray-700">{product.category?.name || '—'}</span>
                  </td>
                  <td className="px-6 py-4 hidden lg:table-cell">
                    <span className="text-gray-600 text-sm">
                      {product.variants?.length ?? 0}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-medium text-gray-900">{getPriceRange(product)}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[product.status]}`}>
                      {ProductStatusLabels[product.status]}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="relative" ref={openMenuId === product.id ? menuRef : null}>
                      <button
                        onClick={(e) => openRowMenu(e, product.id)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 cursor-pointer"
                      >
                        <i className="fa-solid fa-ellipsis-vertical" />
                      </button>
                      {openMenuId === product.id && (
                        <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                          <Link
                            to={`/products/${product.id}`}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                          >
                            <i className="fa-solid fa-eye text-gray-400 w-4" />
                            View Product
                          </Link>
                          <Link
                            to={`/products/${product.id}/edit`}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                          >
                            <i className="fa-solid fa-pen text-gray-400 w-4" />
                            Edit Product
                          </Link>
                          <button
                            onClick={() => { setOpenMenuId(null); onDelete(product.id); }}
                            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                          >
                            <i className="fa-solid fa-trash text-red-400 w-4" />
                            Delete Product
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ProductsTable;
