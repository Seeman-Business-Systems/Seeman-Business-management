import { Injectable } from "@nestjs/common";
import Role from "src/domain/role/role";

@Injectable()
abstract class RoleRepository {
  abstract findByIdOrName(id?: number, name?: string): Promise<Role | null>;
  abstract findAll(): Promise<Role[]>;
  abstract delete(id: number): Promise<void>;
  abstract commit(role: Role): Promise<Role>;
}

export default RoleRepository