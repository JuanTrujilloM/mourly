import { PrismaService } from '../../config/prisma.service';
import { AdminModerationService } from './admin-moderation.service';

function setup(feedback: unknown[] = [], reports: unknown[] = []) {
  const prisma = {
    feedback: { findMany: jest.fn().mockResolvedValue(feedback) },
    report: { findMany: jest.fn().mockResolvedValue(reports) },
  } as unknown as PrismaService;
  return new AdminModerationService(prisma);
}

describe('AdminModerationService', () => {
  describe('listFeedback', () => {
    it('flattens the user and venue names', async () => {
      const service = setup([
        {
          id: 'f1',
          occurred: true,
          rating: 5,
          comments: 'Genial',
          noShowReason: null,
          amountSpent: 40000,
          createdAt: new Date('2026-07-12'),
          user: { email: 'ana@eafit.edu.co', profile: { name: 'Ana' } },
          date: {
            venue: { name: 'Pergamino' },
            scheduledAt: new Date('2026-07-11'),
          },
        },
      ]);

      const [entry] = await service.listFeedback();

      expect(entry).toMatchObject({
        id: 'f1',
        userName: 'Ana',
        venueName: 'Pergamino',
      });
    });

    it('falls back to the email when the profile is missing', async () => {
      const service = setup([
        {
          id: 'f1',
          occurred: false,
          rating: null,
          comments: null,
          noShowReason: 'No pude',
          amountSpent: null,
          createdAt: new Date(),
          user: { email: 'ana@eafit.edu.co', profile: null },
          date: { venue: { name: 'Velvet' }, scheduledAt: new Date() },
        },
      ]);

      expect((await service.listFeedback())[0].userName).toBe(
        'ana@eafit.edu.co',
      );
    });

    it('returns an empty list when there is no feedback', async () => {
      expect(await setup().listFeedback()).toEqual([]);
    });
  });

  describe('listReports', () => {
    it('summarizes the reporter and the reported user', async () => {
      const service = setup(
        [],
        [
          {
            id: 'r1',
            createdAt: new Date('2026-07-12'),
            userA: {
              id: 'u1',
              email: 'a@eafit.edu.co',
              profile: { name: 'Ana', university: 'EAFIT' },
            },
            userB: {
              id: 'u2',
              email: 'b@ces.edu.co',
              profile: { name: 'Beto', university: 'CES' },
            },
          },
        ],
      );

      const [report] = await service.listReports();

      expect(report.reporter.name).toBe('Ana');
      expect(report.reported.name).toBe('Beto');
    });

    it('returns an empty list when there are no reports', async () => {
      expect(await setup().listReports()).toEqual([]);
    });
  });
});
