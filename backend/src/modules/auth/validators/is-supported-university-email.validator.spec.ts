import { UniversitiesService } from '../../universities/universities.service';
import { IsSupportedUniversityEmailConstraint } from './is-supported-university-email.validator';

function setup(supported: boolean) {
  const universities = {
    isSupportedEmail: jest.fn().mockResolvedValue(supported),
  };
  return {
    constraint: new IsSupportedUniversityEmailConstraint(
      universities as unknown as UniversitiesService,
    ),
    universities,
  };
}

describe('IsSupportedUniversityEmailConstraint', () => {
  it('accepts an email whose domain is registered and active', async () => {
    const { constraint } = setup(true);

    expect(await constraint.validate('ana@eafit.edu.co')).toBe(true);
  });

  it('rejects an email whose domain is not registered', async () => {
    const { constraint } = setup(false);

    expect(await constraint.validate('ana@gmail.com')).toBe(false);
  });

  it('rejects a non-string value without querying', async () => {
    const { constraint, universities } = setup(true);

    expect(await constraint.validate(42)).toBe(false);
    expect(universities.isSupportedEmail).not.toHaveBeenCalled();
  });

  it('explains the rule in its message', () => {
    expect(setup(true).constraint.defaultMessage()).toBe(
      'Only verified university emails are accepted.',
    );
  });
});
