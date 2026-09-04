import { Injectable } from '@nestjs/common';
import { UniversitiesService } from '../universities/universities.service';
import {
  GENDERS,
  MAX_BIO_LENGTH,
  MAX_PHOTOS,
  MIN_AGE,
  SEMESTERS,
} from '../profile/constants/profile-options';
import {
  AGE_MAX,
  AGE_MIN,
  GENDER_INTERESTS,
  HEIGHT_RANGES,
  MIN_HOBBIES,
  MIN_VIBES,
  ORIENTATIONS,
  RELATIONSHIP_TYPES,
} from '../preferences/constants/preferences-options';
import { VENUE_TYPES } from './venue-types';

export interface Catalog {
  universities: { domain: string; name: string; city: string }[];
  genders: readonly string[];
  semesters: readonly string[];
  relationshipTypes: readonly string[];
  orientations: readonly string[];
  genderInterests: readonly string[];
  heightRanges: readonly string[];
  venueTypes: readonly string[];
  bounds: {
    minAge: number;
    ageMin: number;
    ageMax: number;
    maxPhotos: number;
    maxBioLength: number;
    minHobbies: number;
    minVibes: number;
  };
}

@Injectable()
export class CatalogService {
  constructor(private readonly universities: UniversitiesService) {}

  async get(): Promise<Catalog> {
    const active = await this.universities.findActive();

    return {
      universities: active.map((university) => ({
        domain: university.domain,
        name: university.name,
        city: university.city,
      })),
      genders: GENDERS,
      semesters: SEMESTERS,
      relationshipTypes: RELATIONSHIP_TYPES,
      orientations: ORIENTATIONS,
      genderInterests: GENDER_INTERESTS,
      heightRanges: HEIGHT_RANGES,
      venueTypes: VENUE_TYPES,
      bounds: {
        minAge: MIN_AGE,
        ageMin: AGE_MIN,
        ageMax: AGE_MAX,
        maxPhotos: MAX_PHOTOS,
        maxBioLength: MAX_BIO_LENGTH,
        minHobbies: MIN_HOBBIES,
        minVibes: MIN_VIBES,
      },
    };
  }
}
