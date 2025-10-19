"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Sparkles, Copy, Check } from "lucide-react"

interface PromptFields {
  role: string
  context: string
  task: string
  outputFormat: string
  constraints: string
  examples: string
  tone: string
}

export default function StructuredMode() {
  const [fields, setFields] = useState<PromptFields>({
    role: "",
    context: "",
    task: "",
    outputFormat: "",
    constraints: "",
    examples: "",
    tone: "",
  })
  const [generatedPrompt, setGeneratedPrompt] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleFieldChange = (field: keyof PromptFields, value: string) => {
    setFields((prev) => ({ ...prev, [field]: value }))
  }

  const handleGenerate = async () => {
    setIsGenerating(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))

    let prompt = ""
    if (fields.role) prompt += `Role: ${fields.role}\n\n`
    if (fields.context) prompt += `Context: ${fields.context}\n\n`
    if (fields.task) prompt += `Task: ${fields.task}\n\n`
    if (fields.outputFormat) prompt += `Output Format: ${fields.outputFormat}\n\n`
    if (fields.constraints) prompt += `Constraints: ${fields.constraints}\n\n`
    if (fields.examples) prompt += `Examples: ${fields.examples}\n\n`
    if (fields.tone) prompt += `Tone: ${fields.tone}\n\n`

    setGeneratedPrompt(prompt.trim())
    setIsGenerating(false)
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(generatedPrompt)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const isFormValid = fields.role && fields.task

  return (
    <div className="space-y-10">
      <Card className="relative overflow-hidden border-2 border-border/50 bg-card/80 p-10 shadow-2xl backdrop-blur-sm">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />

        <div className="relative space-y-8">
          {/* Role - Required */}
          <div>
            <Label htmlFor="role" className="mb-4 block text-base font-bold text-foreground">
              Role <span className="text-destructive">*</span>
            </Label>
            <Input
              id="role"
              placeholder="e.g., Expert Python developer, Marketing copywriter, Data analyst"
              value={fields.role}
              onChange={(e) => handleFieldChange("role", e.target.value)}
              className="border-2 border-border/50 bg-input/50 focus:border-primary focus:bg-card h-12 text-base transition-all"
            />
          </div>

          {/* Context - Optional */}
          <div>
            <Label htmlFor="context" className="mb-4 block text-base font-bold text-foreground">
              Context <span className="text-muted-foreground text-sm font-normal">(Optional)</span>
            </Label>
            <Textarea
              id="context"
              placeholder="Provide background information or context for the task"
              value={fields.context}
              onChange={(e) => handleFieldChange("context", e.target.value)}
              className="min-h-[110px] resize-none border-2 border-border/50 bg-input/50 text-base leading-relaxed focus:border-primary focus:bg-card transition-all"
            />
          </div>

          {/* Task - Required */}
          <div>
            <Label htmlFor="task" className="mb-4 block text-base font-bold text-foreground">
              Task / Prompt <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="task"
              placeholder="Describe what you want the AI to do"
              value={fields.task}
              onChange={(e) => handleFieldChange("task", e.target.value)}
              className="min-h-[130px] resize-none border-2 border-border/50 bg-input/50 text-base leading-relaxed focus:border-primary focus:bg-card transition-all"
            />
          </div>

          {/* Output Format - Optional */}
          <div>
            <Label htmlFor="outputFormat" className="mb-4 block text-base font-bold text-foreground">
              Output Format <span className="text-muted-foreground text-sm font-normal">(Optional)</span>
            </Label>
            <Input
              id="outputFormat"
              placeholder="e.g., JSON, Markdown, Bullet points, Step-by-step guide"
              value={fields.outputFormat}
              onChange={(e) => handleFieldChange("outputFormat", e.target.value)}
              className="border-2 border-border/50 bg-input/50 focus:border-primary focus:bg-card h-12 text-base transition-all"
            />
          </div>

          {/* Constraints - Optional */}
          <div>
            <Label htmlFor="constraints" className="mb-4 block text-base font-bold text-foreground">
              Constraints <span className="text-muted-foreground text-sm font-normal">(Optional)</span>
            </Label>
            <Textarea
              id="constraints"
              placeholder="Any limitations or requirements (e.g., word count, specific technologies, style guidelines)"
              value={fields.constraints}
              onChange={(e) => handleFieldChange("constraints", e.target.value)}
              className="min-h-[110px] resize-none border-2 border-border/50 bg-input/50 text-base leading-relaxed focus:border-primary focus:bg-card transition-all"
            />
          </div>

          {/* Examples - Optional */}
          <div>
            <Label htmlFor="examples" className="mb-4 block text-base font-bold text-foreground">
              Examples <span className="text-muted-foreground text-sm font-normal">(Optional)</span>
            </Label>
            <Textarea
              id="examples"
              placeholder="Provide examples of desired output or similar scenarios"
              value={fields.examples}
              onChange={(e) => handleFieldChange("examples", e.target.value)}
              className="min-h-[110px] resize-none border-2 border-border/50 bg-input/50 text-base leading-relaxed focus:border-primary focus:bg-card transition-all"
            />
          </div>

          {/* Tone - Optional */}
          <div>
            <Label htmlFor="tone" className="mb-4 block text-base font-bold text-foreground">
              Tone <span className="text-muted-foreground text-sm font-normal">(Optional)</span>
            </Label>
            <Input
              id="tone"
              placeholder="e.g., Professional, Casual, Friendly, Technical, Creative"
              value={fields.tone}
              onChange={(e) => handleFieldChange("tone", e.target.value)}
              className="border-2 border-border/50 bg-input/50 focus:border-primary focus:bg-card h-12 text-base transition-all"
            />
          </div>

          <Button
            onClick={handleGenerate}
            disabled={!isFormValid || isGenerating}
            className="w-full gap-3 bg-gradient-to-r from-primary via-secondary to-accent text-primary-foreground hover:shadow-2xl hover:scale-[1.02] transition-all h-14 text-base font-bold shadow-xl"
            size="lg"
          >
            <Sparkles className="h-5 w-5" />
            {isGenerating ? "Generating..." : "Generate Structured Prompt"}
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
              Structured Prompt
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
