import { Global, Module } from "@nestjs/common";
import { UsersService } from "./users.service";
import { DbModule } from "../db";
import { UserDependencies } from "./user/dependencies";

@Global()
@Module({
  imports: [DbModule],
  providers: [UsersService, UserDependencies],
  exports: [UsersService],
})
export class UsersModule {}