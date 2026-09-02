import { GoneException, Injectable, NotFoundException } from '@nestjs/common';
import {
  AvailabilityLinkService,
  ValidatedLink,
} from '../availability-link/availability-link.service';

const EXPIRED_MESSAGE = 'Este enlace ya expiró.';
const CONSUMED_MESSAGE = 'Este enlace ya fue usado.';
const INVALID_MESSAGE = 'Este enlace no es válido.';

@Injectable()
export class AvailabilityLinkResolver {
  constructor(private readonly links: AvailabilityLinkService) {}

  async resolveOrThrow(token: string): Promise<ValidatedLink> {
    const result = await this.links.validate(token);
    switch (result.status) {
      case 'ok':
        return result.link;
      case 'expired':
        throw new GoneException(EXPIRED_MESSAGE);
      case 'consumed':
        throw new GoneException(CONSUMED_MESSAGE);
      default:
        throw new NotFoundException(INVALID_MESSAGE);
    }
  }

  async resolveForView(token: string): Promise<ValidatedLink | null> {
    const result = await this.links.validate(token);
    switch (result.status) {
      case 'ok':
        return result.link;
      case 'consumed':
        return null;
      case 'expired':
        throw new GoneException(EXPIRED_MESSAGE);
      default:
        throw new NotFoundException(INVALID_MESSAGE);
    }
  }
}
