'use client'

import React from 'react'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

interface PredictionData {
  [year: string]: {
    konservativ: number
    mittel: number
    optimistisch: number
  }
}

interface PredictionChartProps {
  data: PredictionData | null
  loading: boolean
}

export default function PredictionChart({ data, loading }: PredictionChartProps) {
  // Prepare data for the chart
  const prepareChartData = () => {
    if (!data) return null

    const years = Object.keys(data).sort()
    const konservativData = years.map(year => data[year].konservativ)
    const mittelData = years.map(year => data[year].mittel)
    const optimistischData = years.map(year => data[year].optimistisch)

    return {
      labels: years,
      datasets: [
        {
          label: 'Konservativ (-20%)',
          data: konservativData,
          borderColor: 'rgb(239, 68, 68)', // red-500
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          borderDash: [5, 5],
          tension: 0.1
        },
        {
          label: 'Mittlere Prognose',
          data: mittelData,
          borderColor: 'rgb(34, 197, 94)', // green-500
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          borderWidth: 3,
          tension: 0.1
        },
        {
          label: 'Optimistisch (+20%)',
          data: optimistischData,
          borderColor: 'rgb(59, 130, 246)', // blue-500
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderDash: [5, 5],
          tension: 0.1
        }
      ]
    }
  }

  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Strompreisprognose 2025-2040',
        font: {
          size: 16
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || ''
            if (label) {
              label += ': '
            }
            if (context.parsed.y !== null) {
              label += context.parsed.y.toFixed(2) + ' Rp/kWh'
            }
            return label
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: false,
        title: {
          display: true,
          text: 'Strompreis (Rp/kWh)'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Jahr'
        }
      }
    }
  }

  const chartData = prepareChartData()

  return (
    <div className="h-[400px]">
      {loading ? (
        <div className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">Lade Prognosen...</p>
        </div>
      ) : chartData ? (
        <Line data={chartData} options={chartOptions} />
      ) : (
        <div className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">Keine Daten verfügbar</p>
        </div>
      )}
    </div>
  )
}