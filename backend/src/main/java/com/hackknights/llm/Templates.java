package com.hackknights.llm;

import java.util.Map;

public final class Templates {
    private Templates() {}

    private static final Map<String, String> DEFAULTS = Map.of(
            "start_project", "Context:\n{context}\n\nUser:\n{user_input}\n\nGive a kickoff plan.",
            "improve_prompt", "Context:\n{context}\n\nOriginal:\n{user_input}\n\nReturn an improved prompt."
    );

    public static String render(String id, String context, String userInput) {
        String key = (id == null || id.isBlank()) ? "improve_prompt" : id;
        String t = DEFAULTS.getOrDefault(key, DEFAULTS.get("improve_prompt"));
        return t.replace("{context}", context == null ? "" : context)
                .replace("{user_input}", userInput == null ? "" : userInput);
    }
}

