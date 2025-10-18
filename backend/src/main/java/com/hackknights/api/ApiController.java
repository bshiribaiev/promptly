package com.hackknights.api;

import com.hackknights.api.dto.AskDto;
import com.hackknights.llm.Templates;
import com.hackknights.retrieval.RetrievalService;
import com.hackknights.util.TextExtraction;
import org.springframework.http.MediaType;
import org.springframework.http.codec.multipart.FilePart;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.core.io.buffer.DataBufferUtils;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

import org.springframework.web.bind.annotation.*;
import org.springframework.core.io.buffer.DataBufferUtils;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;
import com.hackknights.llm.LlmClient; // add this line

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardOpenOption;
import java.util.*;

@RestController
@RequestMapping
public class ApiController {

    private final RetrievalService retrieval;
    private final LlmClient llm; // add this field

    public ApiController(RetrievalService retrieval, LlmClient llm) { // inject it
        this.retrieval = retrieval;
        this.llm = llm;
    }

    @GetMapping("/healthz")
    public Map<String, Object> healthz() {
        return Map.of("status", "ok");
    }

    @PostMapping(value = "/ingest", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Mono<Map<String, Object>> ingest(@RequestPart("files") Flux<FilePart> files) {
        return files.flatMap(fp ->
                saveTemp(fp).flatMap(tmp ->
                        Mono.fromCallable(() -> TextExtraction.extract(tmp, fp.filename()))
                                .subscribeOn(Schedulers.boundedElastic())
                                .doFinally(__ -> { try { Files.deleteIfExists(tmp); } catch (Exception ignored) {} })
                                .map(text -> {
                                    String docId = UUID.randomUUID().toString();
                                    retrieval.addDocument(docId, text, Map.of("filename", fp.filename()));
                                    return Map.of("doc_id", docId, "filename", fp.filename(), "chars", text.length());
                                })
                )
        ).collectList().map(list -> Map.of("count", list.size(), "items", list));
    }

    @PostMapping(value = "/ask", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public Mono<AskDto.AskResponse> ask(@Validated @RequestBody Mono<AskDto.AskRequest> req) {
        return req.flatMap(r -> Mono.fromCallable(() -> {
            String text = Optional.ofNullable(r.text()).orElse("").trim();
            int topK = Optional.ofNullable(r.topK()).orElse(6);
            int budget = Optional.ofNullable(r.contextBudgetTokens()).orElse(800);
            var hits = retrieval.query(text, topK);
            String context = retrieval.packWithinTokens(hits, budget);
            String prompt = Templates.render(r.templateId(), context, text);
            String answer = Boolean.TRUE.equals(r.returnAnswer()) ? llm.complete(prompt) : null;
            return new AskDto.AskResponse(r.templateId(), text, prompt, hits, answer);
        }).subscribeOn(Schedulers.boundedElastic()));
    }

    private Mono<Path> saveTemp(FilePart fp) {
        try {
            Path tmp = Files.createTempFile("upload-", "-" + fp.filename());
            return DataBufferUtils.write(fp.content(), tmp,
                            StandardOpenOption.CREATE,
                            StandardOpenOption.TRUNCATE_EXISTING)
                    .then(Mono.just(tmp));
        } catch (Exception e) {
            return Mono.error(e);
        }
    }
}