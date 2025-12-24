import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Type } from "class-transformer";
import RefreshTokenEntity from "src/infrastructure/database/entities/refresh-tokens.entity";
import RefreshTokenDBRepository from "src/infrastructure/database/repositories/token/refresh-token.db-repository";
import RefreshTokenRepository from "src/infrastructure/database/repositories/token/refresh-token.repository";

@Module({
    imports: [TypeOrmModule.forFeature([RefreshTokenEntity])],
    providers: [
        {
            provide: RefreshTokenRepository,
            useClass: RefreshTokenDBRepository,
        },
    ],
    exports: [RefreshTokenRepository],
})

export class RefreshTokenModule {}