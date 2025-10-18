import templates from "../../public/templates.json";

export default function Templates({ onSelect }) {
  return (
    <div>
      {templates.map((t) => (
        <button key={t.id} onClick={() => onSelect(t.template)}>
          {t.name}
        </button>
      ))}
    </div>
  );
}
