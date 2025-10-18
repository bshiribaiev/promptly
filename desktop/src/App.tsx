import { useState } from "react";
import PromptEditor from "./components/PromptEditor";
import Results from "./components/Results";
import Comparison from "./components/Comparison";
import FileUpload from "./components/FileUpload";
import Templates from "./components/Templates";

export default function App() {
  const [view, setView] = useState("editor");
  const [prompt, setPrompt] = useState("");
  const [results, setResults] = useState(null);

  return (
    <div className="app">
      <PromptEditor prompt={prompt} setPrompt={setPrompt} />
      <FileUpload />
      <Templates onSelect={(t) => setPrompt(t)} />
      {results && <Results data={results} />}
      {results && <Comparison data={results} />}
    </div>
  );
}
