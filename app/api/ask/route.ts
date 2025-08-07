import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function iteratorToStream(iterator: any) {
  return new ReadableStream({
    async pull(controller) {
      const { value, done } = await iterator.next();

      if (done) {
        controller.close();
      } else {
        controller.enqueue(value);
      }
    },
  });
}

function sleep(time: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  });
}

const encoder = new TextEncoder();

async function* openaiStreamIterator(
  userInput: string,
  previousResponseId?: string
) {
  const response = await client.responses.create({
    model: "o4-mini",
    tools: [{ type: "web_search_preview" }],
    input: userInput,
    // max_output_tokens: 500,
    stream: true,
    store: true,
    previous_response_id: previousResponseId,
  });

  for await (const chunk of response) {
    if (chunk.type === "response.output_text.delta" && chunk.delta) {
      yield encoder.encode(JSON.stringify({ text: chunk.delta }) + '\n');
    } else if (chunk.type === "response.completed") {
      yield encoder.encode(JSON.stringify({ responseId: chunk.response.id }) + '\n');
    }
  }
}

export async function POST(req: Request) {
  const { userInput, previousResponseId } = await req.json();

  const stream = iteratorToStream(
    openaiStreamIterator(userInput, previousResponseId)
  );

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
    },
  });
}
