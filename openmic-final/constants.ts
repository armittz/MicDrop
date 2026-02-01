import { Level } from './types';

export const LEVELS: Level[] = [
  {
    id: '1',
    title: 'Beginner',
    description: 'Build your foundation with simple daily conversations.',
    prompts: [
      { id: 'l1-p1', text: "What did you have for breakfast today?", category: 'Food' },
      { id: 'l1-p2', text: "Tell me about your favorite morning routine.", category: 'Routine' },
      { id: 'l1-p3', text: "What is your favorite room in your house and why?", category: 'Home' },
      { id: 'l1-p4', text: "What are your plans for the upcoming weekend?", category: 'Plans' },
      { id: 'l1-p5', text: "Describe your best friend in three words.", category: 'People' },
      { id: 'l1-p6', text: "What is the weather like outside right now?", category: 'Nature' }
    ]
  },
  {
    id: '2',
    title: 'Intermediate',
    description: 'Expand your reach by sharing experiences and stories.',
    prompts: [
      { id: 'l2-p1', text: "If you could visit any country, where would you go?", category: 'Travel' },
      { id: 'l2-p2', text: "What was the most interesting place you ever visited?", category: 'History' },
      { id: 'l2-p3', text: "Describe a perfect vacation day for you.", category: 'Fun' },
      { id: 'l2-p4', text: "What is your dream job and why?", category: 'Career' },
      { id: 'l2-p5', text: "Tell me about a childhood memory that makes you smile.", category: 'Memories' },
      { id: 'l2-p6', text: "How did you start your favorite hobby?", category: 'Hobbies' }
    ]
  },
  {
    id: '3',
    title: 'Advanced',
    description: 'Master the art of expressing complex ideas and opinions.',
    prompts: [
      { id: 'l3-p1', text: "How do you think technology will change schools in 10 years?", category: 'Future' },
      { id: 'l3-p2', text: "Describe a person who has greatly influenced your life.", category: 'People' },
      { id: 'l3-p3', text: "What does 'success' mean to you personally?", category: 'Ideas' },
      { id: 'l3-p4', text: "Should people be allowed to live on other planets?", category: 'Space' },
      { id: 'l3-p5', text: "What are the benefits of learning more than one language?", category: 'Education' },
      { id: 'l3-p6', text: "How can we better protect the environment in our daily lives?", category: 'Environment' }
    ]
  }
];

export const STORAGE_KEY = 'openmic_user_data_v4';

export const FEEDBACK_SYSTEM_INSTRUCTION = `
You are an expert ESL speaking coach.

Your task is to analyze a student's spoken English and give clear, practical feedback.

PRIMARY SOURCE OF TRUTH:
- The provided transcript (this matters most)
SECONDARY SOURCE:
- The audio (only for fluency, tone, pacing)

CRITICAL RULES:
- You MUST base feedback on the transcript.
- Do NOT invent words the student did not say.
- Do NOT give vague or generic praise.
- Be specific and actionable.

OUTPUT RULES:
- Respond with VALID JSON ONLY.
- No markdown.
- No explanations outside JSON.
- Every required field MUST exist.

REQUIRED JSON SCHEMA:
{
  "status": "success" | "too_short" | "empty",
  "encouragement": string,
  "alternatives": string[],
  "vocabulary": {
    "word": string,
    "definition": string,
    "example": string
  }[]
}

FIELD REQUIREMENTS:

status:
- "empty" if transcript is empty or meaningless
- "too_short" if transcript has fewer than 5 words
- Otherwise "success"

encouragement:
- Reference something the student ACTUALLY said
- Mention clarity, structure, or idea quality

alternatives:
- REQUIRED when status === "success"
- Provide 3–5 natural, fluent rephrasings
- They must express the SAME IDEA as the student’s sentence

vocabulary:
- Up to 3 useful words or phrases
- Prefer words the student attempted or should learn next
- Examples must match the same topic

Any missing field is a failure.
Return ONLY valid JSON.
`;
