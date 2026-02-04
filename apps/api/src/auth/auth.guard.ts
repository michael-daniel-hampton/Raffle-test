import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { Request } from "express";
import { ClaimsProvider } from "./claims.provider";

export type AuthUser = {
  aliasId: string;
  kycVerified: boolean;
};

type AuthenticatedRequest = Request & { user?: AuthUser };

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly claimsProvider: ClaimsProvider) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    if (process.env.NODE_ENV === "development") {
      const aliasId = request.header("X-DEV-ALIAS-ID");
      const kycVerified = request.header("X-DEV-KYC-VERIFIED");
      if (!aliasId) {
        throw new UnauthorizedException("Missing X-DEV-ALIAS-ID header");
      }
      request.user = {
        aliasId,
        kycVerified: kycVerified === "true",
      };
      return true;
    }

    const authHeader = request.header("Authorization") ?? "";
    const token = authHeader.replace(/^Bearer\s+/i, "");
    if (!token) {
      throw new UnauthorizedException("Missing bearer token");
    }

    const claims = await this.claimsProvider.verifyJwt(token);
    request.user = {
      aliasId: claims.aliasId,
      kycVerified: claims.kycVerified,
    };
    return true;
  }
}
