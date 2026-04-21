import Activity from 'src/domain/activity/activity';
import ActivityEntity from '../../entities/activity.entity';

abstract class ActivityRepository {
  abstract commit(activity: Activity): Promise<Activity>;
  abstract toDomain(entity: ActivityEntity): Activity;
}

export default ActivityRepository;
