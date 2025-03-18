"use client"

import { SearchCommand } from "@/components/search-command"
import type { DockerSettings } from "@/components/settings-panel"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { Search } from "lucide-react"
import posthog from "posthog-js"
import { useEffect, useState } from "react"

interface FloatingBarProps {
  selectedCount: number
  selectedTools: string[]
  selectedToolIds: string[]
  settings: DockerSettings
  onReset?: () => void
  onToggleToolSelection: (toolId: string) => void
  scrollPosition?: number
}

export default function FloatingBar({
  selectedCount,
  selectedTools,
  selectedToolIds,
  settings,
  onReset,
  onToggleToolSelection,
  scrollPosition = 200,
}: FloatingBarProps) {
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false)
  const [isCopyDialogOpen, setIsCopyDialogOpen] = useState(false)
  const [isFixed, setIsFixed] = useState(false)
  const [isApple, setIsApple] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsApple(/Mac|iPod|iPhone|iPad/.test(navigator.userAgent))
    }
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return

    const handleScroll = () => {
      setIsFixed(window.scrollY > scrollPosition)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [scrollPosition])

  const handleReset = () => {
    if (onReset) {
      onReset()
    }
    setIsResetDialogOpen(false)
  }

  const handleCopy = () => {
    console.log("Copy docker-compose.yaml with:", { selectedTools, settings })
    setIsCopyDialogOpen(false)
  }

  const triggerSearchShortcut = (e: React.MouseEvent) => {
    if (!isMounted) return

    e.preventDefault()

    const customEvent = new CustomEvent("triggerCommandK", {
      bubbles: true,
    })
    document.dispatchEvent(customEvent)
  }

  return (
    <>
      <SearchCommand
        selectedTools={selectedToolIds}
        onToggleToolSelection={onToggleToolSelection}
      />

      {isMounted && (
        <>
          <AlertDialog
            open={isResetDialogOpen}
            onOpenChange={setIsResetDialogOpen}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will reset all selections and settings to their default
                  values.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive hover:bg-destructive/90"
                  onClick={handleReset}
                >
                  Reset All
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <AlertDialog
            open={isCopyDialogOpen}
            onOpenChange={setIsCopyDialogOpen}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Copy Docker Compose</AlertDialogTitle>
                <AlertDialogDescription>
                  Generate and copy docker-compose.yaml for {selectedCount}{" "}
                  selected tool{selectedCount !== 1 ? "s" : ""}.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    posthog.capture("copy_compose_clicked", {
                      selected_tools: selectedTools,
                      settings: settings,
                    })
                    handleCopy()
                  }}
                >
                  Copy
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <div
            className={cn(
              "sticky bottom-0 left-0 right-0 z-10 flex transform-gpu items-center justify-between gap-4 bg-background p-4 shadow-lg transition-all",
              isFixed
                ? "rounded-t-none border-t"
                : "rounded-lg border [animation-delay:200ms] motion-safe:animate-slide-up",
            )}
            style={{
              backdropFilter: "blur(4px)",
              WebkitBackdropFilter: "blur(4px)",
            }}
          >
            <div className="flex w-full items-center justify-between">
              <div className="flex items-center gap-3">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={triggerSearchShortcut}
                  className="hidden md:flex"
                >
                  <Search className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">
                    Search&nbsp;
                    <span className="hidden text-muted-foreground lg:inline-flex">
                      tools...
                    </span>
                  </span>
                  <kbd className="pointer-events-none ml-auto hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 xl:flex">
                    {isApple ? (
                      <>
                        <span className="text-xs">⌘</span>K
                      </>
                    ) : (
                      <>
                        <span className="text-xs">Ctrl</span>K
                      </>
                    )}
                  </kbd>
                </Button>

                <div>
                  <h3 className="text-sm font-medium">
                    Selected: <span className="font-bold">{selectedCount}</span>
                  </h3>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {selectedTools.length > 0 && (
                      <p className="hidden lg:flex">
                        {selectedTools.slice(0, 3).join(", ")}
                        {selectedTools.length > 3 && (
                          <Badge
                            variant="outline"
                            className="ml-1 rounded-md px-1.5 font-normal text-xs"
                          >
                            +{selectedTools.length - 3} more
                          </Badge>
                        )}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="text-right">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        className={cn("flex-shrink-0")}
                        disabled={selectedCount === 0}
                      >
                        Generate
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      align="end"
                      className="w-72 p-3 text-sm sm:w-80"
                    >
                      <div className="space-y-3">
                        <h4 className="font-medium">
                          Your docker-compose.yaml is ready!
                        </h4>
                        <p className="text-muted-foreground">
                          Copy the configuration by clicking the button below, or
                          click outside to close.
                        </p>
                        <div className="grid gap-2">
                          <Button
                            onClick={() => {
                              posthog.capture("copy_configuration_clicked", {
                                selected_tools: selectedTools,
                                settings: settings,
                              })
                              setIsCopyDialogOpen(true)
                            }}
                            className="w-full"
                          >
                            Copy Configuration
                          </Button>
                          <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => setIsResetDialogOpen(true)}
                          >
                            Reset All
                          </Button>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}
