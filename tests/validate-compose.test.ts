import { execSync } from 'node:child_process'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { DEFAULT_SETTINGS } from '../lib/constants'
import type { DockerTool } from '../lib/docker-tools'
import { tools } from '../tools'

// Test summary
const testResults = {
  success: 0,
  failed: 0,
  failedServices: [] as string[],
}

async function main() {
  try {
    console.log("Starting Docker Compose validation tests...\n")
    
    // Filter out unsupported tools
    const supportedTools = tools.filter(tool => !tool.isUnsupported)
    console.log(`Found ${supportedTools.length} supported Docker tools`)
    
    // Test 1: Test each service individually
    console.log("\n🧪 Test 1: Validating each service individually...")
    await testIndividualServices(supportedTools)
    
    // Test 2: Test all services together
    console.log("\n🧪 Test 2: Validating all services together...")
    await testAllServices(supportedTools)
    
    // Print test summary
    console.log("\n📊 Test Summary:")
    console.log(`✅ Successful tests: ${testResults.success}`)
    console.log(`❌ Failed tests: ${testResults.failed}`)
    
    if (testResults.failedServices.length > 0) {
      console.log("\n❌ Failed services:")
      testResults.failedServices.forEach(service => {
        console.log(`  - ${service}`)
      })
      return false
    }
    
    console.log("\n🎉 All tests passed!")
    return true
  } catch (error) {
    console.error("\n❌ Unexpected error:", error instanceof Error ? error.message : String(error))
    return false
  }
}

async function testIndividualServices(tools: DockerTool[]) {
  for (const tool of tools) {
    try {
      process.stdout.write(`  Testing ${tool.name}... `)
      
      // Generate compose file with just this service
      const composeContent = generateDockerComposeFile([tool])
      
      // Create a temporary docker-compose.yaml file
      const tempFilePath = path.join(process.cwd(), 'docker-compose.yaml')
      await fs.writeFile(tempFilePath, composeContent, 'utf8')
      
      // Generate .env file with default settings
      const envContent = generateEnvFile()
      const envFilePath = path.join(process.cwd(), '.env')
      await fs.writeFile(envFilePath, envContent, 'utf8')
      
      // Validate the docker-compose file
      execSync('docker compose config --quiet', { encoding: 'utf8' })
      
      // If we get here, validation passed
      console.log("✅ Passed")
      testResults.success++
    } catch (error) {
      console.log("❌ Failed")
      console.error(`    Error: ${error instanceof Error ? error.message : String(error)}`)
      testResults.failed++
      testResults.failedServices.push(tool.name)
    }
  }
}

async function testAllServices(tools: DockerTool[]) {
  try {
    // Generate docker-compose content with all services
    const composeContent = generateDockerComposeFile(tools)
    
    // Create a temporary docker-compose.yaml file
    const tempFilePath = path.join(process.cwd(), 'docker-compose.yaml')
    await fs.writeFile(tempFilePath, composeContent, 'utf8')
    console.log(`  Generated docker-compose.yaml with ${tools.length} services`)
    
    // Generate .env file with default settings
    const envContent = generateEnvFile()
    const envFilePath = path.join(process.cwd(), '.env')
    await fs.writeFile(envFilePath, envContent, 'utf8')
    console.log('  Generated .env file with default settings')
    
    // Validate the docker-compose file
    console.log("  Validating combined docker-compose.yaml file...")
    execSync('docker compose config --quiet', { encoding: 'utf8' })
    
    console.log("  ✅ Validation of all services together successful!")
    testResults.success++
    
    return true
  } catch (error) {
    console.error("  ❌ Validation of all services together failed:", error instanceof Error ? error.message : String(error))
    testResults.failed++
    return false
  }
}

function generateDockerComposeFile(selectedTools: DockerTool[]): string {
  // Create docker-compose header
  const composeHeader = `
#  ____   ____ __  __ 
# |  _ \\ / ___|  \\/  |
# | | | | |   | |\\/| |
# | |_| | |___| |  | |
# |____/ \\____|_|  |_|
#
# This compose file was generated by Docker Compose Selector: https://github.com/ajnart/docker-compose-selector 
`

  // Generate services section
  let servicesSection = `services:
`

  // Add each selected tool
  selectedTools.forEach((tool) => {
    if (!tool.composeContent) return
    // Add a blank line before each service
    servicesSection += `
`
    // Add a comment with the tool description
    servicesSection += `  # ${tool.name}: ${tool.description}
`
    // Process the compose content - properly indent everything
    let toolContent = tool.composeContent.replace(/^services:\s*/gm, "") // Remove the services: line

    // Create a more robust indentation system for nested YAML
    const lines = toolContent.split("\n")
    let currentIndentLevel = 0

    const processedLines = lines.map((line, index) => {
      // Skip empty lines
      if (line.trim() === "") return line

      const trimmedLine = line.trim()
      const isServiceLine = index === 0 || lines[index - 1].trim() === ""

      // Reset indent level for service lines
      if (isServiceLine) {
        currentIndentLevel = 0
        return `  ${trimmedLine}` // 2 spaces for service name
      }

      // Determine if this line defines a new block (ends with colon)
      const definesBlock =
        trimmedLine.endsWith(":") && !trimmedLine.includes(": ")

      // Check if previous line defined a block (which would make this line deeper)
      const prevLine = index > 0 ? lines[index - 1].trim() : ""
      const prevDefinesBlock =
        prevLine.endsWith(":") && !prevLine.includes(": ")

      // Increase indent level if previous line defined a block
      if (prevDefinesBlock) {
        currentIndentLevel++
      }
      // Detect decrease in indentation by checking original indentation
      else if (!isServiceLine && index > 0) {
        const originalIndent = line.match(/^\s*/)?.[0].length || 0
        const prevOriginalIndent =
          lines[index - 1].match(/^\s*/)?.[0].length || 0

        // If current line has less original indentation than previous line,
        // we need to decrease our indentation level
        if (originalIndent < prevOriginalIndent) {
          // Calculate how many levels to go back based on the difference
          const levels = Math.floor((prevOriginalIndent - originalIndent) / 2)
          currentIndentLevel = Math.max(0, currentIndentLevel - levels)
        }
      }

      // Calculate spaces for the current indent level (base of 2 + 2 per level)
      const spaces = 2 + currentIndentLevel * 2
      return `${" ".repeat(spaces)}${trimmedLine}`
    })

    toolContent = processedLines.join("\n")
    servicesSection += `${toolContent}\n`
  })

  return composeHeader + servicesSection
}

function generateEnvFile(): string {
  // Get default settings
  const settings = DEFAULT_SETTINGS
  
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

// Run the test
main()
  .then((success) => {
    if (success) {
      console.log("\n✨ All tests passed successfully!")
      process.exit(0)
    } else {
      console.error("\n❌ Some tests failed")
      process.exit(1)
    }
  })
  .catch((error) => {
    console.error("\n❌ An error occurred during tests:", error)
    process.exit(1)
  }) 