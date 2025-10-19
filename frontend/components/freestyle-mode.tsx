"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Upload, Mic, MicOff, Sparkles, X, Copy, Check } from "lucide-react"
import { useVoiceInput } from "@/hooks/useVoiceInput"

export default function FreestyleMode() {
  const [prompt, setPrompt] = useState("")
  const [files, setFiles] = useState<File[]>([])
  const [generatedPrompt, setGeneratedPrompt] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [copied, setCopied] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { isRecording, transcript, toggleRecording } = useVoiceInput({
    onTranscript: (text) => {
      console.log("Setting prompt to:", text)
      setPrompt(prev => prev ? `${prev} ${text}` : text)
    },
    onError: (error) => {
      console.error("Voice input error:", error)
      alert(`Voice input failed: ${error.message}`)
    },
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files))
    }
  }

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index))
  }


  const handleGenerate = async () => {
    setIsGenerating(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setGeneratedPrompt(
      `Enhanced Prompt:\n\nYou are an expert assistant specializing in ${prompt.slice(0, 30)}... Please provide a comprehensive response that includes:\n\n1. Clear context and background\n2. Specific examples and use cases\n3. Step-by-step explanations\n4. Best practices and recommendations\n\nEnsure your response is well-structured, accurate, and actionable.`,
    )
    setIsGenerating(false)
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(generatedPrompt)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-10">
      <Card className="relative overflow-hidden border-2 border-border/50 bg-card/80 p-10 shadow-2xl backdrop-blur-sm">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />

        <div className="relative space-y-8">
          {/* File Upload */}
          <div>
            <Label htmlFor="file-upload" className="mb-4 block text-base font-bold text-foreground">
              Upload Files <span className="text-muted-foreground text-sm font-normal">(Optional)</span>
            </Label>
            <div className="flex items-center gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="gap-2 border-2 border-primary/30 bg-primary/5 hover:border-primary hover:bg-primary/10 hover:shadow-lg transition-all"
              >
                <Upload className="h-5 w-5" />
                Choose Files
              </Button>
              <input
                ref={fileInputRef}
                id="file-upload"
                type="file"
                multiple
                onChange={handleFileChange}
                className="hidden"
              />
              {files.length > 0 && (
                <span className="text-sm font-semibold text-primary">
                  {files.length} file{files.length > 1 ? "s" : ""} selected
                </span>
              )}
            </div>
            {files.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-3">
                {files.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 rounded-xl border-2 border-primary/20 bg-gradient-to-r from-primary/10 to-secondary/10 px-4 py-2.5 shadow-md backdrop-blur-sm"
                  >
                    <span className="max-w-[200px] truncate text-sm font-semibold text-foreground">{file.name}</span>
                    <button
                      onClick={() => removeFile(index)}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Prompt Input */}
          <div>
            <div className="mb-4 flex items-center justify-between">
              <Label htmlFor="prompt" className="text-base font-bold text-foreground">
                Your Prompt
              </Label>
              <Button
                type="button"
                variant={isRecording ? "destructive" : "outline"}
                size="sm"
                onClick={toggleRecording}
                className="gap-2 border-2 shadow-md hover:shadow-lg transition-all"
              >
                {isRecording ? (
                  <>
                    <MicOff className="h-4 w-4" />
                    Stop Recording
                  </>
                ) : (
                  <>
                    <Mic className="h-4 w-4" />
                    Voice Input
                  </>
                )}
              </Button>
            </div>
            <Textarea
              id="prompt"
              placeholder="Describe what you want the AI to do... (or use voice input)"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[220px] resize-none border-2 border-border/50 bg-input/50 text-base leading-relaxed focus:border-primary focus:bg-card transition-all"
            />
            {isRecording && (
              <p className="mt-4 flex items-center gap-2 text-sm font-semibold text-destructive">
                <span className="inline-block h-2.5 w-2.5 animate-pulse rounded-full bg-destructive shadow-lg"></span>
                Recording... Speak now
              </p>
            )}
          </div>

          <Button
            onClick={handleGenerate}
            disabled={!prompt.trim() || isGenerating}
            className="w-full gap-3 bg-gradient-to-r from-primary via-secondary to-accent text-primary-foreground hover:shadow-2xl hover:scale-[1.02] transition-all h-14 text-base font-bold shadow-xl"
            size="lg"
          >
            <Sparkles className="h-5 w-5" />
            {isGenerating ? "Generating..." : "Generate Enhanced Prompt"}
          </Button>
        </div>
      </Card>

      {generatedPrompt && (
        <Card className="relative overflow-hidden border-2 border-primary/40 bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10 p-10 shadow-2xl backdrop-blur-sm">
          <div className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full bg-primary/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-accent/20 blur-3xl" />

          <div className="relative">
            <h3 className="mb-8 flex items-center gap-3 text-2xl font-bold text-foreground">
              <div className="rounded-xl bg-gradient-to-r from-primary to-secondary p-2 shadow-lg">
                <Sparkles className="h-6 w-6 text-primary-foreground" />
              </div>
              Enhanced Prompt
            </h3>
            <div className="rounded-2xl border-2 border-border/50 bg-card/90 p-8 shadow-xl backdrop-blur-sm">
              <pre className="whitespace-pre-wrap font-sans text-base leading-relaxed text-card-foreground">
                {generatedPrompt}
              </pre>
            </div>
            <div className="mt-8 flex gap-4">
              <Button
                variant="default"
                onClick={handleCopy}
                className="gap-2 bg-gradient-to-r from-primary to-secondary hover:shadow-xl transition-all"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copied!" : "Copy to Clipboard"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setGeneratedPrompt("")}
                className="border-2 hover:bg-muted/50 transition-all"
              >
                Clear
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
