// Mirror of the backend's FlowProfileView (availability/flow-profile.service.ts).
export interface FlowPartner {
  firstName: string;
  age: number;
  university: string;
  major: string;
  semester: string;
  biography: string;
  photos: string[];
}

export interface OpenFlowProfile {
  step: 'VENUE' | 'AVAILABILITY';
  partner: FlowPartner;
  sharedHobbies: string[];
  closesAt: string;
}

export type FlowProfileView = OpenFlowProfile | { step: 'COMPLETED' };
