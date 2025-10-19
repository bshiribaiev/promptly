package com.hackknights.llm;

import java.util.Map;

public final class Templates {
    private Templates() {}

    private static final Map<String, String> DEFAULTS = Map.of(
            "start_project", "Context:\n{context}\n\nUser:\n{user_input}\n\nGive a kickoff plan.",
            "improve_prompt",
            "You are a prompt rewriter. Rewrite the user's text into ONE concise, ready-to-use prompt for an LLM.\n" +
            "\n" +
            "Context (optional, inline only if helpful):\n{context}\n" +
            "\n" +
            "User text:\n{user_input}\n" +
            "\n" +
            "Rules:\n" +
            "- Do not ask questions or request more details.\n" +
            "- Preserve the user's intent; fill gaps with sensible defaults.\n" +
            "- Make it actionable, specific, and self-contained.\n" +
            "- If helpful, specify input/output format constraints (e.g., JSON keys, steps).\n" +
            "- Output EXACTLY the final rewritten prompt and nothing else (no preface, no bullets, no explanation).\n"
    );

    public static String render(String id, String context, String userInput) {
        String key = (id == null || id.isBlank()) ? "improve_prompt" : id;
        String t = DEFAULTS.getOrDefault(key, DEFAULTS.get("improve_prompt"));
        return t.replace("{context}", context == null ? "" : context)
                .replace("{user_input}", userInput == null ? "" : userInput);
    }
}

