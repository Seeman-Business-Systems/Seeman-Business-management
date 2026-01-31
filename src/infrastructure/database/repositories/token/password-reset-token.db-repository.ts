import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, MoreThan, Repository } from 'typeorm';
import PasswordResetToken from 'src/domain/tokens/password-reset-token';
import PasswordResetTokenEntity from '../../entities/password-reset-token.entity';
import PasswordResetTokenRepository from './password-reset-token.repository';

@Injectable()
class PasswordResetTokenDBRepository extends PasswordResetTokenRepository {
  constructor(
    @InjectRepository(PasswordResetTokenEntity)
    private readonly repository: Repository<PasswordResetTokenEntity>,
  ) {
    super();
  }

  async findByToken(token: string): Promise<PasswordResetToken | null> {
    const record = await this.repository.findOne({ where: { token } });

    if (!record) {
      return null;
    }

    return this.toDomain(record);
  }

  async findActiveByStaffId(staffId: number): Promise<PasswordResetToken | null> {
    const record = await this.repository.findOne({
      where: {
        staffId,
        usedAt: IsNull(),
        expiresAt: MoreThan(new Date()),
      },
      order: { createdAt: 'DESC' },
    });

    if (!record) {
      return null;
    }

    return this.toDomain(record);
  }

  async markAsUsed(token: string): Promise<void> {
    await this.repository.update({ token }, { usedAt: new Date() });
  }

  async invalidateAllForStaff(staffId: number): Promise<void> {
    await this.repository.update(
      { staffId, usedAt: IsNull() },
      { usedAt: new Date() },
    );
  }

  async commit(passwordResetToken: PasswordResetToken): Promise<PasswordResetToken> {
    const entity = Object.assign(new PasswordResetTokenEntity(), passwordResetToken);
    const savedEntity = await this.repository.save(entity);

    return this.toDomain(savedEntity);
  }

  private toDomain(entity: PasswordResetTokenEntity): PasswordResetToken {
    return new PasswordResetToken(
      entity.id,
      entity.token,
      entity.staffId,
      entity.expiresAt,
      entity.createdAt,
      entity.usedAt,
    );
  }
}

export default PasswordResetTokenDBRepository;
