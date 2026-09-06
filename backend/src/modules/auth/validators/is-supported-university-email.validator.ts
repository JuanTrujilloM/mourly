import { Injectable } from '@nestjs/common';
import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { UniversitiesService } from '../../universities/universities.service';
import { UNSUPPORTED_UNIVERSITY_MESSAGE } from '../../universities/university-messages';

@Injectable()
@ValidatorConstraint({ name: 'isSupportedUniversityEmail', async: true })
export class IsSupportedUniversityEmailConstraint implements ValidatorConstraintInterface {
  constructor(private readonly universities: UniversitiesService) {}

  validate(value: unknown): Promise<boolean> {
    if (typeof value !== 'string') {
      return Promise.resolve(false);
    }
    return this.universities.isSupportedEmail(value);
  }

  defaultMessage(): string {
    return UNSUPPORTED_UNIVERSITY_MESSAGE;
  }
}

export function IsSupportedUniversityEmail(
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsSupportedUniversityEmailConstraint,
    });
  };
}
