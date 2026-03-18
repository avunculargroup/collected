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

export const adaptMomentsTool = createTool({
  id: "adapt-moments",
  description:
    "Helps adapt or iterate on a collection moment that isn't working. Takes feedback about what's not working and returns a modified version plus an optional completely different alternative. Use when a parent reports a moment feels forced, impractical, or isn't resonating.",
  inputSchema: z.object({
    momentId: z.string().optional().describe("The ID of the moment to adapt"),
    currentMoment: z.object({
      type: z.string(),
      title: z.string(),
      description: z.string(),
    }),
    feedback: z
      .string()
      .describe(
        "What's not working about this moment (e.g., 'child resists', 'mornings are too rushed', 'feels forced')"
      ),
    childContext: z.object({
      name: z.string(),
      age: z.number(),
      interests: z.array(z.string()).optional(),
    }),
  }),
  outputSchema: z.object({
    adaptedMoment: z.object({
      title: z.string(),
      description: z.string(),
      rationale: z.string(),
    }),
    alternative: z
      .object({
        type: momentTypeSchema,
        title: z.string(),
        description: z.string(),
        rationale: z.string(),
      })
      .optional(),
    coachNote: z
      .string()
      .describe("A brief note to the parent about the adaptation"),
  }),
  execute: async (inputData) => {
    const { currentMoment, feedback, childContext } = inputData;
    const { name, age, interests = [] } = childContext;
    const feedbackLower = feedback.toLowerCase();

    const interestStr = interests.length > 0 ? interests[0] : "what they enjoy";

    // Analyze the feedback and create an adapted version
    let adaptedTitle = currentMoment.title;
    let adaptedDescription = currentMoment.description;
    let adaptedRationale = "";
    let coachNote = "";
    let alternative = undefined;

    if (
      feedbackLower.includes("rush") ||
      feedbackLower.includes("no time") ||
      feedbackLower.includes("busy")
    ) {
      adaptedTitle = `${currentMoment.title} (30 seconds)`;
      adaptedDescription = `You don't have to do the full version. Even 30 seconds — find ${name}'s eyes, say their name, smile. That's a collection moment. Perfection is the enemy of practice.`;
      adaptedRationale =
        "Micro-moments of genuine connection are more powerful than longer rituals done reluctantly. A 30-second eye contact greeting plants the same attachment seed.";
      coachNote = `When time pressure is real, shrink the moment rather than skip it. Connection doesn't require duration — it requires presence, even briefly.`;
    } else if (
      feedbackLower.includes("resist") ||
      feedbackLower.includes("refuses") ||
      feedbackLower.includes("won't") ||
      feedbackLower.includes("pushes away")
    ) {
      adaptedTitle = `Sideways ${currentMoment.title.toLowerCase()}`;
      adaptedDescription = `Instead of direct connection, try parallel presence. Sit near ${name} without requiring interaction — just be in the same space doing your own thing. Side-by-side connection often works when face-to-face feels threatening.`;
      adaptedRationale =
        "Resistance to direct connection is often a sign that the child has learned to protect themselves from vulnerability. Sideways, parallel connection lowers the stakes and gradually rebuilds the invitation.";
      coachNote = `${name}'s resistance isn't rejection — it's self-protection. Approach from the side, not the front. Over time, they'll lean in.`;
      alternative = {
        type: "play" as const,
        title: `Follow ${name} from a distance`,
        description: `${age <= 8 ? `Play nearby while ${name} leads — you're the audience, not the director.` : `Show interest in ${interestStr} without joining in. Ask questions from a respectful distance.`}`,
        rationale:
          "Allowing the child to be in control of the proximity gradually shifts them from avoidance to approach.",
      };
    } else if (
      feedbackLower.includes("feels forced") ||
      feedbackLower.includes("awkward") ||
      feedbackLower.includes("unnatural")
    ) {
      adaptedTitle = `Natural ${currentMoment.title.toLowerCase()}`;
      adaptedDescription = `Instead of treating this as a ritual, weave it into something already happening. When you're both headed somewhere, that's a transition moment. When ${name} is eating, that's presence time. Let the structure dissolve and trust the intention.`;
      adaptedRationale =
        "The goal isn't the behavior — it's the felt sense of connection. If the structure is getting in the way, let it go and trust that warm, attentive presence is the point.";
      coachNote = `Rituals work best when they feel discovered rather than imposed. If this feels forced, it might need to be simpler or attached to something that already flows naturally.`;
    } else if (
      feedbackLower.includes("age") ||
      feedbackLower.includes("too young") ||
      feedbackLower.includes("too old") ||
      feedbackLower.includes("not interested")
    ) {
      const adaptedForAge =
        age >= 9
          ? `For ${name} at ${age}, connection often happens indirectly — shared activity, side commentary, a joke only you two share. Try involving them in something you genuinely care about rather than creating a dedicated "moment."`
          : `At ${age}, ${name} responds to sensory connection — touch, proximity, playful sound. Try making the moment more physical and playful.`;

      adaptedTitle = `Age-adapted ${currentMoment.title.toLowerCase()}`;
      adaptedDescription = adaptedForAge;
      adaptedRationale = `Children's attachment language shifts with development. What worked at 5 won't work at 12. The principle stays the same; the expression has to evolve with them.`;
      coachNote = `The attachment need doesn't change as children grow — but the vocabulary for meeting it does. Trust your instincts about what ${name} responds to.`;
    } else {
      // Generic adaptation
      adaptedTitle = `Simplified ${currentMoment.title.toLowerCase()}`;
      adaptedDescription = `Keep the core intention — making ${name} feel seen and found — but strip away everything else. What's the single smallest gesture that communicates "I see you and I'm glad you're mine"? Start there.`;
      adaptedRationale =
        "Simplifying to the core element removes friction while preserving the attachment signal. Often the simplest version is the most powerful.";
      coachNote = `When something isn't working, the answer is usually simpler than we think. What's the one gesture that would most make ${name} feel found? Trust that.`;
    }

    return {
      adaptedMoment: {
        title: adaptedTitle,
        description: adaptedDescription,
        rationale: adaptedRationale,
      },
      alternative,
      coachNote,
    };
  },
});
