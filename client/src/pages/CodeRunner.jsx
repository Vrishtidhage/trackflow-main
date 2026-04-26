import { useState } from "react";

export default function CodeRunner() {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState(71); // Python default
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const runCode = async () => {
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("http://127.0.0.1:8000/api/run-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code,
          language_id: language,
        }),
      });

      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
    }

    setLoading(false);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>AI Code Runner</h2>

      {/* Language Selector */}
      <select
        value={language}
        onChange={(e) => setLanguage(Number(e.target.value))}
      >
        <option value={71}>Python</option>
        <option value={63}>JavaScript</option>
        <option value={54}>C++</option>
        <option value={62}>Java</option>
      </select>

      {/* Code Input */}
      <textarea
        rows="10"
        cols="80"
        placeholder="Paste your code here..."
        value={code}
        onChange={(e) => setCode(e.target.value)}
      />

      <br /><br />

      <button onClick={runCode} disabled={loading}>
        {loading ? "Running..." : "Run Code"}
      </button>

      <hr />

      {/* OUTPUT */}
      {result && (
        <div>
          <h3>Output</h3>
          <pre>{result.output}</pre>

          <h3>Error</h3>
          <pre>
            {result.error
              ? `Line: ${result.error.line}\nType: ${result.error.type}\n${result.error.message}`
              : "No error"}
          </pre>

          <h3>AI Suggestion</h3>
          <pre>{result.ai_suggestion}</pre>
        </div>
      )}
    </div>
  );
}