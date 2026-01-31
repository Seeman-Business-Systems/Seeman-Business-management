import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import PasswordResetTokenEntity from 'src/infrastructure/database/entities/password-reset-token.entity';
import PasswordResetTokenDBRepository from 'src/infrastructure/database/repositories/token/password-reset-token.db-repository';
import PasswordResetTokenRepository from 'src/infrastructure/database/repositories/token/password-reset-token.repository';

@Module({
  imports: [TypeOrmModule.forFeature([PasswordResetTokenEntity])],
  providers: [
    {
      provide: PasswordResetTokenRepository,
      useClass: PasswordResetTokenDBRepository,
    },
  ],
  exports: [PasswordResetTokenRepository],
})
export class PasswordResetTokenModule {}
