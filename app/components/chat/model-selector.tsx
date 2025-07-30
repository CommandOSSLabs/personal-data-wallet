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

export type ModelType = 'gemini' | 'gpt-4' | 'claude' | 'local'

interface ModelOption {
  id: ModelType
  name: string
  description: string
  icon: React.ReactNode
  available: boolean
}

const models: ModelOption[] = [
  {
    id: 'gemini',
    name: 'Gemini Pro',
    description: 'Google\'s advanced AI model',
    icon: <IconSparkles size={16} color="blue" />,
    available: true
  },
  {
    id: 'gpt-4',
    name: 'GPT-4',
    description: 'OpenAI\'s powerful language model',
    icon: <IconRobot size={16} color="green" />,
    available: false
  },
  {
    id: 'claude',
    name: 'Claude',
    description: 'Anthropic\'s helpful AI assistant',
    icon: <IconBolt size={16} color="orange" />,
    available: false
  },
  {
    id: 'local',
    name: 'Local Model',
    description: 'Run locally for privacy',
    icon: <IconCpu size={16} color="violet" />,
    available: false
  }
]

interface ModelSelectorProps {
  selectedModel: ModelType
  onModelChange: (model: ModelType) => void
}

export function ModelSelector({ selectedModel, onModelChange }: ModelSelectorProps) {
  const selectedModelData = models.find(m => m.id === selectedModel) || models[0]

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
        const model = models.find(m => m.id === option.value)
        if (!model) return null

        return (
          <Group gap="sm" wrap="nowrap">
            {model.icon}
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