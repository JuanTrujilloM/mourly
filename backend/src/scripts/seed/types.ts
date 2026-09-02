export interface StudentSeed {
  key: string;
  name: string;
  email: string;
  cellphone: string;
  gender: 'Masculino' | 'Femenino' | 'No binario' | 'Prefiero no decir';
  dateOfBirth: string;
  height: number;
  biography: string;
  university: string;
  major: string;
  semester: string;
  status: 'SEARCHING' | 'PAUSED';
  photos: string[];
  hobbies: string[];
  preferences: {
    relationshipType: string;
    orientation: string;
    minAge: number;
    maxAge: number;
    genderInterest: 'Hombres' | 'Mujeres' | 'No binario' | 'Todos';
    sameUniversity: boolean;
    heightRange: string;
    energyVibe: string[];
  };
}

export interface MatchSeed {
  id: string;
  a: string;
  b: string;
  compatibilityScore: number;
  status: 'pending' | 'confirmed' | 'completed' | 'canceled';
  createdAt: Date;
  venueOptionIds?: string[];
  aSelected?: string[];
  bSelected?: string[];
  availability?: { date: Date; slots: string[] };
  date?: {
    venueId: string;
    scheduledAt: Date;
    status: 'confirmed' | 'completed' | 'canceled';
    feedback?: {
      user: string;
      occurred: boolean;
      rating?: number;
      comments?: string;
      noShowReason?: string;
      amountSpent?: number;
    }[];
  };
}
