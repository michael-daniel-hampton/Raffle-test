import { Injectable } from "@nestjs/common";

export type Claims = {
  aliasId: string;
  kycVerified: boolean;
};

@Injectable()
export class ClaimsProvider {
  async verifyJwt(token: string): Promise<Claims> {
    if (!token) {
      throw new Error("Missing token");
    }
    // TODO: integrate with real IdP/JWKS validation.
    return {
      aliasId: "stubbed-alias",
      kycVerified: false,
    };
  }
}
