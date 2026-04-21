import { Injectable } from '@nestjs/common';
import Sale from 'src/domain/sale/sale';
import SalePayment from 'src/domain/sale/sale-payment';

@Injectable()
class SaleSerialiser {
  async serialise(sale: Sale) {
    const result: any = {
      id: sale.getId(),
      saleNumber: sale.getSaleNumber(),
      status: sale.getStatus(),
      paymentStatus: sale.getPaymentStatus(),
      paymentMethod: sale.getPaymentMethod(),
      subtotal: sale.getSubtotal(),
      discountAmount: sale.getDiscountAmount(),
      totalAmount: sale.getTotalAmount(),
      notes: sale.getNotes(),
      soldAt: sale.getSoldAt(),
      createdAt: sale.getCreatedAt(),
      customer: sale.getCustomer() ?? null,
      soldBy: sale.getSoldByData() ?? null,
      branch: sale.getBranchData() ?? null,
      lineItems: sale.getLineItems().map((item) => ({
        id: item.getId(),
        variantId: item.getVariantId(),
        variantName: item.getVariantName() ?? null,
        sku: item.getSku() ?? null,
        quantity: item.getQuantity(),
        unitPrice: item.getUnitPrice(),
        discountAmount: item.getDiscountAmount(),
        lineTotal: item.getLineTotal(),
      })),
      payments: sale.getPayments().map((payment) => ({
        id: payment.getId(),
        amount: payment.getAmount(),
        paymentMethod: payment.getPaymentMethod(),
        reference: payment.getReference(),
        notes: payment.getNotes(),
        recordedAt: payment.getRecordedAt(),
      })),
    };

    return result;
  }

  async serialiseList(sale: Sale) {
    return {
      id: sale.getId(),
      saleNumber: sale.getSaleNumber(),
      status: sale.getStatus(),
      paymentStatus: sale.getPaymentStatus(),
      paymentMethod: sale.getPaymentMethod(),
      subtotal: sale.getSubtotal(),
      discountAmount: sale.getDiscountAmount(),
      totalAmount: sale.getTotalAmount(),
      notes: sale.getNotes(),
      soldAt: sale.getSoldAt(),
      createdAt: sale.getCreatedAt(),
      customer: sale.getCustomer() ?? null,
      soldBy: sale.getSoldByData() ?? null,
      branch: sale.getBranchData() ?? null,
      itemCount: sale.getLineItems().length,
    };
  }

  async serialiseMany(sales: Sale[]) {
    return Promise.all(sales.map((sale) => this.serialise(sale)));
  }

  async serialiseListResponse(sales: Sale[], total: number) {
    const data = await Promise.all(sales.map((sale) => this.serialiseList(sale)));
    return { data, total };
  }

  serialisePayment(payment: SalePayment) {
    return {
      id: payment.getId(),
      saleId: payment.getSaleId(),
      amount: payment.getAmount(),
      paymentMethod: payment.getPaymentMethod(),
      reference: payment.getReference(),
      notes: payment.getNotes(),
      recordedAt: payment.getRecordedAt(),
    };
  }
}

export default SaleSerialiser;
