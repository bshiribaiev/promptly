package com.hackknights.llm;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;
import java.util.Map;

@Service
public class LlmClient {

    private final String provider;
    private final String geminiApiKey;
    private final String geminiModel;
    private final WebClient http = WebClient.builder().build();
    private final ObjectMapper mapper = new ObjectMapper();

    public LlmClient(
            @Value("${app.llm.provider:none}") String provider,
            @Value("${app.llm.gemini.apiKey:}") String geminiApiKey,
            @Value("${app.llm.gemini.model:gemini-1.5-flash}") String geminiModel
    ) {
        this.provider = provider == null ? "none" : provider.toLowerCase();
        this.geminiApiKey = geminiApiKey;
        this.geminiModel = geminiModel;
    }

    public String complete(String prompt) {
        try {
            if ("gemini".equals(provider)) {
                return callGemini(prompt);
            }
            return null;
        } catch (Exception e) {
            return null;
        }
    }

    private String callGemini(String prompt) throws Exception {
        if (geminiApiKey == null || geminiApiKey.isBlank()) return null;
        String url = "https://generativelanguage.googleapis.com/v1beta/models/"
                + geminiModel + ":generateContent?key=" + geminiApiKey;

        String body = http.post()
                .uri(url)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(Map.of(
                        "contents", new Object[] {
                                Map.of("parts", new Object[]{ Map.of("text", prompt) })
                        }
                ))
                .retrieve()
                .bodyToMono(String.class)
                .timeout(Duration.ofSeconds(60))
                .block();

        if (body == null) return null;
        JsonNode root = mapper.readTree(body);
        JsonNode text = root.path("candidates").path(0).path("content").path("parts").path(0).path("text");
        return text.isMissingNode() ? null : text.asText();
    }
}