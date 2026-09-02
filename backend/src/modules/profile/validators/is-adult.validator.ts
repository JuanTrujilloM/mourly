import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { ageFrom } from '../../../common/utils/age';
import { MIN_AGE } from '../constants/profile-options';

@ValidatorConstraint({ name: 'isAdult', async: false })
export class IsAdultConstraint implements ValidatorConstraintInterface {
  validate(value: unknown): boolean {
    if (typeof value !== 'string') {
      return false;
    }
    const date = new Date(value);
    return !Number.isNaN(date.getTime()) && ageFrom(date) >= MIN_AGE;
  }

  defaultMessage(): string {
    return `User must be at least ${MIN_AGE} years old.`;
  }
}

export function IsAdult(options?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options,
      validator: IsAdultConstraint,
    });
  };
}
