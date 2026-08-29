import axios from 'axios';
import { env } from '../config/env';

async function testRAGPrompt() {
  const prompt = `You are the official PCCOE Pune Digital Information Assistant. Answer the student's question accurately using ONLY the provided PCCOE college context.

### RETRIEVED PCCOE COLLEGE CONTEXT:
## 2.2 Expected & Previous Year Cutoffs for 2026 Admissions (MHT-CET & JEE Main Cutoff Percentiles & Closing Ranks):
- **Computer Engineering (Choice Code: 617524510)**:
  - MHT-CET Cutoff: **99.15 Percentile** (GOPENS State Merit Rank ~1,800).
  - JEE Main Cutoff: **97.80 Percentile** (All India Merit Rank ~3,200).
  - TFWS (Tuition Fee Waiver Scheme) Cutoff: **99.40+ Percentile**.
- **Information Technology (IT - Choice Code: 617524610)**:
  - MHT-CET Cutoff: **98.65 Percentile** (GOPENS State Merit Rank ~2,700).
  - JEE Main Cutoff: **96.50 Percentile** (All India Merit Rank ~4,500).

### CURRENT STUDENT QUESTION:
"what is 2023 cutoff of mhtcet and jee"

### ASSISTANT ANSWER:`;

  const res = await axios.post(
    'https://openrouter.ai/api/v1/chat/completions',
    {
      model: 'openrouter/auto',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2,
    },
    {
      headers: {
        Authorization: `Bearer ${env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:5173',
        'X-Title': 'PCCOE RAG Assistant',
      },
      timeout: 15000,
    }
  );

  console.log('🤖 Live OpenRouter Generative Response:\n', res.data?.choices?.[0]?.message?.content);
}

testRAGPrompt();
