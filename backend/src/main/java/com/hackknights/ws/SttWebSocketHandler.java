package com.hackknights.ws;

import com.hackknights.llm.TranscriptionClient;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.socket.WebSocketHandler;
import org.springframework.web.reactive.socket.WebSocketMessage;
import org.springframework.web.reactive.socket.WebSocketSession;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.core.io.buffer.DataBufferUtils;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.core.publisher.Sinks;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardOpenOption;
import java.util.concurrent.atomic.AtomicBoolean;

@Component
public class SttWebSocketHandler implements WebSocketHandler {

    private final TranscriptionClient transcriptionClient;

    public SttWebSocketHandler(TranscriptionClient transcriptionClient) {
        this.transcriptionClient = transcriptionClient;
    }

    @Override
    public Mono<Void> handle(WebSocketSession session) {
        Sinks.Many<WebSocketMessage> outgoing = Sinks.many().unicast().onBackpressureBuffer();

        Path tempPath;
        try {
            tempPath = Files.createTempFile("stt-", ".bin");
        } catch (Exception e) {
            return session.close();
        }

        Path target = tempPath;
        AtomicBoolean created = new AtomicBoolean(false);

        Mono<Void> inbound = session.receive()
                .flatMap(msg -> {
                    if (msg.getType() == WebSocketMessage.Type.BINARY) {
                        DataBuffer payload = msg.getPayload();
                        Flux<DataBuffer> one = Flux.just(payload);
                        if (created.compareAndSet(false, true)) {
                            return DataBufferUtils.write(one, target,
                                            StandardOpenOption.CREATE,
                                            StandardOpenOption.TRUNCATE_EXISTING)
                                    .then();
                        } else {
                            return DataBufferUtils.write(one, target, StandardOpenOption.APPEND)
                                    .then();
                        }
                    } else if (msg.getType() == WebSocketMessage.Type.TEXT) {
                        String text = msg.getPayloadAsText();
                        if ("end".equalsIgnoreCase(text.trim())) {
                            return transcriptionClient.transcribe(target.toFile())
                                    .defaultIfEmpty("")
                                    .flatMap(t -> {
                                        outgoing.tryEmitNext(session.textMessage(t));
                                        outgoing.tryEmitComplete();
                                        return Mono.empty();
                                    });
                        }
                        return Mono.empty();
                    }
                    return Mono.empty();
                })
                .then()
                .doFinally(__ -> {
                    try { Files.deleteIfExists(target); } catch (Exception ignored) {}
                });

        Mono<Void> outbound = session.send(outgoing.asFlux());

        return Mono.when(inbound, outbound);
    }
}