"use client"

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { DialogTitle } from "@/components/ui/dialog"
import { dockerTools } from "@/lib/docker-tools"
import { Check, X } from "lucide-react"
import { useEffect, useState } from "react"

interface SearchCommandProps {
  selectedTools: string[]
  onToggleToolSelection: (toolId: string) => void
}

export function SearchCommand({
  selectedTools,
  onToggleToolSelection,
}: SearchCommandProps) {
  const [open, setOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  const filteredTools = dockerTools.filter((tool) =>
    tool.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    const handleCustomTrigger = () => {
      setOpen((open) => !open)
    }

    document.addEventListener("keydown", down)
    document.addEventListener("triggerCommandK", handleCustomTrigger)

    return () => {
      document.removeEventListener("keydown", down)
      document.removeEventListener("triggerCommandK", handleCustomTrigger)
    }
  }, [])

  const handleToolSelect = (toolId: string) => {
    const tool = dockerTools.find((t) => t.id === toolId)
    if (tool && !tool.isUnsupported) {
      onToggleToolSelection(toolId)
    }
  }

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <DialogTitle className="sr-only">Search Services</DialogTitle>
      <CommandInput
        placeholder="Search for services..."
        value={searchTerm}
        onValueChange={setSearchTerm}
      />
      <CommandList>
        <CommandEmpty>No services found.</CommandEmpty>

        <CommandGroup>
          {filteredTools.map((tool) => (
            <CommandItem
              key={tool.id}
              onSelect={() => handleToolSelect(tool.id)}
              className={"flex items-center justify-between"}
              disabled={tool.isUnsupported}
            >
              <div className="flex items-center">
                <span>{tool.name}</span>
              </div>
              {tool.isUnsupported && (
                <div
                  className="ml-2 flex items-center text-destructive"
                  title="This service is not supported"
                >
                  <X className="h-4 w-4" />
                </div>
              )}
              {selectedTools.includes(tool.id) && (
                <Check className="ml-2 h-4 w-4 text-primary" />
              )}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
