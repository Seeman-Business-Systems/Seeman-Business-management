import { Injectable } from '@nestjs/common';
import Sale from 'src/domain/sale/sale';
import SalePayment from 'src/domain/sale/sale-payment';
import StaffRepository from 'src/infrastructure/database/repositories/staff/staff.repository';
import BranchRepository from 'src/infrastructure/database/repositories/branch/branch.repository';
import CustomerRepository from 'src/infrastructure/database/repositories/customer/customer.repository';
import { BaseStaffSerialiser } from './base-staff.serialiser';
import { BaseBranchSerialiser } from './base-branch.serialiser';

@Injectable()
class SaleSerialiser {
  constructor(
    private readonly staffRepo: StaffRepository,
    private readonly branchRepo: BranchRepository,
    private readonly customerRepo: CustomerRepository,
    private readonly baseStaffSerialiser: BaseStaffSerialiser,
    private readonly baseBranchSerialiser: BaseBranchSerialiser,
  ) {}

  async serialise(sale: Sale) {
    const [staff, branch, customer] = await Promise.all([
      this.staffRepo.findById(sale.getSoldBy()),
      this.branchRepo.findById(sale.getBranchId()),
      sale.getCustomerId() ? this.customerRepo.findById(sale.getCustomerId()!) : null,
    ]);

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
      customer: customer ? { id: customer.getId(), name: customer.getName(), phoneNumber: customer.getPhoneNumber() } : null,
      soldBy: this.baseStaffSerialiser.serialise(staff!),
      branch: this.baseBranchSerialiser.serialise(branch!),
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
  }

  async serialiseList(sale: Sale) {
    const [staff, branch, customer] = await Promise.all([
      this.staffRepo.findById(sale.getSoldBy()),
      this.branchRepo.findById(sale.getBranchId()),
      sale.getCustomerId() ? this.customerRepo.findById(sale.getCustomerId()!) : null,
    ]);

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
      customer: customer ? { id: customer.getId(), name: customer.getName(), phoneNumber: customer.getPhoneNumber() } : null,
      soldBy: this.baseStaffSerialiser.serialise(staff!),
      branch: this.baseBranchSerialiser.serialise(branch!),
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
