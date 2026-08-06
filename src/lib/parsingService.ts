// Thin client for the FastAPI resume-parsing service. Next.js is the only
// thing that ever calls this — the browser never talks to FastAPI
// directly, and FastAPI never talks to Postgres directly. Keeping that
// boundary strict is what let each side be built and reasoned about
// independently.

const PARSING_SERVICE_URL = process.env.PARSING_SERVICE_URL!;
const PARSING_SERVICE_TOKEN = process.env.PARSING_SERVICE_TOKEN; // optional shared secret

interface RoleRequirements {
  title: string;
  required_skills: string[];
  min_years_experience: number;
  description: string;
  skills_weight: number;
}

interface CandidateFileRef {
  candidate_id: string;
  file_url: string;
  file_name: string;
}

interface ParsedProfile {
  name: string;
  email: string;
  phone: string;
  skills: string[];
  years_experience: number;
  tech_stack: string[];
  summary: string;
}

/**
 * Re-score an already-parsed candidate against (possibly updated) role
 * requirements. Reuses the stored profile — no file fetch, no re-parse.
 */
export async function scoreOne(params: {
  parsed: ParsedProfile;
  role: RoleRequirements;
}): Promise<{ score: number; reasoning: string }> {
  const res = await fetch(`${PARSING_SERVICE_URL}/score`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(PARSING_SERVICE_TOKEN
        ? { Authorization: `Bearer ${PARSING_SERVICE_TOKEN}` }
        : {}),
    },
    body: JSON.stringify({ parsed: params.parsed, role: params.role }),
  });

  if (!res.ok) {
    throw new Error(`Parsing service rejected score: ${res.status}`);
  }

  return res.json();
}

export async function startBatch(params: {
  batchId: string;
  role: RoleRequirements;
  candidates: CandidateFileRef[];
  callbackUrl: string;
  batchCompleteUrl: string;
}) {
  const res = await fetch(`${PARSING_SERVICE_URL}/batches/start`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(PARSING_SERVICE_TOKEN
        ? { Authorization: `Bearer ${PARSING_SERVICE_TOKEN}` }
        : {}),
    },
    body: JSON.stringify({
      batch_id: params.batchId,
      role: params.role,
      candidates: params.candidates,
      callback_url: params.callbackUrl,
      batch_complete_url: params.batchCompleteUrl,
    }),
  });

  if (!res.ok) {
    throw new Error(`Parsing service rejected batch start: ${res.status}`);
  }

  return res.json();
}
