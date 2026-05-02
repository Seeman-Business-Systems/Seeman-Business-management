import { baseApi } from './baseApi';
import type {
  ReportArgs,
  SalesReport,
  ExpensesReport,
  InventoryReport,
  ProductsReport,
  CustomersReport,
  StaffReport,
} from '../../types/reports';

const buildParams = ({ dateFrom, dateTo, branchId }: ReportArgs) => {
  const p = new URLSearchParams({ dateFrom, dateTo });
  if (branchId) p.append('branchId', branchId.toString());
  return p.toString();
};

const buildInventoryParams = ({ branchId }: Pick<ReportArgs, 'branchId'>) => {
  const p = new URLSearchParams();
  if (branchId) p.append('branchId', branchId.toString());
  return p.toString();
};

export const reportsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSalesReport: builder.query<SalesReport, ReportArgs>({
      query: (args) => `/analytics/reports/sales?${buildParams(args)}`,
    }),
    getExpensesReport: builder.query<ExpensesReport, ReportArgs>({
      query: (args) => `/analytics/reports/expenses?${buildParams(args)}`,
    }),
    getInventoryReport: builder.query<InventoryReport, Pick<ReportArgs, 'branchId'>>({
      query: (args) => `/analytics/reports/inventory?${buildInventoryParams(args)}`,
    }),
    getProductsReport: builder.query<ProductsReport, ReportArgs>({
      query: (args) => `/analytics/reports/products?${buildParams(args)}`,
    }),
    getCustomersReport: builder.query<CustomersReport, ReportArgs>({
      query: (args) => `/analytics/reports/customers?${buildParams(args)}`,
    }),
    getStaffReport: builder.query<StaffReport, ReportArgs>({
      query: (args) => `/analytics/reports/staff?${buildParams(args)}`,
    }),
  }),
});

export const {
  useGetSalesReportQuery,
  useGetExpensesReportQuery,
  useGetInventoryReportQuery,
  useGetProductsReportQuery,
  useGetCustomersReportQuery,
  useGetStaffReportQuery,
} = reportsApi;
