import { seedUsers } from './seedUsers';
import { seedCompliances } from './seedCompliances';
import { seedInspections } from './seedInspections';
import { seedKnowledge } from './seedKnowledge';
import { seedAuditLogs } from './seedAuditLogs';

const run = async () => {
  await seedUsers();
  await seedCompliances();
  await seedInspections();
  await seedKnowledge();
  await seedAuditLogs();
  process.exit(0);
};

run();
