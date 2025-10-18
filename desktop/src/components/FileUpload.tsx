import { open } from "@tauri-apps/api/dialog";
import { readTextFile } from "@tauri-apps/api/fs";

export default function FileUpload() {
  const handleUpload = async () => {
    const file = await open({
      filters: [{ name: "Doc", extensions: ["pdf", "txt"] }],
    });
    const text = await readTextFile(file);
    // Send to extract-context API
  };

  return <button onClick={handleUpload}>📎 Add Context</button>;
}
