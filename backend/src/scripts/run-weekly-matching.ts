import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { WeeklyMatchingService } from '../modules/matches/weekly-matching.service';
import { MatchInviteService } from '../modules/matches/match-invite.service';

async function main(): Promise<void> {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['log', 'warn', 'error'],
  });
  try {
    const weekly = app.get(WeeklyMatchingService);
    const pairs = await weekly.runWeeklyMatching();
    console.log(`Created ${pairs.length} match(es):`);
    for (const pair of pairs) {
      console.log(
        `  ${pair.userAId} <-> ${pair.userBId}  score=${pair.compatibilityScore}`,
      );
    }

    const invites = app.get(MatchInviteService);
    await invites.inviteForPairs(pairs);
  } finally {
    await app.close();
  }
}

void main();
