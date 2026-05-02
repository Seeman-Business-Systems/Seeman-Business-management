import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

export interface ReportFilters {
  dateFrom: string;
  dateTo: string;
  branchId?: number;
}

@Injectable()
export class ReportsQuery {
  constructor(private readonly dataSource: DataSource) {}

  async getSalesReport(filters: ReportFilters) {
    const { dateFrom, dateTo, branchId } = filters;
    const bp = branchId ?? null;

    const [summaryRows, byBranch, byPaymentStatus, rows] = await Promise.all([
      this.dataSource.query(
        `SELECT
           COUNT(*)::int AS total_sales,
           COALESCE(SUM(total_amount), 0)::numeric AS total_revenue,
           COALESCE(AVG(total_amount), 0)::numeric AS avg_order_value,
           COUNT(*) FILTER (WHERE payment_status = 'PAID')::int AS paid_count,
           COUNT(*) FILTER (WHERE payment_status = 'PARTIAL')::int AS partial_count,
           COUNT(*) FILTER (WHERE payment_status = 'PENDING')::int AS pending_count,
           COALESCE(SUM(total_amount) FILTER (WHERE payment_status IN ('PENDING','PARTIAL')), 0)::numeric AS outstanding_amount
         FROM sales
         WHERE status != 'CANCELLED'
           AND sold_at >= $1::date AND sold_at < $2::date + INTERVAL '1 day'
           AND ($3::int IS NULL OR branch_id = $3::int)`,
        [dateFrom, dateTo, bp],
      ),
      this.dataSource.query(
        `SELECT b.name AS branch_name, COUNT(s.id)::int AS sales_count,
                COALESCE(SUM(s.total_amount), 0)::numeric AS revenue
         FROM sales s
         JOIN branches b ON b.id = s.branch_id
         WHERE s.status != 'CANCELLED'
           AND s.sold_at >= $1::date AND s.sold_at < $2::date + INTERVAL '1 day'
           AND ($3::int IS NULL OR s.branch_id = $3::int)
         GROUP BY b.id, b.name
         ORDER BY revenue DESC`,
        [dateFrom, dateTo, bp],
      ),
      this.dataSource.query(
        `SELECT payment_status, COUNT(*)::int AS count,
                COALESCE(SUM(total_amount), 0)::numeric AS amount
         FROM sales
         WHERE status != 'CANCELLED'
           AND sold_at >= $1::date AND sold_at < $2::date + INTERVAL '1 day'
           AND ($3::int IS NULL OR branch_id = $3::int)
         GROUP BY payment_status`,
        [dateFrom, dateTo, bp],
      ),
      this.dataSource.query(
        `SELECT s.id, s.sale_number, s.total_amount::numeric, s.payment_status,
                s.payment_method, s.sold_at,
                b.name AS branch_name,
                CONCAT(st.first_name, ' ', st.last_name) AS sold_by_name,
                c.name AS customer_name
         FROM sales s
         JOIN branches b ON b.id = s.branch_id
         JOIN staff st ON st.id = s.sold_by
         LEFT JOIN customers c ON c.id = s.customer_id
         WHERE s.status != 'CANCELLED'
           AND s.sold_at >= $1::date AND s.sold_at < $2::date + INTERVAL '1 day'
           AND ($3::int IS NULL OR s.branch_id = $3::int)
         ORDER BY s.sold_at DESC`,
        [dateFrom, dateTo, bp],
      ),
    ]);

    const s = summaryRows[0];
    return {
      summary: {
        totalSales: s.total_sales,
        totalRevenue: Number(s.total_revenue),
        avgOrderValue: Number(s.avg_order_value),
        paidCount: s.paid_count,
        partialCount: s.partial_count,
        pendingCount: s.pending_count,
        outstandingAmount: Number(s.outstanding_amount),
      },
      byBranch: byBranch.map((r: any) => ({
        branchName: r.branch_name,
        salesCount: r.sales_count,
        revenue: Number(r.revenue),
      })),
      byPaymentStatus: byPaymentStatus.map((r: any) => ({
        status: r.payment_status,
        count: r.count,
        amount: Number(r.amount),
      })),
      rows: rows.map((r: any) => ({
        id: r.id,
        saleNumber: r.sale_number,
        totalAmount: Number(r.total_amount),
        paymentStatus: r.payment_status,
        paymentMethod: r.payment_method,
        soldAt: r.sold_at,
        branchName: r.branch_name,
        soldByName: r.sold_by_name,
        customerName: r.customer_name ?? '—',
      })),
    };
  }

