import { Injectable } from '@nestjs/common';
import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { UniversitiesService } from '../../universities/universities.service';

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
    return 'Only verified university emails are accepted.';
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
