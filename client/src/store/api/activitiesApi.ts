import { baseApi } from './baseApi';
import type { ActivityListResponse } from '../../types/activity';

interface GetActivitiesParams {
  actorId?: number;
  branchId?: number;
  warehouseId?: number;
  entityType?: string;
  entityId?: number;
  type?: string;
  dateFrom?: string;
  dateTo?: string;
  take?: number;
  skip?: number;
}

export const activitiesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getActivities: builder.query<ActivityListResponse, GetActivitiesParams>({
      query: (params) => {
        const search = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            search.set(key, String(value));
          }
        });
        return `/activities?${search.toString()}`;
      },
      providesTags: ['Activity'],
    }),
  }),
});

export const { useGetActivitiesQuery } = activitiesApi;
