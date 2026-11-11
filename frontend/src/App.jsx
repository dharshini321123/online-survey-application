
import { useState } from "react";
import "./App.css";

const questionBank = [
  {
    question: "How satisfied are you with our website?",
    options: ["Very Satisfied", "Satisfied", "Neutral", "Dissatisfied"]
  },
  {
    question: "How often do you use the internet?",
    options: ["Daily", "Weekly", "Monthly", "Rarely"]
  },
  {
    question: "Is the website easy to use?",
    options: ["Very Easy", "Easy", "Average", "Difficult"]
  },
  {
    question: "Which device do you use most?",
    options: ["Mobile", "Laptop", "Tablet", "Desktop"]
  },
  {
    question: "Would you recommend our website?",
    options: ["Definitely", "Maybe", "Not Sure", "No"]
  },
  {
    question: "How is the website design?",
    options: ["Excellent", "Good", "Average", "Poor"]
  },
  {
    question: "How did you find our website?",
    options: ["Google", "Social Media", "Friends", "Other"]
  },
  {
    question: "How often should we update the website?",
    options: ["Daily", "Weekly", "Monthly", "Rarely"]
  }
];

function getRandomQuestions() {
  return [...questionBank]
    .sort(() => Math.random() - 0.5)
    .slice(0, 5);
}

function App() {
  const [questions, setQuestions] = useState(getRandomQuestions);
  const [answers, setAnswers] = useState({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  function handleAnswer(question, answer) {
    setAnswers((previous) => ({
      ...previous,
      [question]: answer
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");

    if (questions.some((item) => !answers[item.question])) {
      setMessage("Please answer all 5 questions.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/surveys",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            answers: questions.map((item) => ({
              question: item.question,
              answer: answers[item.question]
            }))
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Submission failed.");
      }

      setMessage("Survey submitted successfully! Answers saved to MongoDB.");
      setAnswers({});
      setQuestions(getRandomQuestions());
    } catch (error) {
      setMessage(
        "Error: " + error.message +
        " Please check the backend and MongoDB."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="container">
      <h1>Online Survey Application</h1>
      <p className="subtitle">
        Please answer these 5 questions and submit your response.
      </p>

      <form onSubmit={handleSubmit}>
        {questions.map((item, index) => (
          <section className="question" key={item.question}>
            <h3>
              {index + 1}. {item.question}
            </h3>

            {item.options.map((option) => (
              <label className="option" key={option}>
                <input
                  type="radio"
                  name={item.question}
                  value={option}
                  checked={answers[item.question] === option}
                  onChange={() =>
                    handleAnswer(item.question, option)
                  }
                />
                {option}
              </label>
            ))}
          </section>
        ))}

        <button type="submit" disabled={loading}>
          {loading ? "Submitting..." : "Submit Survey"}
        </button>

        {message && (
          <p className="message" role="status">{message}</p>
        )}
      </form>
    </main>
  );
}

export default App;
