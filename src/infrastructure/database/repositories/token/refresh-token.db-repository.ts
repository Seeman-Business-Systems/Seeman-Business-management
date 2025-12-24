import RefreshToken from "src/domain/tokens/refresh-token";
import RefreshTokenEntity from "../../entities/refresh-tokens.entity";
import { IsNull, MoreThan, Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import RefreshTokenRepository from "./refresh-token.repository";
import { Injectable } from "@nestjs/common";

@Injectable()
class RefreshTokenDBRepository extends RefreshTokenRepository {
  constructor(
    @InjectRepository(RefreshTokenEntity)
    private readonly repository: Repository<RefreshTokenEntity>,
  ) {
    super();
  }

  async findByToken(token: string): Promise<RefreshToken | null> {
    const record = await this.repository.findOne({ where: { token } });

    if (!record) {
      return null;
    }

    return this.toDomain(record);
  }
    
    async findActiveByStaffId(staffId: number): Promise<RefreshToken[]> { 
    const records = await this.repository.find({ 
      where: { 
        staffId,
        revokedAt: IsNull(),
        expiresAt: MoreThan(new Date()),
      },
    });

    return records.map((entity: RefreshTokenEntity) => this.toDomain(entity));
  }

  async revoke(token: string): Promise<void> {
    await this.repository.update({ token }, { revokedAt: new Date() });
  }

  async commit(refreshToken: RefreshToken): Promise<RefreshToken> {
    const entity = Object.assign(new RefreshTokenEntity(), refreshToken);
    const savedEntity = await this.repository.save(entity);

    return this.toDomain(savedEntity);
  }

  private toDomain(entity: RefreshTokenEntity): RefreshToken {
    return new RefreshToken(
      entity.id,
      entity.token,
      entity.staffId,
      entity.expiresAt,
      entity.createdAt,
      entity.revokedAt,
    );
  }
}

export default RefreshTokenDBRepository;