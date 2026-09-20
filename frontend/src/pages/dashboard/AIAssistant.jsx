import { useState } from "react";
import api from "../../services/api";

function AIAssistant() {
  const [message, setMessage] = useState("");
  const [conversation, setConversation] = useState([]);
  const [loading, setLoading] = useState(false);

  const askAI = async (question) => {
    const text = question || message;

    if (!text.trim()) {
      return;
    }

    setConversation((previous) => [
      ...previous,
      {
        sender: "You",
        text
      }
    ]);

    setMessage("");
    setLoading(true);

    try {
      const response = await api.post(
        "/ai/ask",
        {
          message: text
        }
      );

      setConversation((previous) => [
        ...previous,
        {
          sender: "BusyBiz AI",
          text: response.data.reply
        }
      ]);

    } catch (error) {
      console.error(
        "AI ASSISTANT ERROR:",
        error
      );

      setConversation((previous) => [
        ...previous,
        {
          sender: "BusyBiz AI",
          text:
            error.response?.data?.message ||
            "Unable to contact BusyBiz AI."
        }
      ]);

    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    askAI();
  };

  return (
    <div>
      <h1>BusyBiz AI Assistant</h1>

      <p>
        Ask questions about your business,
        sales, expenses, inventory and
        performance.
      </p>

      <hr />

      <div>
        {conversation.length === 0 && (
          <div>
            <h3>
              Try asking:
            </h3>

            <button
              onClick={() =>
                askAI(
                  "How is my business doing?"
                )
              }
            >
              How is my business doing?
            </button>

            <button
              onClick={() =>
                askAI(
                  "How much profit did I make?"
                )
              }
            >
              How much profit did I make?
            </button>

            <button
              onClick={() =>
                askAI(
                  "Do I have any low stock products?"
                )
              }
            >
              Do I have low stock?
            </button>

            <button
              onClick={() =>
                askAI(
                  "What should I focus on?"
                )
              }
            >
              What should I focus on?
            </button>
          </div>
        )}

        {conversation.map(
          (item, index) => (
            <div key={index}>
              <strong>
                {item.sender}
              </strong>

              <p>
                {item.text}
              </p>
            </div>
          )
        )}

        {loading && (
          <p>
            BusyBiz AI is analyzing your
            business...
          </p>
        )}
      </div>

      <hr />

      <form
        onSubmit={handleSubmit}
      >
        <input
          type="text"
          value={message}
          onChange={(event) =>
            setMessage(
              event.target.value
            )
          }
          placeholder="Ask BusyBiz AI..."
        />

        <button
          type="submit"
          disabled={loading}
        >
          {loading
            ? "Thinking..."
            : "Ask AI"}
        </button>
      </form>
    </div>
  );
}

export default AIAssistant;