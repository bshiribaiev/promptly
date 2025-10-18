package com.hackknights.retrieval;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class RetrievalService {

    private final int chunkSize;
    private final int overlap;

    public RetrievalService(
            @Value("${app.retrieval.chunk-size:900}") int chunkSize,
            @Value("${app.retrieval.overlap:150}") int overlap
    ) {
        this.chunkSize = chunkSize;
        this.overlap = overlap;
    }

    private final List<Chunk> chunks = new ArrayList<>();

    public void addDocument(String docId, String text, Map<String, Object> meta) {
        var parts = chunk(text, chunkSize, overlap);
        for (int i = 0; i < parts.size(); i++) {
            chunks.add(new Chunk(docId, docId + "::" + i, parts.get(i), meta));
        }
    }

    public List<Hit> query(String q, int k) {
        if (q == null || q.isBlank()) return List.of();
        Set<String> qTokens = tokens(q);
        return chunks.stream()
                .map(c -> new AbstractMap.SimpleEntry<>(score(qTokens, c.text()), c))
                .sorted((a, b) -> Double.compare(b.getKey(), a.getKey()))
                .limit(Math.max(1, k))
                .map(e -> new Hit(e.getKey(), e.getValue()))
                .collect(Collectors.toList());
    }

    public String packWithinTokens(List<Hit> hits, int budgetTokens) {
        int used = 0;
        StringBuilder sb = new StringBuilder();
        for (Hit h : hits) {
            String t = h.chunk.text();
            int tokens = Math.max(1, t.length() / 4);
            if (used + tokens > budgetTokens) break;
            if (sb.length() > 0) sb.append("\n\n---\n\n");
            sb.append(t);
            used += tokens;
        }
        return sb.length() > 0 ? sb.toString() : "(no context found)";
    }

    private static Set<String> tokens(String s) {
        return Arrays.stream(s.toLowerCase().split("\\W+"))
                .filter(t -> t.length() > 2)
                .collect(Collectors.toSet());
    }

    private static double score(Set<String> q, String t) {
        Set<String> c = tokens(t);
        c.retainAll(q);
        return c.size();
    }

    private static List<String> chunk(String text, int size, int overlap) {
        String[] words = text.split("\\s+");
        List<String> parts = new ArrayList<>();
        for (int i = 0; i < words.length; i += Math.max(1, size - overlap)) {
            int end = Math.min(words.length, i + size);
            parts.add(String.join(" ", Arrays.copyOfRange(words, i, end)));
        }
        return parts.isEmpty() ? List.of(text) : parts;
    }

    public record Chunk(String docId, String id, String text, Map<String, Object> meta) {}
    public record Hit(double score, Chunk chunk) {}
}

