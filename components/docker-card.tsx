"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/ui/hover-card"
import type { DockerTool } from "@/lib/docker-tools"
import { cn } from "@/lib/utils"
import { Star } from "lucide-react"
import Link from "next/link"
import posthog from "posthog-js"
import { useEffect, useRef, useState } from "react"
import { siGithub } from "simple-icons"

interface DockerCardProps {
  tool: DockerTool
  isSelected: boolean
  onSelect: () => void
}

function TruncatedText({ text }: { text: string }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isTruncated, setIsTruncated] = useState(false)
  const textRef = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    const element = textRef.current
    if (element) {
      setIsTruncated(element.scrollHeight > element.clientHeight)
    }
  }, [text])
  return (
    <p
      ref={textRef}
      className={cn("select-none text-xs", !isExpanded && "line-clamp-3")}
    >
      {text}
      {isTruncated && !isExpanded && (
        <span
          className="description-expand cursor-pointer text-blue-500 hover:underline"
          onClick={(e) => {
            e.stopPropagation()
            setIsExpanded(!isExpanded)
          }}
          onKeyUp={(e) => {
            if (e.key === "Enter") {
              e.stopPropagation()
              setIsExpanded(!isExpanded)
            }
          }}
        >
          {" "}
          ...
        </span>
      )}
    </p>
  )
}

export default function DockerCard({
  tool,
  isSelected,
  onSelect,
}: DockerCardProps) {
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false)

  const handleCardClick = (e: React.MouseEvent) => {
    if (
      (e.target as Element).closest(".github-link") ||
      (e.target as Element).closest(".description-expand") ||
      tool.isUnsupported
    ) {
      e.stopPropagation()
      return
    }
    onSelect()
  }

  const formatStars = (count?: number) => {
    if (!count) return "0"
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`
    }
    return count.toString()
  }

  const CardComponent = (
    <Card
      className={cn(
        "group relative h-full cursor-pointer select-none overflow-hidden rounded-sm transition-all hover:shadow-md",
        isSelected && !tool.isUnsupported
          ? "bg-secondary"
          : tool.isUnsupported
            ? "hover:border-destructive/50"
            : "hover:border-muted-foreground/20",
        "hover:motion-safe:scale-105",
      )}
      onClick={handleCardClick}
    >
      <div
        className={cn(
          "h-1 w-full transition-colors duration-300",
          isSelected && !tool.isUnsupported
            ? "bg-primary"
            : tool.isUnsupported
              ? "bg-transparent group-hover:bg-destructive/50"
              : "bg-transparent group-hover:bg-primary/30",
        )}
      />

      {tool.githubUrl && (
        <div className="absolute top-2 right-2 z-10 flex items-center gap-2">
          {tool.stars !== undefined && (
            <div className="flex items-center gap-1 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <span className="font-medium text-muted-foreground text-sm">
                {formatStars(tool.stars)}
              </span>
              <Star className="h-4 w-4 fill-muted-foreground text-muted-foreground" />
            </div>
          )}
          <Link
            href={tool.githubUrl}
            target="_blank"
            className="github-link rounded-full bg-background/80 p-1.5 opacity-0 shadow-sm transition-all duration-300 hover:scale-110 hover:bg-background hover:shadow-md group-hover:opacity-100"
            onClick={(e) => {
              posthog.capture("github_link_clicked", { tool_id: tool.id })
              e.stopPropagation()
            }}
          >
            <svg
              aria-label="GitHub"
              role="img"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 fill-primary"
            >
              <path d={siGithub.path} />
            </svg>
            <span className="sr-only">GitHub repository</span>
          </Link>
        </div>
      )}

      <CardContent className="flex h-full flex-col p-4">
        <div className="mb-3 grid grid-cols-[auto_1fr] items-center gap-2">
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center overflow-hidden rounded-md transition-all duration-300",
              isSelected && !tool.isUnsupported
                ? "bg-primary/40 text-primary-foreground"
                : "bg-primary/10 text-primary group-hover:bg-primary/20",
            )}
          >
            {tool.icon ? (
              <img
                src={tool.icon}
                alt={tool.name}
                className="h-full min-h-4 w-full min-w-4 p-1.5"
              />
            ) : (
              <div className="font-bold">{tool.name.charAt(0)}</div>
            )}
          </div>
          <div className="flex w-full items-center justify-between gap-2">
            <h3 className="font-mono font-semibold tracking-tight">
              {tool.name}
            </h3>
            <p className="text-muted-foreground text-xs">{tool.category}</p>
          </div>
        </div>
        <div className="mb-3">
          <TruncatedText text={tool.description} />
        </div>
        <div className="mt-auto flex flex-wrap gap-1">
          {tool.tags.map((tag) => (
            <Badge
              key={tag}
              variant="outline"
              className="rounded-md px-1 font-normal text-xs transition-all duration-300"
            >
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  )

  if (tool.isUnsupported) {
    return (
      <HoverCard openDelay={100} closeDelay={100}>
        <HoverCardTrigger asChild>{CardComponent}</HoverCardTrigger>
        <HoverCardContent className="w-80 border-destructive shadow-md">
          <div className="flex flex-col gap-2">
            <p className="font-semibold">Unsupported Container</p>
            <p className="text-muted-foreground text-xs">
              This container is not officially supported in our tool. <br />
              We recommend following the official documentation for installation
              instructions.
            </p>
            <Link
              href={tool.githubUrl || "#"}
              target="_blank"
              className="text-primary text-sm hover:underline"
            >
              View Official Documentation
            </Link>
          </div>
        </HoverCardContent>
      </HoverCard>
    )
  }

  return CardComponent
}
