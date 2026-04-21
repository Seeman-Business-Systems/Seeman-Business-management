import Supply from 'src/domain/supply/supply';
import SupplyEntity from '../../entities/supply.entity';

abstract class SupplyRepository {
  abstract findById(id: number): Promise<Supply | null>;
  abstract findBySale(saleId: number): Promise<Supply | null>;
  abstract commit(supply: Supply): Promise<Supply>;
  abstract toDomain(entity: SupplyEntity): Supply;
}

export default SupplyRepository;
