import { handleChatStream } from "@mastra/ai-sdk";
import { mastra } from "@/mastra";
import { auth } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const params = await req.json();

  const stream = await handleChatStream({
    mastra,
    agentId: "collection-coach",
    params: {
      ...params,
      resourceId: session.user.id,
      threadId: session.user.id,
    },
  });

  // Create response with UI_MESSAGE_STREAM_HEADERS
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new Response(stream as any, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
