export interface ProfilePhoto {
  id: string;
  url: string;
  file?: File;
}

export interface ProfilePhotoResponse {
  id: string;
  url: string;
  isPrimary: boolean;
}

export interface ProfileResponse {
  id: string;
  name: string;
  dateOfBirth: string;
  gender: string;
  height: number;
  biography: string;
  university: string;
  major: string;
  semester: string;
  status: string;
  photos: ProfilePhotoResponse[];
}
