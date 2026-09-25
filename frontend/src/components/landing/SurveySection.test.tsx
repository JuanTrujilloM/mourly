import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SurveySection } from './SurveySection';

describe('SurveySection', () => {
  it('pairs every finding with what the product does about it', () => {
    render(<SurveySection />);

    expect(screen.getAllByRole('listitem')).toHaveLength(3);
    expect(screen.getByText('El jueves ves su perfil.')).toBeInTheDocument();
  });

  it('cites the survey the figures come from', () => {
    render(<SurveySection />);

    expect(screen.getByText(/141 estudiantes/)).toBeInTheDocument();
  });
});
