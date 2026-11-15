import { RetrievedScheme } from './retrieval';

export async function generateGroundedLLMAnswer(
  userQuery: string,
  retrievedSchemes: RetrievedScheme[],
  language: 'en' | 'te' = 'en',
  hospitals: any[] = []
): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    return null;
  }

  const isTe = language === 'te';

  // Provide retrieved scheme database context
  const schemesContext = retrievedSchemes
    .map(
      (s, idx) => `
[SCHEME ${idx + 1}]
Name: ${s.name} ${s.nameTelugu ? `(${s.nameTelugu})` : ''}
Category: ${s.categoryName}
Official Link: ${s.officialUrl}
Source Authority: ${s.sourceAuthority}
Last Verified: ${new Date(s.lastVerifiedAt).toISOString().split('T')[0]}
Summary: ${s.summary}
Purpose: ${s.purpose}
Intended Groups: ${s.intendedGroups.join(', ')}
Eligibility Criteria:
${s.eligibilityCriteria.map((c) => `- ${c}`).join('\n')}
Benefits: ${s.benefits}
Required Documents:
${s.requiredDocuments.map((d) => `- ${d}`).join('\n')}
Application Steps:
${s.applicationSteps}
Caveats & Warnings: ${s.caveats || 'None noted'}
Review Warning: ${s.reviewWarning || 'None'}
`
    )
    .join('\n---\n');

  const hospitalContext =
    hospitals.length > 0
      ? `\nVERIFIED HOSPITALS IN DATABASE:\n` +
        hospitals
          .map(
            (h) =>
              `- ${h.name} (${h.nameTelugu || ''}) | District: ${h.district} | Type: ${h.type} | Address: ${h.address} | Phone: ${h.contactNumber || 'N/A'}`
          )
          .join('\n')
      : '';

  const systemInstruction = `
You are the Telangana Government Healthcare Schemes & Welfare AI Assistant.
Your purpose is to explain Telangana government healthcare schemes, eligibility, benefits, and empaneled hospitals accurately.

STRICT MEDICAL SAFETY & GROUNDING RULES:
1. Answer ONLY using the facts present in the provided scheme & hospital database context below.
2. MEDICAL SAFETY: You MUST NOT diagnose diseases, recommend medical treatments, or prescribe medicines. If the user asks for diagnosis or prescriptions, explicitly state that you are an AI scheme assistant and advise them to visit an emergency department or dial 108.
3. DO NOT fabricate or invent scheme names, eligibility criteria, subsidy amounts, required documents, or deadlines.
4. Phrasing: NEVER declare a user definitely eligible. State that they "may be eligible if they satisfy the following criteria:".
5. Language: ${isTe ? 'Respond in fluent, clear Telugu language with Telugu headings.' : 'Respond in clear, accessible English.'}
6. Format your answer in scannable Markdown sections:
   - What it is
   - Who may qualify (Eligibility criteria)
   - Key Benefits
   - Required Documents
   - How to Apply
   - Verified Network Hospitals (if applicable)
   - Official Department Source & Link
7. Always advise the citizen that final decisions are governed by official department rules.
8. NEVER collect or ask for Aadhaar numbers, bank account numbers, or passwords.
`;

  const contents = [
    {
      role: 'user',
      parts: [
        {
          text: `${systemInstruction}\n\nDATABASE CONTEXT:\n${schemesContext}\n${hospitalContext}\n\nUSER QUESTION: ${userQuery}`,
        },
      ],
    },
  ];

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents,
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 1200,
          },
        }),
      }
    );

    if (!response.ok) {
      console.warn('Gemini API call failed with status:', response.status);
      return null;
    }

    const data = await response.json();
    const candidate = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    return candidate || null;
  } catch (error) {
    console.error('Error invoking Gemini API:', error);
    return null;
  }
}
