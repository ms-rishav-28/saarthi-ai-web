import 'dotenv/config';
import { Annotation, END, START, StateGraph } from '@langchain/langgraph';
import { sql } from '../db/client.js';
import { getLangGraphCheckpointer } from '../supabase/checkpointers.js';

const SmokeState = Annotation.Root({
  value: Annotation<string>,
});

async function main() {
  const ping = await sql`select 1 as ok`;
  if (!ping?.[0]?.ok) {
    throw new Error('Neon ping failed');
  }

  const checkpointer = await getLangGraphCheckpointer();
  const graph = new StateGraph(SmokeState)
    .addNode('noop', async (state) => ({ value: state.value }))
    .addEdge(START, 'noop')
    .addEdge('noop', END)
    .compile({ checkpointer });

  const threadId = `neon-smoke-${Date.now()}`;
  await graph.invoke(
    { value: 'ok' },
    {
      configurable: {
        thread_id: threadId,
        checkpoint_ns: 'smoke',
      },
    },
  );

  console.log(`Neon smoke test passed. thread_id=${threadId}`);
}

main().catch((error) => {
  console.error('Neon smoke test failed', error);
  process.exit(1);
});
