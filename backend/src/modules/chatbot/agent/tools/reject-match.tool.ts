import { Injectable } from '@nestjs/common';
import { MatchResponseService } from '../../../matches/match-response.service';

@Injectable()
export class RejectMatchTool {
  constructor(private readonly matchResponse: MatchResponseService) {}

  async run(userId: string): Promise<string> {
    const result = await this.matchResponse.reject(userId);
    return result === 'rejected' ? 'REJECTED' : 'NO_ACTIVE_MATCH';
  }
}
