import { Injectable } from "@nestjs/common";
import Staff from "src/domain/staff/staff";

@Injectable()
abstract class StaffRepository {
    abstract findById(id: number): Promise<Staff | null>;
    abstract findByPhoneNumber(phoneNumber: string): Promise<Staff | null>;
    abstract findByEmail(email: string): Promise<Staff | null>;
    abstract commit(staff: Staff): Promise<Staff>;
}

export default StaffRepository;