import { Injectable, Logger } from '@nestjs/common';
import { reviewCodeFor } from '../../common/constants/review-account';
import { UniversitiesService } from '../universities/universities.service';

const UNIVERSITY_DOMAIN_WARNING =
  'REVIEW_ACCOUNT_EMAIL belongs to a university domain; the fixed code is ignored.';

@Injectable()
export class ReviewAccountService {
  private readonly logger = new Logger(ReviewAccountService.name);

  constructor(private readonly universities: UniversitiesService) {}

  async fixedCodeFor(email: string): Promise<string | null> {
    const code = reviewCodeFor(email);
    if (!code) return null;
    if (await this.universities.findByEmail(email)) {
      this.logger.warn(UNIVERSITY_DOMAIN_WARNING);
      return null;
    }
    return code;
  }

  async isReviewAccount(email: string): Promise<boolean> {
    return (await this.fixedCodeFor(email)) !== null;
  }
}
