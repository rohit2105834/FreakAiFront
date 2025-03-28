import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import "../styles/ChatBox.css";

const ChatBox = () => {
  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const chatRef = useRef(null);

  const handleAsk = async () => {
    if (!question.trim()) return;

    const userMessage = { text: question, sender: "user" };
    setMessages((prev) => [...prev, userMessage]);
    setQuestion("");
    setLoading(true);

    try {
      const res = await axios.post(
        "https://freak-fit-diet.vercel.app/chat",
        { message: question },
        { headers: { "Content-Type": "application/json" } }
      );

      let botResponse =
        res.data.response ||
        "No response from server. Please try again later.";

      // Process response dynamically
      botResponse = formatResponse(botResponse);

      simulateTyping(botResponse);
    } catch (error) {
      console.error("Error:", error.response || error);
      simulateTyping("Error fetching response. Please try again.");
    }
    setLoading(false);
  };

  const formatResponse = (text) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, "**$1**") // Bold text
      .replace(/### (.*?)\n/g, "### $1\n") // Headers
      .replace(/- (.*?)\n/g, "- $1\n") // Lists
      .replace(/\n/g, "\n\n"); // Add extra space for readability
  };

  // Simulated typing effect
  // const simulateTyping = (text) => {
  //   let index = 0;
  //   const typingInterval = setInterval(() => {
  //     if (index < text.length) {
  //       setMessages((prev) => [
  //         ...prev.slice(0, -1),
  //         { text: prev[prev.length - 1].text + text[index], sender: "bot" },
  //       ]);
  //       index++;
  //     } else {
  //       clearInterval(typingInterval);
  //     }
  //   }, 30);

  //   setMessages((prev) => [...prev, { text: "", sender: "bot" }]);
  // };

  const simulateTyping = (text) => {
    let index = 0;
  
    // Start with an empty bot message
    setMessages((prev) => [...prev, { text: "", sender: "bot" }]);
  
    const typingInterval = setInterval(() => {
      setMessages((prev) => {
        if (prev.length === 0) return prev; // Safety check
  
        const lastMessage = prev[prev.length - 1];
  
        if (!lastMessage || lastMessage.sender !== "bot") return prev;
  
        // Ensure correct slicing
        const updatedText = text.slice(0, index + 1);
  
        if (index < text.length - 1) {
          index++;
          return [...prev.slice(0, -1), { text: updatedText, sender: "bot" }];
        } else {
          clearInterval(typingInterval);
          return [...prev.slice(0, -1), { text, sender: "bot" }]; // Final correction to avoid extra characters
        }
      });
    }, 30);
  };
  

  // Handle Enter key press
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAsk();
    }
  };

  // Auto-scroll to latest message
  useEffect(() => {
    chatRef.current?.scrollTo({
      top: chatRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  return (
    <div className="chat-container">
      <div className="chat-box" ref={chatRef}>
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.sender}`}>
            <ReactMarkdown>{msg.text}</ReactMarkdown>
          </div>
        ))}
        {loading && <div className="message bot">Thinking...</div>}
      </div>

      <div className="chat-input">
        <textarea
          placeholder="Ask me anything..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button onClick={handleAsk} disabled={loading}>
          {loading ? "..." : "Send"}
        </button>
      </div>
    </div>
  );
};

export default ChatBox;
