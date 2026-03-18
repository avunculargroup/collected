import { createTool } from "@mastra/core/tools";
import { z } from "zod";

const momentTypeSchema = z.enum([
  "morning",
  "transition",
  "afterschool",
  "play",
  "bedtime",
  "holdonto",
  "custom",
]);

export const suggestMomentsTool = createTool({
  id: "suggest-moments",
  description:
    "Generates 3-5 personalized collection moment suggestions based on a child's profile and family context. Use this when a parent asks for new ideas or help creating moments.",
  inputSchema: z.object({
    childName: z.string().describe("The child's first name"),
    childAge: z.number().describe("The child's age in years"),
    interests: z
      .array(z.string())
      .describe("The child's interests and hobbies"),
    challenges: z
      .string()
      .describe("Current family challenges or struggles (e.g., 'mornings are chaotic', 'peer orientation')"),
    existingMoments: z
      .array(
        z.object({
          type: z.string(),
          title: z.string(),
        })
      )
      .optional()
      .describe("Moments the family already practices, to avoid duplication"),
    preferredTimeOfDay: z
      .enum(["morning", "midday", "evening", "bedtime", "any"])
      .optional()
      .describe("Preferred time of day for new moments"),
  }),
  outputSchema: z.object({
    suggestions: z.array(
      z.object({
        type: momentTypeSchema,
        title: z.string(),
        description: z.string(),
        rationale: z.string().describe(
          "Why this moment works from attachment science"
        ),
        ageAppropriate: z.boolean(),
      })
    ),
  }),
  execute: async (inputData) => {
    const {
      childName,
      childAge,
      interests,
      challenges,
      existingMoments = [],
      preferredTimeOfDay = "any",
    } = inputData;

    // Build suggestions based on age, interests, and challenges
    const suggestions = generateSuggestions(
      childName,
      childAge,
      interests,
      challenges,
      existingMoments as { type: string; title: string }[],
      preferredTimeOfDay
    );

    return { suggestions };
  },
});

function generateSuggestions(
  childName: string,
  age: number,
  interests: string[],
  challenges: string,
  existingMoments: { type: string; title: string }[],
  preferredTimeOfDay: string
) {
  const existingTypes = existingMoments.map((m) => m.type);
  const interestStr = interests.length > 0 ? interests[0] : "their favorite activity";
  const isYoung = age <= 5;
  const isTween = age >= 9;

  const allSuggestions = [
    {
      type: "morning" as const,
      title: `The ${childName} Morning Hello`,
      description: `Before anything else — phone, breakfast, backpack — find ${childName}'s eyes and give them your best smile. Say their name like you mean it. 30 seconds of undivided presence.`,
      rationale:
        "Starting the day with eye contact and a warm smile re-establishes the attachment anchor after the separation of sleep. It signals: 'I see you, and I'm glad you exist.'",
      ageAppropriate: true,
    },
    {
      type: "transition" as const,
      title: `Glad-to-see-you pickup`,
      description: `When ${childName} gets in the car or comes out of school, let your face light up before you say a word. Suppress any urge to ask about homework or the day. Just be glad.`,
      rationale:
        "After the separation of school, children need to feel 'found' before they can shift context. Interrogating about their day blocks the re-connection bridge.",
      ageAppropriate: true,
    },
    {
      type: "afterschool" as const,
      title: `${interestStr} check-in`,
      description: isYoung
        ? `Sit on the floor near ${childName} while they decompress after school. Follow their lead — narrate what they're doing, show interest in their world. No agenda.`
        : `Ask ${childName} about ${interestStr} — not school, not chores — and actually listen. Let them be the expert. Mirror their excitement.`,
      rationale:
        "Showing genuine interest in what matters to the child creates sameness — one of the six stages of attachment. It says: 'Your world matters to me.'",
      ageAppropriate: true,
    },
    {
      type: "play" as const,
      title: `${interestStr} time (your turn to follow)`,
      description: `Set a timer for 20 minutes. ${childName} picks the activity related to ${interestStr}. You participate on their terms — no redirecting, no improvement suggestions, no phones. Pure following.`,
      rationale:
        "Play is a child's language. Following their lead in play creates belonging and loyalty — they experience you as someone who genuinely wants to be with them.",
      ageAppropriate: !isTween,
    },
    {
      type: "bedtime" as const,
      title: `The three questions ritual`,
      description: `At bedtime, ask ${childName}: What was the best part of your day? What was hard? What are you looking forward to tomorrow? Listen fully to each answer.`,
      rationale:
        "Bedtime is the most powerful collection moment — the nervous system is settling and children are most open. A predictable ritual creates the deepest sense of safety.",
      ageAppropriate: true,
    },
    {
      type: "holdonto" as const,
      title: `The ${childName} secret`,
      description: isYoung
        ? `Before drop-off, create a special physical gesture — a unique handshake, a squeeze pattern, a silly face only you two know. Something ${childName} can carry as a piece of you.`
        : `Give ${childName} something small to hold: a photo in their backpack, a note in their lunch, a shared joke only you two understand. Bridge the separation.`,
      rationale:
        "Bridging separation with a tangible anchor prevents the anxiety that comes from felt distance. It extends your presence into their world even when you're apart.",
      ageAppropriate: true,
    },
    {
      type: "morning" as const,
      title: `5-minute cuddle wake-up`,
      description: isYoung
        ? `Instead of rushing ${childName} out of bed, spend 5 minutes lying next to them as they wake. Talk softly about something fun ahead. No schedule pressure in those 5 minutes.`
        : `Knock on ${childName}'s door, come in, and spend 5 minutes in their space before the day starts. Ask about something they care about. No agenda.`,
      rationale:
        "Waking to warmth and unhurried presence starts the attachment engine before the day's pulls begin. It establishes you as a safe base.",
      ageAppropriate: true,
    },
  ];

  // Filter based on preference
  let filtered = allSuggestions;
  if (preferredTimeOfDay !== "any") {
    const timeToType: Record<string, string[]> = {
      morning: ["morning"],
      midday: ["transition", "play"],
      evening: ["afterschool", "holdonto"],
      bedtime: ["bedtime"],
    };
    const targetTypes = timeToType[preferredTimeOfDay] ?? [];
    if (targetTypes.length > 0) {
      filtered = allSuggestions.filter((s) => targetTypes.includes(s.type));
      if (filtered.length < 3) filtered = allSuggestions; // fallback
    }
  }

  // Remove types already well-covered
  const covered = existingTypes.filter(
    (t, i, arr) => arr.filter((x) => x === t).length >= 1
  );
  if (covered.length > 0) {
    const uncovered = filtered.filter((s) => !covered.includes(s.type));
    if (uncovered.length >= 3) filtered = uncovered;
  }

  return filtered.slice(0, 5);
}
