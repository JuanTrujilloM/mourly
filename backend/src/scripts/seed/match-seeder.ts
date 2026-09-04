import { PrismaClient } from '../../generated/prisma/client';
import { MATCHES } from './data/matches';

export async function seedMatches(
  prisma: PrismaClient,
  ids: Map<string, { userId: string; profileId: string }>,
): Promise<void> {
  const userId = (key: string): string => ids.get(key)!.userId;

  for (const seed of MATCHES) {
    const aId = userId(seed.a);
    const bId = userId(seed.b);

    await prisma.match.create({
      data: {
        id: seed.id,
        userAId: aId,
        userBId: bId,
        compatibilityScore: seed.compatibilityScore,
        status: seed.status,
        createdAt: seed.createdAt,
      },
    });

    if (seed.venueOptionIds) {
      const aSel = new Set(seed.aSelected ?? []);
      const bSel = new Set(seed.bSelected ?? []);
      await prisma.venueOption.createMany({
        data: seed.venueOptionIds.map((venueId) => ({
          matchId: seed.id,
          userAId: aId,
          userBId: bId,
          venueId,
          userASelected: aSel.has(venueId),
          userBSelected: bSel.has(venueId),
        })),
      });
    }

    if (seed.availability) {
      const rows = [aId, bId].flatMap((uid) =>
        seed.availability!.slots.map((timeSlot) => ({
          matchId: seed.id,
          userId: uid,
          date: seed.availability!.date,
          timeSlot,
        })),
      );
      await prisma.availability.createMany({ data: rows });
    }

    if (seed.date) {
      const date = await prisma.date.create({
        data: {
          matchId: seed.id,
          venueId: seed.date.venueId,
          scheduledAt: seed.date.scheduledAt,
          status: seed.date.status,
        },
      });
      if (seed.date.feedback) {
        await prisma.feedback.createMany({
          data: seed.date.feedback.map((fb) => ({
            dateId: date.id,
            userId: userId(fb.user),
            occurred: fb.occurred,
            rating: fb.rating ?? null,
            comments: fb.comments ?? null,
            noShowReason: fb.noShowReason ?? null,
            amountSpent: fb.amountSpent ?? null,
          })),
        });
      }
    }
  }

  await prisma.report.create({
    data: { userAId: userId('sara'), userBId: userId('manuela') },
  });
  await prisma.report.create({
    data: { userAId: userId('camila'), userBId: userId('tomas') },
  });
}
