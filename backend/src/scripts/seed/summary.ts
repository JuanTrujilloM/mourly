import { HOBBY_CATALOG } from './data/hobbies';
import { STUDENTS } from './data/students';
import { VENUES } from './data/venues';
import { MATCHES } from './data/matches';

export function logSummary(seededMatches: boolean): void {
  console.log('Seed complete:');
  console.log(`  ${STUDENTS.length} students (verified, full profiles)`);
  console.log(`  ${VENUES.length} venues (Medellín + Bogotá)`);
  console.log(`  ${Object.keys(HOBBY_CATALOG).length} hobbies`);
  console.log(
    seededMatches
      ? `  ${MATCHES.length} matches across statuses + 2 reports`
      : '  0 matches (pool left unmatched — run the weekly matcher to create them)',
  );
  console.log('');
  if (!seededMatches) {
    console.log('To generate matches + availability links (HU-09):');
    console.log('  node dist/src/scripts/run-weekly-matching.js');
    console.log('  (links are logged by WhatsappSenderService in dev mode)');
    console.log(
      'Or seed the demo matches too: SEED_MATCHES=true npm run db:seed',
    );
    console.log('');
  }
  console.log('Primary test login: valentina.rios@eafit.edu.co');
  console.log('  1) POST /auth/login { email } → code is logged to the server');
  console.log('     console ([dev mail] ...) when SMTP is not configured.');
  console.log('  2) POST /auth/verify with that code to get a session.');
  console.log('Admin view: set ADMIN_EMAILS=valentina.rios@eafit.edu.co');
  console.log('Chatbot: message from cellphone +573001000001 (Valentina).');
}
