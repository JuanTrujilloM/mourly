import type { ProfileValues } from '@/lib/validation/profile';
import type { ProfileResponse } from '@/types/profile';

export function toFormValues(profile: ProfileResponse): ProfileValues {
  const photos = [...profile.photos]
    .sort((a, b) => Number(b.isPrimary) - Number(a.isPrimary))
    .map((photo) => ({ id: photo.id, url: photo.url }));

  return {
    name: profile.name,
    dateOfBirth: profile.dateOfBirth.slice(0, 10),
    gender: profile.gender as ProfileValues['gender'],
    height: profile.height,
    photos,
    biography: profile.biography,
    major: profile.major,
    semester: profile.semester as ProfileValues['semester'],
  };
}

export function buildProfileFormData(values: ProfileValues): FormData {
  const data = new FormData();
  data.append('name', values.name);
  data.append('dateOfBirth', values.dateOfBirth);
  data.append('gender', values.gender);
  data.append('height', String(values.height));
  data.append('biography', values.biography);
  data.append('major', values.major);
  data.append('semester', values.semester);

  const manifest = values.photos.map((photo) => {
    if (photo.file) {
      data.append('photos', photo.file);
      return 'new';
    }
    return `keep:${photo.url}`;
  });
  data.append('photoManifest', JSON.stringify(manifest));

  return data;
}
