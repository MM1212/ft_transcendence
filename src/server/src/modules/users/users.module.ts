import { Global, Module } from "@nestjs/common";
import { UsersService } from "./users.service";
import { DbModule } from "../db";
import { UserDependencies } from "./user/dependencies";
import { UsersController } from "./users.controller";
import { Auth42Module } from "../auth/42/auth.module";

@Global()
@Module({
  imports: [DbModule, Auth42Module],
  providers: [UsersService, UserDependencies],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}