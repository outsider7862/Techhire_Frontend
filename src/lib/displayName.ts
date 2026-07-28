/**
 * Prefers the AI-extracted name from resume parsing; falls back to a
 * heuristic derived from the filename for candidates parsed before name
 * extraction existed (or if extraction genuinely came back empty).
 */
export function getCandidateDisplayName(candidate: {
    name?: string | null;
    fileName: string;
}): string {
    if (candidate.name && candidate.name.trim()) return candidate.name.trim();

    const base = candidate.fileName.replace(/\.(pdf|docx)$/i, "");
    return base
        .replace(/[_-]+/g, " ")
        .replace(/\b(resume|cv|final|updated|v\d+)\b/gi, "")
        .replace(/\s+/g, " ")
        .trim();
}