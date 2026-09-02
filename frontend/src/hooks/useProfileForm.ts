'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { profileSchema, type ProfileValues } from '@/lib/validation/profile';
import { useCreateProfile } from '@/hooks/useCreateProfile';
import { useMyProfile } from '@/hooks/useMyProfile';
import { getApiErrorMessage } from '@/lib/utils/errors';
import type { AuthUser } from '@/types/auth';
import {
  buildProfileFormData,
  toFormValues,
} from '@/lib/profile-form-mapper';

export function useProfileForm(user: AuthUser, edit = false) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { mutateAsync, isPending } = useCreateProfile();

  const { data: profile, isLoading: isLoadingProfile } = useMyProfile(edit);

  const form = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '',
      dateOfBirth: '',
      gender: undefined,
      height: undefined,
      photos: [],
      biography: '',
      major: '',
      semester: undefined,
    },
  });

  useEffect(() => {
    if (!edit && user.onboardingCompleted) router.replace('/dashboard');
  }, [edit, user.onboardingCompleted, router]);

  const { reset } = form;
  useEffect(() => {
    if (edit && profile) reset(toFormValues(profile));
  }, [edit, profile, reset]);

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await mutateAsync(buildProfileFormData(values));
      if (edit) {
        queryClient.invalidateQueries({ queryKey: ['myProfile'] });
        router.push('/dashboard');
      } else {
        router.push('/onboarding/intereses');
      }
    } catch (error) {
      form.setError('root', { message: getApiErrorMessage(error) });
    }
  });

  return {
    form,
    university: user.university,
    onSubmit,
    isPending,
    isLoadingProfile,
  };
}
