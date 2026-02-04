import { Module } from "@nestjs/common";
import { ClaimsProvider } from "./claims.provider";
import { AuthGuard } from "./auth.guard";

@Module({
  providers: [ClaimsProvider, AuthGuard],
  exports: [AuthGuard],
})
export class AuthModule {}
