package com.hackknights.api.dto;

import com.hackknights.retrieval.RetrievalService;

import java.util.List;

public class AskDto {
    public static record AskRequest(
            String text,
            String templateId,
            Integer topK,
            Integer contextBudgetTokens,
            Boolean returnAnswer
    ) {}

    public static record AskResponse(
            String templateId,
            String query,
            String prompt,
            List<RetrievalService.Hit> retrieval,
            String answer
    ) {}
}

