import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in environment secrets.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function formatGeminiError(err: unknown): { status: number; message: string } {
  const raw = err instanceof Error ? err.message : String(err);
  if (raw.includes('GEMINI_API_KEY is not configured')) {
    return {
      status: 503,
      message: 'Shubh AI requires a Gemini API key in Settings > Secrets to respond.',
    };
  }
  if (raw.includes('API_KEY_INVALID') || raw.includes('PERMISSION_DENIED') || raw.includes('403')) {
    return {
      status: 403,
      message: 'Gemini API access was denied. Please verify your API key in Settings > Secrets.',
    };
  }
  if (raw.includes('RESOURCE_EXHAUSTED') || raw.includes('429')) {
    return {
      status: 429,
      message: 'Shubh AI is momentarily busy due to rate limits. Please try again in a few seconds.',
    };
  }
  return {
    status: 500,
    message: 'Shubh AI could not process that request right now. Please try again.',
  };
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true });
  });

  // Conversational endpoint for Shubh AI
  app.post('/api/shubh/chat', async (req, res) => {
    try {
      const { message, eventContext, history } = req.body ?? {};
      if (typeof message !== 'string' || !message.trim()) {
        res.status(400).json({ error: 'Please enter a message for Shubh.' });
        return;
      }

      const safeMessage = message.trim().slice(0, 2000);
      const safeHistory = Array.isArray(history)
        ? history
            .slice(-8)
            .filter(
              (item): item is { role: 'user' | 'assistant'; content: string } =>
                Boolean(item) &&
                (item.role === 'user' || item.role === 'assistant') &&
                typeof item.content === 'string'
            )
        : [];

      const contextSummary =
        eventContext && typeof eventContext === 'object'
          ? JSON.stringify(eventContext).slice(0, 6000)
          : '{}';

      const ai = getGeminiClient();

      const transcript = safeHistory
        .map((m) => `${m.role === 'user' ? 'Host' : 'Shubh'}: ${m.content.slice(0, 800)}`)
        .join('\n');

      const prompt = [
        `Live Event Workspace State:\n${contextSummary}`,
        transcript ? `Recent Conversation:\n${transcript}` : '',
        `Host's New Message:\n${safeMessage}`,
      ]
        .filter(Boolean)
        .join('\n\n');

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: prompt,
        config: {
          systemInstruction:
            'You are Shubh, the warm, deeply organized AI celebration planner inside Utsav AI. ' +
            'You specialize in Indian and global weddings, engagements, milestone birthdays, anniversaries, corporate offsites, and baby showers. ' +
            'Always anchor your advice in the host’s exact live workspace data (budget in INR ₹, city, guest count, date, overdue tasks, shortlisted vendors, and RSVP status). ' +
            'Give concrete, practical, culturally thoughtful recommendations with realistic INR figures and actionable next steps. ' +
            'Keep answers concise (under 180 words unless asked for a detailed run-sheet or draft), formatted with clean plain prose or short bullet points without markdown clutter.',
        },
      });

      const reply = response.text?.trim();
      if (!reply) {
        res.status(502).json({ error: 'Shubh returned an empty response. Please try again.' });
        return;
      }

      res.json({ reply });
    } catch (err) {
      const formatted = formatGeminiError(err);
      res.status(formatted.status).json({ error: formatted.message });
    }
  });

  // Structured replanning endpoint ("What Changed? Replan" & new event generation)
  app.post('/api/shubh/replan', async (req, res) => {
    try {
      const {
        eventName,
        eventType,
        eventDate,
        city,
        guestCount,
        totalBudget,
        changeDescription,
      } = req.body ?? {};

      if (typeof eventType !== 'string' || !eventType.trim()) {
        res.status(400).json({ error: 'Event type is required to generate a plan.' });
        return;
      }

      const safeBudget = Number(totalBudget) > 0 ? Number(totalBudget) : 1500000;
      const safeGuests = Number(guestCount) > 0 ? Number(guestCount) : 180;
      const safeCity = typeof city === 'string' && city.trim() ? city.trim().slice(0, 80) : 'Udaipur';
      const safeDate =
        typeof eventDate === 'string' && eventDate.trim() ? eventDate.trim().slice(0, 20) : '2027-04-12';
      const safeName =
        typeof eventName === 'string' && eventName.trim()
          ? eventName.trim().slice(0, 100)
          : `My ${eventType.trim()} Plan`;
      const safeChange =
        typeof changeDescription === 'string' ? changeDescription.trim().slice(0, 1200) : '';

      const ai = getGeminiClient();

      const prompt = `Generate a recalibrated celebration plan for:
- Event Name: ${safeName}
- Celebration Type: ${eventType.trim()}
- Target Date: ${safeDate}
- City: ${safeCity}
- Guest Count: ${safeGuests}
- Total Budget (INR): ₹${safeBudget}
- What Changed / Special Notes: ${safeChange || 'Initial full plan calibration'}

Produce:
1. A concise 2-sentence summary explaining how the plan and budget were calibrated.
2. 8 realistic, high-impact timeline tasks spanning phases ("6+ Months Out", "3-5 Months Out", "1 Month Out", "Event Week") with realistic ISO due dates leading up to ${safeDate}.
3. 6 budget category allocations in INR whose allocated amounts sum accurately to ₹${safeBudget}.
4. 4 tailored vendor recommendations suited to ${safeCity}, ${safeGuests} guests, and ₹${safeBudget} total budget.`;

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: prompt,
        config: {
          systemInstruction:
            'You are Shubh, Utsav AI’s structured celebration planning engine. Return accurate JSON matching the schema. Ensure all INR amounts are realistic integers and budget category allocations sum to the requested total budget.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summary: { type: Type.STRING },
              tasks: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    ceremony: { type: Type.STRING },
                    phase: { type: Type.STRING },
                    dueDate: { type: Type.STRING },
                    owner: { type: Type.STRING },
                    priority: { type: Type.STRING },
                  },
                  required: ['title', 'ceremony', 'phase', 'dueDate', 'owner', 'priority'],
                },
              },
              budgetCategories: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    allocated: { type: Type.INTEGER },
                  },
                  required: ['name', 'allocated'],
                },
              },
              vendorSuggestions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    category: { type: Type.STRING },
                    city: { type: Type.STRING },
                    estimatedCost: { type: Type.INTEGER },
                    notes: { type: Type.STRING },
                  },
                  required: ['name', 'category', 'city', 'estimatedCost', 'notes'],
                },
              },
            },
            required: ['summary', 'tasks', 'budgetCategories', 'vendorSuggestions'],
          },
        },
      });

      const rawJson = (response.text ?? '').trim();
      if (!rawJson) {
        res.status(502).json({ error: 'Shubh returned an empty plan. Please try again.' });
        return;
      }

      const parsed = JSON.parse(rawJson);
      res.json(parsed);
    } catch (err) {
      const formatted = formatGeminiError(err);
      res.status(formatted.status).json({ error: formatted.message });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Utsav AI server listening on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
