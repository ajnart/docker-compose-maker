"use client"

import ToolGrid from "@/components/ToolGrid"
import FloatingBar from "@/components/floating-bar"
import SettingsPanel, { type DockerSettings } from "@/components/settings-panel"
import { useLocalStorage } from "@/hooks/useLocalStorage"
import type { DockerTool } from "@/lib/docker-tools"
import { useForm } from "@tanstack/react-form"
import posthog from "posthog-js"

const defaultSettings: DockerSettings = {
  configPath: "/opt/appdata/config",
  dataPath: "/opt/appdata/data",
  timezone: "UTC",
  puid: "1000",
  pgid: "1000",
  umask: "022",
  restartPolicy: "unless-stopped",
  networkMode: "bridge",
  useTraefik: false,
  containerNamePrefix: "docker_",
}

interface DockerToolsClientProps {
  dockerTools: DockerTool[]
}

export default function DockerToolsClient({
  dockerTools,
}: DockerToolsClientProps) {
  const {
    value: selectedTools,
    setValue: setSelectedTools,
    removeValue: clearSelectedTools,
  } = useLocalStorage<string[]>("dockerComposeSelectedTools", [])

  const {
    value: settings,
    setValue: setSettings,
    removeValue: clearSettings,
  } = useLocalStorage<DockerSettings>("dockerComposeSettings", defaultSettings)

  const form = useForm({
    defaultValues: {
      selectedTools: [] as string[],
      settings: settings,
    },
    onSubmit: async ({ value }) => {
      console.log("Form submitted:", value)
    },
  })

  const toggleToolSelection = (toolId: string) => {
    const tool = dockerTools.find((t) => t.id === toolId)

    if (tool?.isUnsupported) {
      return
    }

    posthog.capture("tool_selected", { tool_id: toolId })
    setSelectedTools((prev) =>
      prev.includes(toolId)
        ? prev.filter((id) => id !== toolId)
        : [...prev, toolId],
    )
  }

  const handleReset = () => {
    clearSelectedTools()
    clearSettings()
  }

  return (
    <>
      <div className="[animation-delay:300ms] motion-safe:animate-slide-down">
        <SettingsPanel settings={settings} onSettingsChange={setSettings} />
      </div>

      <FloatingBar
        selectedCount={selectedTools.length}
        selectedTools={selectedTools.map(
          (id) => dockerTools.find((tool) => tool.id === id)?.name || "",
        )}
        selectedToolIds={selectedTools}
        settings={settings}
        onReset={handleReset}
        onToggleToolSelection={toggleToolSelection}
      />

      <ToolGrid
        tools={dockerTools}
        selectedTools={selectedTools}
        onToggleSelection={toggleToolSelection}
      />
    </>
  )
}
