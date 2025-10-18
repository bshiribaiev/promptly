export default function Results({ data }) {
  return (
    <div>
      <h2>Score: {data.score}/10</h2>
      <ul>
        {data.problems.map((p) => (
          <li key={p}>{p}</li>
        ))}
      </ul>
      <div>Improved: {data.improved_prompt}</div>
    </div>
  );
}
