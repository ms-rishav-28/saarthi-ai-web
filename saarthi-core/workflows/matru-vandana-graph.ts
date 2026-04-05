import { Annotation, END, START, StateGraph } from '@langchain/langgraph';
import { runCommunicationAgent } from '../agents/communication-agent.js';
import { runDocumentOrchestrator } from '../agents/document-orchestrator.js';
import { runEligibilityScout } from '../agents/eligibility-scout.js';
import { runSubmissionAgent } from '../agents/submission-agent.js';
import { runTrackerAgent } from '../agents/tracker-agent.js';
import { sql } from '../db/client.js';
import { getLangGraphCheckpointer } from '../supabase/checkpointers.js';

const StateAnnotation = Annotation.Root({
  whatsappNumber: Annotation<string>,
  incomingText: Annotation<string>,
  languageHint: Annotation<'hi' | 'mr'>,
  consentGranted: Annotation<boolean>,
  currentStep: Annotation<'eligibility' | 'doc_pull' | 'submission' | 'tracking' | 'done'>,
  schemeData: Annotation<Record<string, unknown> | null>,
  documents: Annotation<Record<string, unknown> | null>,
  submissionStatus: Annotation<Record<string, unknown> | null>,
  trackerLastCheck: Annotation<string | null>,
  replyMessage: Annotation<string | null>,
  shouldPauseForUser: Annotation<boolean>,
});

interface GraphInput {
  whatsappNumber: string;
  incomingText: string;
  languageHint: 'hi' | 'mr';
}

const checkpointer = await getLangGraphCheckpointer();

const graph = new StateGraph(StateAnnotation)
  .addNode('eligibility', async (state) => {
    const eligibility = await runEligibilityScout(state.incomingText, state.languageHint);
    await upsertWorkflowState(state.whatsappNumber, {
      current_step: 'eligibility',
      scheme_data: eligibility,
    });

    return {
      currentStep: 'eligibility',
      schemeData: eligibility as unknown as Record<string, unknown>,
      shouldPauseForUser: false,
      replyMessage: null,
    };
  })
  .addNode('document_orchestrator', async (state) => {
    if (!state.consentGranted) {
      const docState = await runDocumentOrchestrator(state.whatsappNumber);
      const message = `PM Matru Vandana ke liye consent zaroori hai. Kripya DigiLocker consent dein: ${docState.consentUrl}`;

      await upsertWorkflowState(state.whatsappNumber, {
        current_step: 'doc_pull',
        documents: { ...docState, status: 'consent_required' },
      });

      return {
        currentStep: 'doc_pull',
        documents: { ...docState, status: 'consent_required' },
        shouldPauseForUser: true,
        replyMessage: message,
      };
    }

    const docs = state.documents || {};
    const birthAvailable = Boolean((docs as Record<string, unknown>).birthCertificateAvailable);
    const bankAvailable = Boolean((docs as Record<string, unknown>).bankDocumentAvailable);

    if (!birthAvailable || !bankAvailable) {
      const missing = [!birthAvailable ? 'Birth Certificate' : null, !bankAvailable ? 'Bank Passbook' : null]
        .filter(Boolean)
        .join(', ');

      const message = `Document missing: ${missing}. Kripya WhatsApp par document bheje ya nearest CSC visit karein.`;

      await upsertWorkflowState(state.whatsappNumber, {
        current_step: 'doc_pull',
        documents: { ...docs, status: 'missing_docs', missing },
      });

      return {
        currentStep: 'doc_pull',
        shouldPauseForUser: true,
        replyMessage: message,
      };
    }

    await upsertWorkflowState(state.whatsappNumber, {
      current_step: 'submission',
    });

    return {
      currentStep: 'submission',
      shouldPauseForUser: false,
      replyMessage: null,
    };
  })
  .addNode('submission', async (state) => {
    const submission = await runSubmissionAgent({
      schemeData: state.schemeData,
      documents: state.documents,
      languageHint: state.languageHint,
    });

    const isFallback = submission.status === 'csc_fallback_booked';
    const message = isFallback
      ? 'Portal issue detect hua. CSC fallback booking create ho gayi hai. Hum tracking continue kar rahe hain.'
      : 'Aapka PM Matru Vandana application submit ho gaya hai.';

    await upsertWorkflowState(state.whatsappNumber, {
      current_step: 'submission',
      submission_status: submission,
    });

    return {
      currentStep: 'submission',
      submissionStatus: submission as Record<string, unknown>,
      replyMessage: message,
      shouldPauseForUser: false,
    };
  })
  .addNode('tracker', async (state) => {
    const referenceId = String((state.submissionStatus?.details as Record<string, unknown> | undefined)?.referenceId || 'pending');
    const tracking = await runTrackerAgent(referenceId);

    await upsertWorkflowState(state.whatsappNumber, {
      current_step: 'tracking',
      tracker_last_check: new Date().toISOString(),
    });

    return {
      currentStep: 'tracking',
      trackerLastCheck: new Date().toISOString(),
      replyMessage: `Tracking active. Next check: ${tracking.nextCheckAt}`,
      shouldPauseForUser: false,
    };
  })
  .addNode('communicate', async (state) => {
    if (state.replyMessage) {
      await runCommunicationAgent(state.whatsappNumber, state.replyMessage);
    }

    return {
      currentStep: state.shouldPauseForUser ? 'doc_pull' : 'done',
      replyMessage: null,
    };
  })
  .addEdge(START, 'eligibility')
  .addEdge('eligibility', 'document_orchestrator')
  .addConditionalEdges('document_orchestrator', (state) => {
    return state.shouldPauseForUser ? 'communicate' : 'submission';
  })
  .addEdge('submission', 'tracker')
  .addEdge('tracker', 'communicate')
  .addConditionalEdges('communicate', (state) => {
    return state.shouldPauseForUser ? END : END;
  })
  .compile({ checkpointer });

