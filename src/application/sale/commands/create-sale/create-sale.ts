import { BadRequestException } from '@nestjs/common';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import CreateSaleCommand from './create-sale.command';
import Sale from 'src/domain/sale/sale';
import SaleLineItem from 'src/domain/sale/sale-line-item';
import SaleStatus from 'src/domain/sale/sale-status';
import PaymentStatus from 'src/domain/sale/payment-status';
import SaleRepository from 'src/infrastructure/database/repositories/sale/sale.repository';
import SaleLineItemRepository from 'src/infrastructure/database/repositories/sale/sale-line-item.repository';
import SaleEntity from 'src/infrastructure/database/entities/sale.entity';
import SaleCreated from 'src/domain/sale/events/sale-created.event';
import InventoryRepository from 'src/infrastructure/database/repositories/inventory/inventory.repository';
import ProductVariantRepository from 'src/infrastructure/database/repositories/product/product-variant.repository';

@CommandHandler(CreateSaleCommand)
class CreateSaleHandler implements ICommandHandler<CreateSaleCommand> {
  constructor(
    private readonly saleRepository: SaleRepository,
    private readonly saleLineItemRepository: SaleLineItemRepository,
    @InjectRepository(SaleEntity)
    private readonly saleEntityRepository: Repository<SaleEntity>,
    private readonly eventBus: EventBus,
    private readonly inventoryRepository: InventoryRepository,
    private readonly productVariantRepository: ProductVariantRepository,
  ) {}

  async execute(command: CreateSaleCommand): Promise<Sale> {
    // Validate stock availability across all warehouses before creating the sale
    await this.assertStockAvailable(command.lineItems);

    // 1. Generate sale number
    const saleNumber = await this.generateSaleNumber();

    // 2. Calculate subtotal
    const subtotal = command.lineItems.reduce((sum, item) => {
      const lineTotal = item.quantity * item.unitPrice - (item.discountAmount ?? 0);
      return sum + lineTotal;
    }, 0);

    // 3. Calculate totalAmount
    const discountAmount = command.discountAmount ?? 0;
    const totalAmount = subtotal - discountAmount;

    // 4. Create Sale domain object
    const sale = new Sale(
      undefined,
      saleNumber,
      command.customerId ?? null,
      command.soldBy,
      command.branchId,
      SaleStatus.DRAFT,
      PaymentStatus.PENDING,
      command.paymentMethod,
      subtotal,
      discountAmount,
      totalAmount,
      command.notes ?? null,
      new Date(),
      new Date(),
      new Date(),
      null,
      [],
      [],
    );

    // 5. Save sale
    const savedSale = await this.saleRepository.commit(sale);

    // 6. Create line items
    const savedLineItems: SaleLineItem[] = [];
    for (const item of command.lineItems) {
      const itemDiscount = item.discountAmount ?? 0;
      const lineTotal = item.quantity * item.unitPrice - itemDiscount;

      const lineItem = new SaleLineItem(
        undefined,
        savedSale.getId()!,
        item.variantId,
        item.quantity,
        item.unitPrice,
        itemDiscount,
        lineTotal,
        new Date(),
        new Date(),
      );

      const savedLineItem = await this.saleLineItemRepository.commit(lineItem);
      savedLineItems.push(savedLineItem);
    }

    // 7. Return sale with line items
    const finalSale = await this.saleRepository.findById(savedSale.getId()!);
    if (!finalSale) {
      throw new Error('Failed to retrieve saved sale');
    }

    this.eventBus.publish(
      new SaleCreated(
        finalSale.getId()!,
        finalSale.getSaleNumber(),
        finalSale.getBranchId(),
        finalSale.getSoldBy(),
        finalSale.getTotalAmount(),
        finalSale.getLineItems().map((item) => ({
          variantId: item.getVariantId(),
          variantName: item.getVariantName(),
          quantity: item.getQuantity(),
          unitPrice: item.getUnitPrice(),
        })),
        finalSale.getCustomerId(),
      ),
    );

    return finalSale;
  }

  private async assertStockAvailable(
    lineItems: CreateSaleCommand['lineItems'],
  ): Promise<void> {
    const totals = new Map<number, number>();
    for (const item of lineItems) {
      totals.set(item.variantId, (totals.get(item.variantId) ?? 0) + item.quantity);
    }

    for (const [variantId, requested] of totals) {
      const inventories = await this.inventoryRepository.findByVariant(variantId);
      const available = inventories.reduce(
        (sum, inv) => sum + inv.getAvailableQuantity(),
        0,
      );

      if (available < requested) {
        const variant = await this.productVariantRepository.findById(variantId);
        const label = variant?.getVariantName() ?? `Variant #${variantId}`;
        throw new BadRequestException(
          `Not enough stock for "${label}". Requested ${requested}, only ${available} available across all warehouses.`,
        );
      }
    }
  }

  private async generateSaleNumber(): Promise<string> {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const datePrefix = `SAL-${year}-${month}-${day}`;

    const startOfDay = new Date(year, today.getMonth(), today.getDate(), 0, 0, 0);
    const endOfDay = new Date(year, today.getMonth(), today.getDate(), 23, 59, 59);

    const count = await this.saleEntityRepository
      .createQueryBuilder('sale')
      .where('sale.soldAt >= :start AND sale.soldAt <= :end', {
        start: startOfDay,
        end: endOfDay,
      })
      .withDeleted()
      .getCount();

    const sequence = String(count + 1).padStart(3, '0');
    return `${datePrefix}-${sequence}`;
  }
}

export default CreateSaleHandler;
