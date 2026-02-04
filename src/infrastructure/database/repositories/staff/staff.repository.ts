import { Injectable } from "@nestjs/common";
import Staff from "src/domain/staff/staff";
import StaffEntity from "../../entities/staff.entity";

@Injectable()
abstract class StaffRepository {
  abstract findById(id: number): Promise<Staff | null>;
  abstract findByPhoneNumber(phoneNumber: string): Promise<Staff | null>;
  abstract findByEmail(email: string): Promise<Staff | null>;
  abstract findAll(): Promise<Staff[]>;
  abstract commit(staff: Staff): Promise<Staff>;
  abstract toDomain(entity: StaffEntity): Staff;
  abstract findForBranch(branchId: number): Promise<Staff[]>;
  abstract delete(id: number): Promise<void>;
}

export default StaffRepository;