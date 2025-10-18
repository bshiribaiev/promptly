import { scorePrompt, improvePrompt } from "../api";

export default function PromptEditor({ prompt, setPrompt }) {
  const handleScore = async () => {
    const result = await scorePrompt(prompt);
    // Show results
  };

  return (
    <div>
      <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} />
      <button onClick={handleScore}>Score It</button>
      <button onClick={handleImprove}>Improve It</button>
    </div>
  );
}
