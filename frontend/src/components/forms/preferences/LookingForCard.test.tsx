import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm } from 'react-hook-form';
import { describe, expect, it, vi } from 'vitest';
import type { PreferencesValues } from '@/lib/validation/preferences';
import { LookingForCard } from './LookingForCard';

vi.mock('@/hooks/useCatalog', () => ({
  useCatalog: () => ({
    genderInterests: ['Hombres', 'Mujeres', 'No binario'],
    heightRanges: ['Indiferente'],
  }),
}));

function Harness({ onRead }: { onRead: (values: PreferencesValues) => void }) {
  const form = useForm<PreferencesValues>({
    defaultValues: { genderInterests: [], hobbies: [], energyVibe: [] },
  });
  return (
    <>
      <LookingForCard form={form} />
      <button type="button" onClick={() => onRead(form.getValues())}>
        leer
      </button>
    </>
  );
}

describe('LookingForCard', () => {
  it('lets the user pick several genders at once', async () => {
    const onRead = vi.fn();
    render(<Harness onRead={onRead} />);

    await userEvent.click(screen.getByRole('button', { name: 'Mujeres' }));
    await userEvent.click(screen.getByRole('button', { name: 'No binario' }));
    await userEvent.click(screen.getByRole('button', { name: 'leer' }));

    expect(onRead.mock.calls[0][0].genderInterests).toEqual([
      'Mujeres',
      'No binario',
    ]);
    expect(screen.getByRole('button', { name: 'Mujeres' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('unselects a gender on a second click', async () => {
    const onRead = vi.fn();
    render(<Harness onRead={onRead} />);

    await userEvent.click(screen.getByRole('button', { name: 'Hombres' }));
    await userEvent.click(screen.getByRole('button', { name: 'Hombres' }));
    await userEvent.click(screen.getByRole('button', { name: 'leer' }));

    expect(onRead.mock.calls[0][0].genderInterests).toEqual([]);
  });
});
