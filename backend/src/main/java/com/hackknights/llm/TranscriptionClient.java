package com.hackknights.llm;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.io.File;
import java.time.Duration;

@Service
public class TranscriptionClient {

    private final String provider;
    private final String apiKey;
    private final String modelId;
    private final String languageCode;
    private final boolean tagAudioEvents;
    private final boolean diarize;
    private final WebClient http = WebClient.builder().build();

    public TranscriptionClient(
            @Value("${app.stt.provider:elevenlabs}") String provider,
            @Value("${app.stt.eleven.apiKey:}") String apiKey,
            @Value("${app.stt.eleven.model:scribe_v1}") String modelId,
            @Value("${app.stt.eleven.languageCode:eng}") String languageCode,
            @Value("${app.stt.eleven.tagAudioEvents:false}") boolean tagAudioEvents,
            @Value("${app.stt.eleven.diarize:false}") boolean diarize
    ) {
        this.provider = provider == null ? "elevenlabs" : provider.toLowerCase();
        this.apiKey = apiKey;
        this.modelId = modelId;
        this.languageCode = languageCode;
        this.tagAudioEvents = tagAudioEvents;
        this.diarize = diarize;
    }

    public Mono<String> transcribe(File audioFile) {
        if (!"elevenlabs".equals(provider) || apiKey == null || apiKey.isBlank()) {
            return Mono.just("");
        }

        MultiValueMap<String, Object> form = new LinkedMultiValueMap<>();
        form.add("file", new FileSystemResource(audioFile));
        form.add("model_id", modelId);
        form.add("language_code", languageCode);
        form.add("tag_audio_events", String.valueOf(tagAudioEvents));
        form.add("diarize", String.valueOf(diarize));

        return http.post()
                // Speech-to-Text convert API
                .uri("https://api.elevenlabs.io/v1/speech-to-text")
                .header("xi-api-key", apiKey)
                .contentType(MediaType.MULTIPART_FORM_DATA)
                .accept(MediaType.APPLICATION_JSON)
                .body(BodyInserters.fromMultipartData(form))
                .retrieve()
                .bodyToMono(String.class)
                .timeout(Duration.ofSeconds(120))
                .map(body -> {
                    // Look for a plain "text" field; fall back to raw body
                    int i = body.indexOf("\"text\":");
                    if (i >= 0) {
                        int start = body.indexOf('"', i + 7);
                        int end = body.indexOf('"', start + 1);
                        if (start > 0 && end > start) {
                            return body.substring(start + 1, end);
                        }
                    }
                    return body;
                })
                .onErrorReturn("");
    }
}