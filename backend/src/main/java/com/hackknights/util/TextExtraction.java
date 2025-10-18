package com.hackknights.util;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;

import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.apache.poi.xwpf.extractor.XWPFWordExtractor;
import java.io.InputStream;

public final class TextExtraction {
    private TextExtraction() {}

    public static String extract(Path path, String filename) throws IOException {
        String lower = filename == null ? "" : filename.toLowerCase();
        if (lower.endsWith(".pdf")) {
            return extractPdf(path);
        }
        if (lower.endsWith(".docx")) {
            return extractDocx(path);
        }
        return Files.readString(path, StandardCharsets.UTF_8);
    }

    private static String extractPdf(Path path) throws IOException {
        try (PDDocument doc = PDDocument.load(path.toFile())) {
            PDFTextStripper stripper = new PDFTextStripper();
            return stripper.getText(doc);
        }
    }

    private static String extractDocx(Path path) throws IOException {
    try (InputStream is = Files.newInputStream(path);
         XWPFDocument doc = new XWPFDocument(is)) {
        try (XWPFWordExtractor extractor = new XWPFWordExtractor(doc)) {
            return extractor.getText();
        }
    }
}
}