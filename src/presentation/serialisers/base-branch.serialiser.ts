import { Injectable } from '@nestjs/common';
import Branch from 'src/domain/branch/branch';

@Injectable()
export class BaseBranchSerialiser {
  serialise(branch: Branch) {
    if (!branch) return null;

    return {
      id: branch.getId(),
      name: branch.getName(),
    };
  }
}
