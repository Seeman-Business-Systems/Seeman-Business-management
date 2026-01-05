import { Controller, UseGuards } from "@nestjs/common";
import JwtAuthGuard from "src/modules/auth/guards/jwt-auth.guard";

@Controller('customers')
// @UseGuards(JwtAuthGuard)
class CustomerController {
    constructor(
        
    ) {}
}

export default CustomerController;