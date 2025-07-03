'use client'

import React from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'

interface Canton {
  value: string
  label: string
}

interface FilterPanelVorhersageProps {
  cantons: Canton[]
  selectedCanton: string
  selectedCategory: string
  onCantonChange: (canton: string) => void
  onCategoryChange: (category: string) => void
}

export default function FilterPanelVorhersage({
  cantons,
  selectedCanton,
  selectedCategory,
  onCantonChange,
  onCategoryChange
}: FilterPanelVorhersageProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <div className="space-y-2">
        <Label htmlFor="canton">Kanton</Label>
        <Select value={selectedCanton} onValueChange={onCantonChange}>
          <SelectTrigger id="canton">
            <SelectValue placeholder="Wählen Sie einen Kanton" />
          </SelectTrigger>
          <SelectContent>
            {cantons.map((canton) => (
              <SelectItem key={canton.value} value={canton.value}>
                {canton.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Kategorie</Label>
        <Select value={selectedCategory} onValueChange={onCategoryChange}>
          <SelectTrigger id="category">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="C2">C2: Kleinbetrieb (30&apos;000 kWh/Jahr)</SelectItem>
            <SelectItem value="C3">C3: Mittlerer Betrieb (150&apos;000 kWh/Jahr)</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}