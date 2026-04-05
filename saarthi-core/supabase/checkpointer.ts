import { PostgresSaver } from '@langchain/langgraph-checkpoint-postgres';

let checkpointer: PostgresSaver | null = null;
let checkpointerReady: Promise<PostgresSaver> | null = null;

async function setupCheckpointer() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('Missing DATABASE_URL for Postgres checkpointer');
  }

  const saver = PostgresSaver.fromConnString(connectionString, { schema: 'public' });
  await saver.setup();
  checkpointer = saver;
  return saver;
}

export async function getLangGraphCheckpointer() {
  if (checkpointer) return checkpointer;
  if (!checkpointerReady) {
    checkpointerReady = setupCheckpointer();
  }
  return checkpointerReady;
}
