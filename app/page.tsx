"use client";
import { useState } from "react";
import { postAsk } from "./_lib/api/chat";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";

const Loader = () => (
  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
);

export default function Home() {
  const [userInput, setUserInput] = useState("");
  const [responseId, setResponseId] = useState<string>();
  const [messages, setMessages] = useState<
    { role: "assistant" | "user"; message: string }[]
  >([]);

  const handleSubmit = async () => {
    setMessages((prev) => [
      ...prev,
      { role: "user", message: userInput },
      { role: "assistant", message: "" },
    ]);
    setUserInput("");

    const finalResponse = await postAsk(
      userInput,
      (chunk) => {
        setMessages((prev) => {
          const latestMessage = prev[prev.length - 1];
          const newMessages = [
            ...prev.slice(0, -1),
            { ...latestMessage, message: latestMessage.message + chunk },
          ];
          return newMessages;
        });
      },
      responseId
    );

    if (finalResponse.responseId) {
      setResponseId(finalResponse.responseId);
    }
  };

  return (
    <div className="mt-10 p-6 w-full">
      <div className="flex flex-col gap-4 mb-28 max-w-2xl mx-auto">
        {messages.map((entry, i) => (
          <div
            key={i}
            className={`p-2 flex gap-2 items-center rounded ${
              entry.role === "user" ? "bg-gray-100" : ""
            }`}
          >
            {entry.role === "user" ? (
              <Avatar className="rounded-full size-6">
                <AvatarImage
                  className="rounded-full size-6"
                  src="https://github.com/shadcn.png"
                />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
            ) : (
              ""
            )}
            {entry.message ? (
              <pre className="whitespace-pre-wrap">{entry.message}</pre>
            ) : (
              <Loader />
            )}
          </div>
        ))}
      </div>
      <div className="fixed bottom-0 py-12 px-4 w-full flex justify-center items-center gap-3 z-10 bg-white">
        <input
          className="border bg-white"
          placeholder="Ask anything"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        />
        <Button onClick={handleSubmit}>Send</Button>
      </div>
    </div>
  );
}
