import SupplyItem from 'src/domain/supply/supply-item';
import SupplyItemEntity from '../../entities/supply-item.entity';

abstract class SupplyItemRepository {
  abstract commitMany(items: SupplyItem[]): Promise<SupplyItem[]>;
  abstract toDomain(entity: SupplyItemEntity): SupplyItem;
}

export default SupplyItemRepository;
