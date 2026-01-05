import ReservationStatus from 'src/domain/inventory/reservation-status';

export interface StockReservationFilters {
  ids?: number | number[];
  variantId?: number | number[];
  warehouseId?: number | number[];
  orderId?: number | number[];
  customerId?: number | number[];
  status?: ReservationStatus | ReservationStatus[];
  reservedBy?: number | number[];
  isExpired?: boolean;
  isActive?: boolean;
  includeVariant?: boolean;
  includeWarehouse?: boolean;
  includeReservedByStaff?: boolean;
}