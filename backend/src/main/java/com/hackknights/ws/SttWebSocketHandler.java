package com.hackknights.ws;

import com.hackknights.llm.TranscriptionClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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

@Component
public class SttWebSocketHandler implements WebSocketHandler {

    private static final Logger log = LoggerFactory.getLogger(SttWebSocketHandler.class);
    private final TranscriptionClient transcriptionClient;

    public SttWebSocketHandler(TranscriptionClient transcriptionClient) {
        this.transcriptionClient = transcriptionClient;
    }

    @Override
    public Mono<Void> handle(WebSocketSession session) {
        log.info("WebSocket connection established: {}", session.getId());
        
        Sinks.Many<String> outgoing = Sinks.many().unicast().onBackpressureBuffer();

        Path tempPath;
        try {
            tempPath = Files.createTempFile("stt-", ".webm");
            log.info("Created temp file: {}", tempPath);
        } catch (Exception e) {
            log.error("Failed to create temp file", e);
            return session.close();
        }

        Path target = tempPath;

        Flux<WebSocketMessage> output = outgoing.asFlux()
                .map(session::textMessage)
                .doOnNext(msg -> log.debug("Sending message to client"))
                .doOnComplete(() -> log.info("Outbound stream completed"))
                .doOnSubscribe(s -> {
                    log.info("Output flux subscribed, sending ready message");
                    outgoing.tryEmitNext("ready");
                });

        Mono<Void> sessionHandler = session.receive()
                .doOnNext(msg -> log.debug("Received message type: {}", msg.getType()))
                .doOnComplete(() -> log.info("Client disconnected"))
                .concatMap(msg -> {
                    try {
                        if (msg.getType() == WebSocketMessage.Type.BINARY) {
                            DataBuffer payload = msg.getPayload();
                            int byteCount = payload.readableByteCount();
                            log.debug("Writing {} bytes to temp file", byteCount);
                            
                            // Extract bytes BEFORE switching threads (buffer gets released by framework)
                            byte[] data = new byte[byteCount];
                            payload.read(data);
                            
                            // Use synchronous write to avoid AsynchronousFileChannel APPEND issues on Unix
                            return Mono.fromCallable(() -> {
                                try (var channel = java.nio.channels.FileChannel.open(target, 
                                        StandardOpenOption.CREATE, StandardOpenOption.WRITE, StandardOpenOption.APPEND)) {
                                    channel.write(java.nio.ByteBuffer.wrap(data));
                                    return null;
                                }
                            }).subscribeOn(reactor.core.scheduler.Schedulers.boundedElastic())
                            .then();
                                    
                        } else if (msg.getType() == WebSocketMessage.Type.TEXT) {
                            String text = msg.getPayloadAsText();
                            log.info("Received text message: {}", text);
                            
                            if ("end".equalsIgnoreCase(text.trim())) {
                                log.info("Transcribing audio file: {}", target);
                                return transcriptionClient.transcribe(target.toFile())
                                        .defaultIfEmpty("(no transcription)")
                                        .doOnNext(t -> log.info("Transcription result: {}", t))
                                        .doOnNext(t -> {
                                            outgoing.tryEmitNext(t);
                                            outgoing.tryEmitComplete();
                                        })
                                        .then()
                                        .onErrorResume(e -> {
                                            log.error("Transcription error", e);
                                            outgoing.tryEmitNext("Transcription failed: " + e.getMessage());
                                            outgoing.tryEmitComplete();
                                            return Mono.empty();
                                        });
                            }
                        }
                        return Mono.empty();
                    } catch (Exception e) {
                        log.error("Error processing message", e);
                        outgoing.tryEmitError(e);
                        return Mono.empty();
                    }
                })
                .then()
                .doFinally(__ -> {
                    try { 
                        Files.deleteIfExists(target);
                        log.info("Cleaned up temp file: {}", target);
                    } catch (Exception e) {
                        log.warn("Failed to delete temp file", e);
                    }
                });

        return session.send(output)
                .and(sessionHandler)
                .doOnSuccess(__ -> log.info("WebSocket session completed"))
                .doOnError(e -> log.error("WebSocket session error", e));
    }
}