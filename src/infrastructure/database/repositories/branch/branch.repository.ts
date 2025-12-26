import { Injectable } from '@nestjs/common';
import Branch from 'src/domain/branch/branch';

@Injectable()
abstract class BranchRepository {
  abstract findById(id: number): Promise<Branch | null>;
  abstract findByState(state: string): Promise<Branch[]>;
  abstract findAll(): Promise<Branch[]>;
  abstract delete(id: number): Promise<void>;
  abstract restore(id: number): Promise<Branch>;
  abstract commit(branch: Branch): Promise<Branch>;
}

export default BranchRepository;
