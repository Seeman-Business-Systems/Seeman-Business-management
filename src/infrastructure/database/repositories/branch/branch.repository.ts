import { Injectable } from '@nestjs/common';
import Branch from 'src/domain/branch/branch';
import BranchEntity from '../../entities/branch.entity';

@Injectable()
abstract class BranchRepository {
  abstract findById(id: number): Promise<Branch | null>;
  abstract findByState(state: string): Promise<Branch[]>;
  abstract findAll(): Promise<Branch[]>;
  abstract delete(id: number): Promise<void>;
  abstract restore(id: number): Promise<Branch>;
  abstract commit(branch: Branch): Promise<Branch>;
  abstract toDomain(entity: BranchEntity): Branch;
}

export default BranchRepository;