  async getExpensesReport(filters: ReportFilters) {
    const { dateFrom, dateTo, branchId } = filters;
    const bp = branchId ?? null;

    const [summaryRows, byCategory, byBranch, rows] = await Promise.all([
      this.dataSource.query(
        `SELECT COALESCE(SUM(amount), 0)::numeric AS total_expenses,
                COUNT(*)::int AS total_count
         FROM expenses
         WHERE date >= $1::date AND date < $2::date + INTERVAL '1 day'
           AND ($3::int IS NULL OR branch_id = $3::int)`,
        [dateFrom, dateTo, bp],
      ),
      this.dataSource.query(
        `SELECT category, COALESCE(SUM(amount), 0)::numeric AS amount, COUNT(*)::int AS count
         FROM expenses
         WHERE date >= $1::date AND date < $2::date + INTERVAL '1 day'
           AND ($3::int IS NULL OR branch_id = $3::int)
         GROUP BY category
         ORDER BY amount DESC`,
        [dateFrom, dateTo, bp],
      ),
      this.dataSource.query(
        `SELECT b.name AS branch_name, COALESCE(SUM(e.amount), 0)::numeric AS amount,
                COUNT(*)::int AS count
         FROM expenses e
         JOIN branches b ON b.id = e.branch_id
         WHERE e.date >= $1::date AND e.date < $2::date + INTERVAL '1 day'
           AND ($3::int IS NULL OR e.branch_id = $3::int)
         GROUP BY b.id, b.name
         ORDER BY amount DESC`,
        [dateFrom, dateTo, bp],
      ),
      this.dataSource.query(
        `SELECT e.id, e.amount::numeric, e.category, e.description, e.date, e.notes,
                b.name AS branch_name,
                CONCAT(st.first_name, ' ', st.last_name) AS recorded_by_name
         FROM expenses e
         JOIN branches b ON b.id = e.branch_id
         JOIN staff st ON st.id = e.recorded_by
         WHERE e.date >= $1::date AND e.date < $2::date + INTERVAL '1 day'
           AND ($3::int IS NULL OR e.branch_id = $3::int)
         ORDER BY e.date DESC`,
        [dateFrom, dateTo, bp],
      ),
    ]);

    const sm = summaryRows[0];
    return {
      summary: {
        totalExpenses: Number(sm.total_expenses),
        totalCount: sm.total_count,
      },
      byCategory: byCategory.map((r: any) => ({
        category: r.category,
        amount: Number(r.amount),
        count: r.count,
      })),
      byBranch: byBranch.map((r: any) => ({
        branchName: r.branch_name,
        amount: Number(r.amount),
        count: r.count,
      })),
      rows: rows.map((r: any) => ({
        id: r.id,
        amount: Number(r.amount),
        category: r.category,
        description: r.description,
        date: r.date,
        notes: r.notes,
        branchName: r.branch_name,
        recordedByName: r.recorded_by_name,
      })),
    };
  }

  async getInventoryReport(filters: Pick<ReportFilters, 'branchId'>) {
    const bp = filters.branchId ?? null;

    const [summaryRows, rows] = await Promise.all([
      this.dataSource.query(
        `SELECT
           COUNT(*)::int AS total_items,
           COALESCE(SUM(i.total_quantity), 0)::int AS total_stock,
           COUNT(*) FILTER (WHERE i.minimum_quantity > 0 AND i.total_quantity <= i.minimum_quantity)::int AS low_stock_count,
           COUNT(*) FILTER (WHERE i.total_quantity = 0)::int AS out_of_stock_count
         FROM inventory i
         JOIN warehouses w ON w.id = i.warehouse_id
         WHERE ($1::int IS NULL OR w.branch_id = $1::int)`,
        [bp],
      ),
      this.dataSource.query(
        `SELECT
           pv.variant_name, p.name AS product_name,
           w.name AS warehouse_name, b.name AS branch_name,
           i.total_quantity, i.minimum_quantity, i.maximum_quantity,
           i.total_quantity AS available_quantity,
           CASE WHEN i.minimum_quantity > 0 AND i.total_quantity <= i.minimum_quantity
                THEN true ELSE false END AS is_low_stock
         FROM inventory i
         JOIN product_variants pv ON pv.id = i.variant_id
         JOIN products p ON p.id = pv.product_id
         JOIN warehouses w ON w.id = i.warehouse_id
         JOIN branches b ON b.id = w.branch_id
         WHERE ($1::int IS NULL OR w.branch_id = $1::int)
         ORDER BY is_low_stock DESC, p.name, pv.variant_name`,
        [bp],
      ),
    ]);

    const sm = summaryRows[0];
    return {
      summary: {
        totalItems: sm.total_items,
        totalStock: sm.total_stock,
        lowStockCount: sm.low_stock_count,
        outOfStockCount: sm.out_of_stock_count,
      },
      rows: rows.map((r: any) => ({
        variantName: r.variant_name,
        productName: r.product_name,
        warehouseName: r.warehouse_name,
        branchName: r.branch_name,
        totalQuantity: Number(r.total_quantity),
        minimumQuantity: Number(r.minimum_quantity),
        maximumQuantity: Number(r.maximum_quantity),
        availableQuantity: Number(r.available_quantity),
        isLowStock: r.is_low_stock,
      })),
    };
  }

