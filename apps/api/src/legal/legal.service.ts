import { Injectable } from "@nestjs/common";

@Injectable()
export class LegalService {
  canParticipate(): boolean {
    // TODO: add region gating, skill-based variants, no-purchase entry.
    return true;
  }
}
