import { Injectable } from '@nestjs/common';
import Brand from 'src/domain/product/brand';
import BrandEntity from '../../entities/brand.entity';

@Injectable()
abstract class BrandRepository {
  abstract findById(id: number): Promise<Brand | null>;
  abstract findByCode(code: string): Promise<Brand | null>;
  abstract findAll(): Promise<Brand[]>;
  abstract delete(id: number): Promise<void>;
  abstract restore(id: number): Promise<Brand>;
  abstract commit(brand: Brand): Promise<Brand>;
  abstract toDomain(entity: BrandEntity): Brand;
}

export default BrandRepository;
