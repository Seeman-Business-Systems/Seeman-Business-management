import ActivityType from 'src/domain/activity/activity-type';

export default interface ActivityFilters {
  actorId?: number;
  branchId?: number;
  warehouseId?: number;
  entityType?: string;
  entityId?: number;
  type?: ActivityType;
  dateFrom?: string;
  dateTo?: string;
  take?: number;
  skip?: number;
}
