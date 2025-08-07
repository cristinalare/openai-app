type ResponseStreamEvent = {
  text?: string;
  responseId?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
};

export const postAsk = async (
  userInput: string,
  onChunk?: (text: string) => void,
  previousResponseId?: string
): Promise<{ doneText: string; responseId?: string }> => {
  const res = await fetch("/api/ask", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userInput, previousResponseId }),
  });

  if (!res.body) throw new Error("No response body");

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let fullText = "";
  let responseId: string | undefined;

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    const lines = decoder.decode(value, { stream: true }).split("\n");
    for (const line of lines) {
      if (!line.trim()) continue;
      try {
        const event: ResponseStreamEvent = JSON.parse(line);

        if (event.text) {
          onChunk?.(event.text);
          fullText += event.text;
        } else if (event.responseId) {
          responseId = event.responseId;
        }
      } catch (err) {
        console.warn("Could not parse chunk:", line);
      }
    }
  }

  return { doneText: fullText, responseId };
};
