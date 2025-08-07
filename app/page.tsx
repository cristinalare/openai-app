"use client";
import { useState } from "react";
import { postAsk } from "./_lib/api/chat";

export default function Home() {
  const [userInput, setUserInput] = useState("");
  const [response, setResponse] = useState("");
  const [responseId, setResponseId] = useState<string>();

  const handleSubmit = async () => {
    setResponse("");

    const finalResponse = await postAsk(userInput, (chunk) => {
      setResponse((prev) => prev + chunk);
    }, responseId);
    
    if (finalResponse.responseId) {
      setResponseId(finalResponse.responseId);
    }
  };

  return (
    <div className="mt-10 p-6">
      <input
        name="Ask anything"
        value={userInput}
        onChange={(e) => setUserInput(e.target.value)}
      />
      <button onClick={handleSubmit}>Send</button>

      <pre className="mt-10 whitespace-pre-wrap">{response}</pre>
    </div>
  );
}
