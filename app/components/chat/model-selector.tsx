'use client'

import {
  Select,
  Group,
  Text,
  Badge
} from '@mantine/core'
import {
  IconRobot,
  IconSparkles,
  IconBolt,
  IconCpu
} from '@tabler/icons-react'
import { MODEL_CONFIGS, ModelConfig } from '@/app/config/models'

export type ModelType = string // Now we use the model IDs from config

// Map provider names to icons
const providerIcons: Record<string, React.ReactNode> = {
  'Google': <IconSparkles size={16} color="blue" />,
  'OpenAI': <IconRobot size={16} color="green" />,
  'Anthropic': <IconBolt size={16} color="orange" />,
  'Meta': <IconCpu size={16} color="violet" />
}

// Convert MODEL_CONFIGS to array for easier use
const models = Object.values(MODEL_CONFIGS)

interface ModelSelectorProps {
  selectedModel: ModelType
  onModelChange: (model: ModelType) => void
}

export function ModelSelector({ selectedModel, onModelChange }: ModelSelectorProps) {
  const selectedModelData = MODEL_CONFIGS[selectedModel] || Object.values(MODEL_CONFIGS)[0]

  const selectData = models.map(model => ({
    value: model.id,
    label: model.name,
    disabled: !model.available
  }))

  return (
    <Select
      value={selectedModel}
      onChange={(value) => value && onModelChange(value as ModelType)}
      data={selectData}
      size="sm"
      w={150}
      renderOption={({ option, checked }) => {
        const model = MODEL_CONFIGS[option.value]
        if (!model) return null

        return (
          <Group gap="sm" wrap="nowrap">
            {providerIcons[model.provider] || <IconRobot size={16} />}
            <div style={{ flex: 1 }}>
              <Group gap="xs">
                <Text size="sm" fw={500}>
                  {model.name}
                </Text>
                {!model.available && (
                  <Badge size="xs" variant="light" color="gray">
                    Soon
                  </Badge>
                )}
              </Group>
              <Text size="xs" c="dimmed">
                {model.description}
              </Text>
            </div>
          </Group>
        )
      }}
    />
  )
}