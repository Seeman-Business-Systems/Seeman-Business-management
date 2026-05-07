import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

export interface AnalyticsSummaryFilters {
  dateFrom: string;
  dateTo: string;
  branchId?: number;
}

const FIXED_6_MONTH_CHART_SQL = `
  WITH months AS (
    SELECT generate_series(
      date_trunc('month', NOW()) - INTERVAL '5 months',
      date_trunc('month', NOW()),
      INTERVAL '1 month'
    )::date AS period_start
  ),
  monthly_revenue AS (
    SELECT date_trunc('month', sold_at)::date AS period, SUM(total_amount)::numeric AS revenue
    FROM sales
    WHERE status != 'CANCELLED'
      AND ($1::int IS NULL OR branch_id = $1::int)
      AND sold_at >= date_trunc('month', NOW()) - INTERVAL '5 months'
    GROUP BY 1
  ),
  monthly_expenses AS (
    SELECT date_trunc('month', date)::date AS period, SUM(amount)::numeric AS expenses
    FROM expenses
    WHERE ($1::int IS NULL OR branch_id = $1::int)
      AND date >= date_trunc('month', NOW()) - INTERVAL '5 months'
    GROUP BY 1
  )
  SELECT
    to_char(m.period_start, 'YYYY-MM-DD') AS period,
    COALESCE(r.revenue, 0) AS revenue,
    COALESCE(e.expenses, 0) AS expenses
  FROM months m
  LEFT JOIN monthly_revenue r ON r.period = m.period_start
  LEFT JOIN monthly_expenses e ON e.period = m.period_start
  ORDER BY m.period_start
`;

@Injectable()
class AnalyticsSummaryQuery {
  constructor(private readonly dataSource: DataSource) {}

  async getSummary(filters: AnalyticsSummaryFilters) {
    const { dateFrom, dateTo, branchId } = filters;
    const bp = branchId ?? null;
    const [
      [revenueRow],
      [expensesRow],
      [pendingRow],
      [lowStockRow],
      [pendingSuppliesRow],
      chartData,
      topProducts,
      recentSales,
    ] = await Promise.all([
      this.dataSource.query(
        `SELECT COALESCE(SUM(total_amount), 0)::numeric AS revenue, COUNT(*)::int AS sales_count
         FROM sales
         WHERE status != 'CANCELLED'
           AND sold_at >= $1::date AND sold_at < $2::date + INTERVAL '1 day'
           AND ($3::int IS NULL OR branch_id = $3::int)`,
        [dateFrom, dateTo, bp],
      ),

      this.dataSource.query(
        `SELECT COALESCE(SUM(amount), 0)::numeric AS expenses
         FROM expenses
         WHERE date >= $1::date AND date < $2::date + INTERVAL '1 day'
           AND ($3::int IS NULL OR branch_id = $3::int)`,
        [dateFrom, dateTo, bp],
      ),

      this.dataSource.query(
        `SELECT COALESCE(SUM(s.total_amount - COALESCE(p.paid, 0)), 0)::numeric AS pending
         FROM sales s
         LEFT JOIN (
           SELECT sale_id, SUM(amount) AS paid
           FROM sale_payments
           GROUP BY sale_id
         ) p ON p.sale_id = s.id
         WHERE s.payment_status IN ('PENDING', 'PARTIAL')
           AND s.status != 'CANCELLED'
           AND ($1::int IS NULL OR s.branch_id = $1::int)`,
        [bp],
      ),

      this.dataSource.query(
        `SELECT COUNT(*)::int AS count
         FROM inventory
         WHERE minimum_quantity > 0 AND total_quantity <= minimum_quantity`,
      ),

      this.dataSource.query(
        `SELECT COUNT(*)::int AS count
         FROM supplies
         WHERE status = 'DRAFT'
           AND ($1::int IS NULL OR branch_id = $1::int)`,
        [bp],
      ),

      this.dataSource.query(FIXED_6_MONTH_CHART_SQL, [bp]),

      this.dataSource.query(
        `SELECT
           pv.variant_name,
           p.name AS product_name,
           SUM(sli.quantity)::int AS total_qty,
           SUM(sli.line_total)::numeric AS total_revenue
         FROM sale_line_items sli
         JOIN product_variants pv ON pv.id = sli.variant_id
         JOIN products p ON p.id = pv.product_id
         JOIN sales s ON s.id = sli.sale_id
         WHERE s.status != 'CANCELLED'
           AND s.sold_at >= $1::date AND s.sold_at < $2::date + INTERVAL '1 day'
           AND ($3::int IS NULL OR s.branch_id = $3::int)
         GROUP BY pv.id, pv.variant_name, p.name
         ORDER BY total_revenue DESC
         LIMIT 5`,
        [dateFrom, dateTo, bp],
      ),

      this.dataSource.query(
        `SELECT s.id, s.sale_number, s.total_amount::numeric, s.payment_status, s.sold_at,
                b.name AS branch_name,
                CONCAT(st.first_name, ' ', st.last_name) AS sold_by_name
         FROM sales s
         JOIN branches b ON b.id = s.branch_id
         JOIN staff st ON st.id = s.sold_by
         WHERE s.status != 'CANCELLED'
           AND s.sold_at >= $1::date AND s.sold_at < $2::date + INTERVAL '1 day'
           AND ($3::int IS NULL OR s.branch_id = $3::int)
         ORDER BY s.sold_at DESC
         LIMIT 5`,
        [dateFrom, dateTo, bp],
      ),
    ]);

    return {
      revenue: Number(revenueRow.revenue),
      expenses: Number(expensesRow.expenses),
      salesCount: Number(revenueRow.sales_count),
      pendingPayments: Number(pendingRow.pending),
      lowStockCount: Number(lowStockRow.count),
      pendingSupplies: Number(pendingSuppliesRow.count),
      granularity: 'monthly' as const,
      chartData: chartData.map((r: any) => ({
        period: r.period as string,
        revenue: Number(r.revenue),
        expenses: Number(r.expenses),
      })),
      topProducts: topProducts.map((r: any) => ({
        variantName: r.variant_name as string,
        productName: r.product_name as string,
        totalQty: Number(r.total_qty),
        totalRevenue: Number(r.total_revenue),
      })),
      recentSales: recentSales.map((r: any) => ({
        id: r.id as number,
        saleNumber: r.sale_number as string,
        totalAmount: Number(r.total_amount),
        paymentStatus: r.payment_status as string,
        soldAt: r.sold_at as string,
        branchName: r.branch_name as string,
        soldByName: r.sold_by_name as string,
      })),
    };
  }
}

export default AnalyticsSummaryQuery;