export async function runMatruVandanaGraph(input: GraphInput) {
  const existingState = await getWorkflowState(input.whatsappNumber);

  const result = await graph.invoke(
    {
      whatsappNumber: input.whatsappNumber,
      incomingText: input.incomingText,
      languageHint: input.languageHint,
      consentGranted: Boolean(existingState?.consent_granted),
      currentStep: (existingState?.current_step || 'eligibility') as 'eligibility' | 'doc_pull' | 'submission' | 'tracking' | 'done',
      schemeData: (existingState?.scheme_data || null) as Record<string, unknown> | null,
      documents: (existingState?.documents || null) as Record<string, unknown> | null,
      submissionStatus: (existingState?.submission_status || null) as Record<string, unknown> | null,
      trackerLastCheck: existingState?.tracker_last_check || null,
      replyMessage: null,
      shouldPauseForUser: false,
    },
    {
      configurable: {
        thread_id: input.whatsappNumber,
        checkpoint_ns: 'matru_vandana_phase0',
      },
    },
  );

  return result;
}

export async function markDigiLockerConsentComplete(
  whatsappNumber: string,
  documents: Record<string, unknown>,
  aadhaarLast4?: string,
) {
  await upsertWorkflowState(whatsappNumber, {
    consent_granted: true,
    current_step: 'doc_pull',
    user_aadhaar_last4: aadhaarLast4 || null,
    documents,
  });
}

async function getWorkflowState(whatsappNumber: string) {
  const rows = await sql`
    select *
    from workflow_state
    where whatsapp_number = ${whatsappNumber}
    limit 1
  `;

  return rows[0] as Record<string, any> | undefined;
}

async function upsertWorkflowState(whatsappNumber: string, patch: Record<string, unknown>) {
  await sql`
    insert into workflow_state (
      whatsapp_number,
      user_aadhaar_last4,
      consent_granted,
      current_step,
      scheme_data,
      documents,
      submission_status,
      tracker_last_check,
      retry_count
    ) values (
      ${whatsappNumber},
      ${patch.user_aadhaar_last4 ?? null},
      ${patch.consent_granted ?? null},
      ${patch.current_step ?? null},
      ${patch.scheme_data ? JSON.stringify(patch.scheme_data) : null}::jsonb,
      ${patch.documents ? JSON.stringify(patch.documents) : null}::jsonb,
      ${patch.submission_status ? JSON.stringify(patch.submission_status) : null}::jsonb,
      ${patch.tracker_last_check ?? null},
      ${patch.retry_count ?? null}
    )
    on conflict (whatsapp_number) do update
    set
      user_aadhaar_last4 = coalesce(excluded.user_aadhaar_last4, workflow_state.user_aadhaar_last4),
      consent_granted = coalesce(excluded.consent_granted, workflow_state.consent_granted),
      current_step = coalesce(excluded.current_step, workflow_state.current_step),
      scheme_data = coalesce(excluded.scheme_data, workflow_state.scheme_data),
      documents = coalesce(excluded.documents, workflow_state.documents),
      submission_status = coalesce(excluded.submission_status, workflow_state.submission_status),
      tracker_last_check = coalesce(excluded.tracker_last_check, workflow_state.tracker_last_check),
      retry_count = coalesce(excluded.retry_count, workflow_state.retry_count),
      updated_at = now()
  `;
}
