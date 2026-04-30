import { Injectable } from '@nestjs/common';
import Supply from 'src/domain/supply/supply';

@Injectable()
class SupplySerialiser {
  serialise(supply: Supply) {
    return {
      id: supply.getId(),
      supplyNumber: supply.getSupplyNumber(),
      saleId: supply.getSaleId(),
      saleNumber: supply.getSaleNumber(),
      branchId: supply.getBranchId(),
      status: supply.getStatus(),
      notes: supply.getNotes(),
      suppliedBy: supply.getSuppliedBy(),
      items: supply.getItems().map((item) => ({
        id: item.getId(),
        variantId: item.getVariantId(),
        variantName: item.getVariantName(),
        quantity: item.getQuantity(),
        warehouseId: item.getWarehouseId(),
        warehouseName: item.getWarehouseName(),
      })),
      createdAt: supply.getCreatedAt(),
      updatedAt: supply.getUpdatedAt(),
    };
  }

  serialiseMany(supplies: Supply[]) {
    return supplies.map((s) => this.serialise(s));
  }

  serialiseListResponse(supplies: Supply[], total: number) {
    return { data: this.serialiseMany(supplies), total };
  }
}

export default SupplySerialiser;
