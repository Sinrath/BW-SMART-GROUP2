'use client'

import React from 'react'

export default function PredictionInfoPanel() {
  return (
    <div className="mt-6 p-4 bg-muted rounded-lg">
      <h3 className="font-semibold mb-2">Über die Prognose</h3>
      <p className="text-sm text-muted-foreground">
        Die Strompreisprognose basiert auf historischen Daten von 2011 bis 2024 und verwendet verbessertes Holt-Winters Exponential Smoothing 
        mit wirtschaftlichen Beschränkungen zur Vorhersage der Preise bis 2040. Das Modell begrenzt das jährliche Wachstum auf maximal 10% 
        für realistische Prognosen. Die drei Szenarien zeigen:
      </p>
      <ul className="text-sm text-muted-foreground mt-2 space-y-1">
        <li>• <span className="font-medium">Konservativ:</span> 20% niedrigere Preise als die mittlere Prognose</li>
        <li>• <span className="font-medium">Mittel:</span> Basierend auf dem gedämpften historischen Trend</li>
        <li>• <span className="font-medium">Optimistisch:</span> 20% höhere Preise als die mittlere Prognose</li>
      </ul>
    </div>
  )
}