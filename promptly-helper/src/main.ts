import { register } from '@tauri-apps/plugin-global-shortcut';
import { readText, writeText } from '@tauri-apps/plugin-clipboard-manager';
import { invoke } from '@tauri-apps/api/core';

const BACKEND = 'http://127.0.0.1:8081';
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

async function init() {
  const isTauri = typeof (window as any).__TAURI_INTERNALS__ !== 'undefined';
  if (!isTauri) {
    console.warn('[promptly-helper] Running in browser; plugins disabled. Use the Tauri window.');
    return;
  }
  const handler = async () => {
    try {
      const prev = await readText().catch(() => '');
      await invoke('send_copy');
      await sleep(300);
      const text = (await readText())?.trim() || '';
      if (!text) {
        alert('No text on clipboard after copy. Enable Accessibility for "promptly-helper".');
        return;
      }

      const res = await fetch(`${BACKEND}/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, templateId: 'improve_prompt', returnAnswer: true })
      }).then(r => r.json()).catch((e) => ({ error: String(e) }));

      const improved = (res as any)?.answer || (res as any)?.prompt || '';
      if (!improved) {
        alert('Backend returned empty result. Is it running with an LLM?');
        return;
      }

      await writeText(improved);
      await invoke('send_paste');
      await sleep(300);
      await writeText(prev || '');
    } catch (e: any) {
      alert('Error: ' + String(e));
    }
  };

  const combos = [
    'Cmd+Shift+U',
    'Ctrl+Alt+Cmd+I',
    'Option+Shift+I',
    'F6',
    'F15'
  ];
  for (const c of combos) {
    try { await register(c, handler); console.log('Registered hotkey', c); } catch (e) { console.warn('Failed', c, e); }
  }
}
init();