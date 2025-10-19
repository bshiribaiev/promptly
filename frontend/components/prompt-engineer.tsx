"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import FreestyleMode from "@/components/freestyle-mode"
import StructuredMode from "@/components/structured-mode"
import { Sparkles, Zap } from "lucide-react"

export default function PromptEngineer() {
  const [activeTab, setActiveTab] = useState("freestyle")

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-background via-primary/5 to-accent/10">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-1/4 top-0 h-[600px] w-[600px] rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -right-1/4 top-1/3 h-[500px] w-[500px] rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-[400px] w-[400px] rounded-full bg-secondary/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <h1 className="mb-6 text-balance bg-gradient-to-br from-foreground via-foreground to-foreground/70 bg-clip-text text-6xl font-bold tracking-tight text-transparent sm:text-7xl">
            Craft Better Prompts
          </h1>
          <p className="mx-auto max-w-2xl text-pretty text-xl leading-relaxed text-muted-foreground">
            Transform your ideas into powerful AI prompts with our intelligent prompt builder
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-10 grid h-14 w-full max-w-md mx-auto grid-cols-2 gap-2 rounded-2xl bg-card/50 p-2 shadow-xl backdrop-blur-md border border-border/50">
            <TabsTrigger
              value="freestyle"
              className="rounded-xl text-base font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg transition-all"
            >
              Freestyle
            </TabsTrigger>
            <TabsTrigger
              value="structured"
              className="rounded-xl text-base font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg transition-all"
            >
              Structured
            </TabsTrigger>
          </TabsList>

          <TabsContent value="freestyle" className="mt-0">
            <FreestyleMode />
          </TabsContent>

          <TabsContent value="structured" className="mt-0">
            <StructuredMode />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
