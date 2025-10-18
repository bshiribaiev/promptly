export default function Comparison({ data }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <h3>Original Output</h3>
        <p>{data.original_output}</p>
      </div>
      <div>
        <h3>Improved Output</h3>
        <p>{data.improved_output}</p>
      </div>
    </div>
  );
}
