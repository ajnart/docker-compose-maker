import type { DockerSettings } from "@/components/settings-panel"
import type { DockerTool } from "@/lib/docker-tools"
import { detectAndFixPortConflicts } from "./port-conflicts"

export function generateEnvFileContent(settings: DockerSettings): string {
  return `# Docker Compose Environment Variables
# These can be overridden by setting them in your shell or in a .env file

# User/Group Identifiers
# These help avoid permission issues between host and container
PUID=${settings.puid}
PGID=${settings.pgid}
UMASK=${settings.umask}

# Container name prefix
CONTAINER_PREFIX=${settings.containerNamePrefix}

# Paths for persistent data
CONFIG_PATH=${settings.configPath}
DATA_PATH=${settings.dataPath}

# Container settings
TZ=${settings.timezone}
RESTART_POLICY=${settings.restartPolicy}
NETWORK_MODE=${settings.networkMode}
`
}

export function generateComposeContent(
  selectedTools: DockerTool[],
  settings: DockerSettings,
  showInterpolated: boolean,
): {
  content: string
  portConflicts: { fixed: number; conflicts: string[] } | null
} {
  const composeHeader = `#  ____   ____ __  __ 
# |  _ \\ / ___|  \\/  |
# | | | | |   | |\\/| | This compose file was generated by DCM: https://github.com/ajnart/docker-compose-maker
# | |_| | |___| |  | |
# |____/ \\____|_|  |_|
#
`

  let servicesSection = `services:
`

  selectedTools.forEach((tool) => {
    if (!tool.composeContent) return
    servicesSection += `
`
    servicesSection += `  # ${tool.name}: ${tool.description}
`
    let toolContent = tool.composeContent.replace(/^services:\s*/gm, "")

    const lines = toolContent.split("\n")
    let currentIndentLevel = 0

    const processedLines = lines.map((line, index) => {
      if (line.trim() === "") return line

      const trimmedLine = line.trim()
      const isServiceLine = index === 0 || lines[index - 1].trim() === ""

      if (isServiceLine) {
        currentIndentLevel = 0
        return `  ${trimmedLine}`
      }

      const definesBlock =
        trimmedLine.endsWith(":") && !trimmedLine.includes(": ")

      const prevLine = index > 0 ? lines[index - 1].trim() : ""
      const prevDefinesBlock =
        prevLine.endsWith(":") && !prevLine.includes(": ")

      if (prevDefinesBlock) {
        currentIndentLevel++
      } else if (!isServiceLine && index > 0) {
        const originalIndent = line.match(/^\s*/)?.[0].length || 0
        const prevOriginalIndent =
          lines[index - 1].match(/^\s*/)?.[0].length || 0

        if (originalIndent < prevOriginalIndent) {
          const levels = Math.floor((prevOriginalIndent - originalIndent) / 2)
          currentIndentLevel = Math.max(0, currentIndentLevel - levels)
        }
      }

      const spaces = 2 + currentIndentLevel * 2
      return `${" ".repeat(spaces)}${trimmedLine}`
    })

    toolContent = processedLines.join("\n")

    if (showInterpolated) {
      toolContent = toolContent
        .replace(/\$\{CONFIG_PATH\}/g, settings.configPath)
        .replace(/\$\{DATA_PATH\}/g, settings.dataPath)
        .replace(/\$\{TZ\}/g, settings.timezone)
        .replace(/\$\{PUID\}/g, settings.puid)
        .replace(/\$\{PGID\}/g, settings.pgid)
        .replace(/\$\{UMASK\}/g, settings.umask)
        .replace(/\$\{RESTART_POLICY\}/g, settings.restartPolicy)
        .replace(/\$\{NETWORK_MODE\}/g, settings.networkMode)
        .replace(/\$\{CONTAINER_PREFIX\}/g, settings.containerNamePrefix)
    }

    servicesSection += `${toolContent}\n`
  })

  const completeCompose = composeHeader + servicesSection

  const { fixedContent, conflicts } = detectAndFixPortConflicts(completeCompose)

  return {
    content: fixedContent,
    portConflicts: conflicts,
  }
}
