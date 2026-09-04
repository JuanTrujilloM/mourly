'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import {
  preferencesSchema,
  type PreferencesValues,
} from '@/lib/validation/preferences';
import { useCatalog } from '@/hooks/useCatalog';
import { useCreatePreferences } from '@/hooks/useCreatePreferences';
import { useMyPreferences } from '@/hooks/useMyPreferences';
import { getApiErrorMessage } from '@/lib/utils/errors';
import type { AuthUser } from '@/types/auth';
import type { PreferencesResponse } from '@/types/preferences';

export function usePreferencesForm(user: AuthUser, edit = false) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const {
    bounds: { ageMin, ageMax },
  } = useCatalog();
  const { mutateAsync, isPending } = useCreatePreferences();

  const { data: preferences, isLoading: isLoadingPreferences } =
    useMyPreferences(edit);

  const form = useForm<PreferencesValues>({
    resolver: zodResolver(preferencesSchema),
    defaultValues: {
      ageRange: { min: 20, max: 28 },
      hobbies: [],
      relationshipType: undefined,
      orientation: undefined,
      genderInterest: undefined,
      sameUniversity: undefined,
      heightRange: undefined,
      energyVibe: [],
    },
  });

  useEffect(() => {
    if (!edit && user.onboardingCompleted) router.replace('/dashboard');
  }, [edit, user.onboardingCompleted, router]);

  const { reset } = form;
  useEffect(() => {
    if (edit && preferences) reset(toFormValues(preferences));
  }, [edit, preferences, reset]);

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await mutateAsync(values);
      if (edit) {
        queryClient.invalidateQueries({ queryKey: ['myPreferences'] });
      }
      router.push('/dashboard');
    } catch (error) {
      form.setError('root', { message: getApiErrorMessage(error) });
    }
  });

  return {
    form,
    onSubmit,
    isPending,
    isLoadingPreferences,
    bounds: { min: ageMin, max: ageMax },
  };
}

function toFormValues(preferences: PreferencesResponse): PreferencesValues {
  return {
    ageRange: { min: preferences.minAge, max: preferences.maxAge },
    hobbies: preferences.hobbies,
    relationshipType:
      preferences.relationshipType as PreferencesValues['relationshipType'],
    orientation: preferences.orientation as PreferencesValues['orientation'],
    genderInterest:
      preferences.genderInterest as PreferencesValues['genderInterest'],
    sameUniversity: preferences.sameUniversity,
    heightRange: preferences.heightRange as PreferencesValues['heightRange'],
    energyVibe: preferences.energyVibe
      .split(',')
      .map((vibe) => vibe.trim())
      .filter(Boolean),
  };
}