  async getProductsReport(filters: ReportFilters) {
    const { dateFrom, dateTo, branchId } = filters;
    const bp = branchId ?? null;

    const rows = await this.dataSource.query(
      `SELECT
         pv.variant_name, p.name AS product_name,
         SUM(sli.quantity)::int AS total_qty_sold,
         COALESCE(SUM(sli.line_total), 0)::numeric AS total_revenue,
         COUNT(DISTINCT s.id)::int AS order_count
       FROM sale_line_items sli
       JOIN product_variants pv ON pv.id = sli.variant_id
       JOIN products p ON p.id = pv.product_id
       JOIN sales s ON s.id = sli.sale_id
       WHERE s.status != 'CANCELLED'
         AND s.sold_at >= $1::date AND s.sold_at < $2::date + INTERVAL '1 day'
         AND ($3::int IS NULL OR s.branch_id = $3::int)
       GROUP BY pv.id, pv.variant_name, p.id, p.name
       ORDER BY total_revenue DESC`,
      [dateFrom, dateTo, bp],
    );

    return {
      summary: {
        totalRevenue: rows.reduce((sum: number, r: any) => sum + Number(r.total_revenue), 0),
        totalProductsSold: rows.length,
        totalUnitsSold: rows.reduce((sum: number, r: any) => sum + Number(r.total_qty_sold), 0),
      },
      rows: rows.map((r: any) => ({
        variantName: r.variant_name,
        productName: r.product_name,
        totalQtySold: Number(r.total_qty_sold),
        totalRevenue: Number(r.total_revenue),
        orderCount: Number(r.order_count),
      })),
    };
  }

  async getCustomersReport(filters: ReportFilters) {
    const { dateFrom, dateTo, branchId } = filters;
    const bp = branchId ?? null;

    const [summaryRows, rows] = await Promise.all([
      this.dataSource.query(
        `SELECT COUNT(*)::int AS total_customers,
                COALESCE(SUM(outstanding_balance), 0)::numeric AS total_outstanding
         FROM customers`,
      ),
      this.dataSource.query(
        `SELECT
           c.id, c.name, c.email, c.phone,
           c.credit_limit::numeric, c.outstanding_balance::numeric,
           COUNT(s.id)::int AS total_orders,
           COALESCE(SUM(s.total_amount), 0)::numeric AS total_revenue
         FROM customers c
         LEFT JOIN sales s ON s.customer_id = c.id
           AND s.status != 'CANCELLED'
           AND s.sold_at >= $1::date AND s.sold_at < $2::date + INTERVAL '1 day'
           AND ($3::int IS NULL OR s.branch_id = $3::int)
         GROUP BY c.id, c.name, c.email, c.phone, c.credit_limit, c.outstanding_balance
         ORDER BY total_revenue DESC, c.name`,
        [dateFrom, dateTo, bp],
      ),
    ]);

    const sm = summaryRows[0];
    return {
      summary: {
        totalCustomers: sm.total_customers,
        totalOutstanding: Number(sm.total_outstanding),
      },
      rows: rows.map((r: any) => ({
        id: r.id,
        name: r.name,
        email: r.email ?? '—',
        phone: r.phone ?? '—',
        creditLimit: Number(r.credit_limit),
        outstandingBalance: Number(r.outstanding_balance),
        totalOrders: r.total_orders,
        totalRevenue: Number(r.total_revenue),
      })),
    };
  }

  async getStaffReport(filters: ReportFilters) {
    const { dateFrom, dateTo, branchId } = filters;
    const bp = branchId ?? null;

    const rows = await this.dataSource.query(
      `SELECT
         CONCAT(st.first_name, ' ', st.last_name) AS staff_name,
         b.name AS branch_name,
         COUNT(s.id)::int AS sales_count,
         COALESCE(SUM(s.total_amount), 0)::numeric AS total_revenue,
         COALESCE(AVG(s.total_amount), 0)::numeric AS avg_sale_value
       FROM staff st
       LEFT JOIN branches b ON b.id = st.branch_id
       LEFT JOIN sales s ON s.sold_by = st.id
         AND s.status != 'CANCELLED'
         AND s.sold_at >= $1::date AND s.sold_at < $2::date + INTERVAL '1 day'
         AND ($3::int IS NULL OR s.branch_id = $3::int)
       WHERE ($3::int IS NULL OR st.branch_id = $3::int)
       GROUP BY st.id, st.first_name, st.last_name, b.name
       ORDER BY total_revenue DESC`,
      [dateFrom, dateTo, bp],
    );

    return {
      rows: rows.map((r: any) => ({
        staffName: r.staff_name,
        branchName: r.branch_name ?? '—',
        salesCount: r.sales_count,
        totalRevenue: Number(r.total_revenue),
        avgSaleValue: Number(r.avg_sale_value),
      })),
    };
  }
}
