import Link from "next/link"
import { 
  FileText, 
  BookOpen, 
  Github, 
  BarChart3,
  TrendingUp,
  Lightbulb,
  Clock
} from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-green-600/10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              BW-SMART Energy Dashboard
            </h1>
            <p className="text-xl sm:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Analysiere Schweizer Strompreise und optimiere deine Energiekosten mit fortschrittlichen LED-Effizienzberechnungen
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                href="/tool/price-analysis"
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                <BarChart3 className="mr-2 h-5 w-5" />
                Dashboard starten
              </Link>
              <Link
                href="/dokumentation/disposition"
                className="inline-flex items-center px-6 py-3 bg-gray-200 text-gray-900 font-medium rounded-lg hover:bg-gray-300 transition-colors"
              >
                <FileText className="mr-2 h-5 w-5" />
                Dokumentation
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Unsere Analysetools
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FeatureCard
            icon={<BarChart3 className="h-8 w-8" />}
            title="Strompreis-Analyse"
            description="Vergleiche aktuelle Strompreise nach Kantonen und Kategorien"
            href="/tool/price-analysis"
          />
          <FeatureCard
            icon={<Clock className="h-8 w-8" />}
            title="Historie-Rechner"
            description="Berechne Stromkosten basierend auf historischen Daten"
            href="/tool/historical-calculator"
          />
          <FeatureCard
            icon={<TrendingUp className="h-8 w-8" />}
            title="Prognose-Rechner"
            description="Erstelle Preisprognosen für die kommenden Jahre"
            href="/tool/prediction-calculator"
          />
          <FeatureCard
            icon={<BarChart3 className="h-8 w-8" />}
            title="Szenario-Vergleich"
            description="Vergleiche verschiedene Preisszenarien nach Kantonen"
            href="/tool/canton-comparison"
          />
          <FeatureCard
            icon={<Lightbulb className="h-8 w-8" />}
            title="LED-Übersicht"
            description="Übersicht über LED-Röhren und deren Effizienz"
            href="/tool/lifetime-calculator"
          />
        </div>
      </div>

      {/* Documentation Section */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Projektdokumentation
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <DocumentCard
              icon={<FileText className="h-10 w-10" />}
              title="Disposition"
              description="Projektplanung und Zielsetzung der BW-SMART Energy Analyse"
              href="/dokumentation/disposition"
            />
            <DocumentCard
              icon={<BookOpen className="h-10 w-10" />}
              title="Wissenschaftliche Arbeit"
              description="Detaillierte Ausarbeitung und technische Dokumentation"
              href="/dokumentation/arbeit"
            />
            <DocumentCard
              icon={<Github className="h-10 w-10" />}
              title="GitHub Repository"
              description="Quellcode und Entwicklungsdokumentation"
              href="https://github.com/sinrath/BW-SMART-GROUP2"
              external
            />
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">26</div>
              <div className="text-gray-400">Kantone analysiert</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">13</div>
              <div className="text-gray-400">Jahre historische Daten</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">3</div>
              <div className="text-gray-400">Prognoseszenarien</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function FeatureCard({ icon, title, description, href }: {
  icon: React.ReactNode
  title: string
  description: string
  href: string
}) {
  return (
    <Link
      href={href}
      className="block p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="text-blue-600 mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </Link>
  )
}

function DocumentCard({ icon, title, description, href, external }: {
  icon: React.ReactNode
  title: string
  description: string
  href: string
  external?: boolean
}) {
  const CardContent = (
    <>
      <div className="text-blue-600 mb-4 flex justify-center">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-4">{description}</p>
      <span className="text-blue-600 font-medium">
        {external ? "Repository öffnen →" : "Mehr erfahren →"}
      </span>
    </>
  )

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="block p-6 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-center"
      >
        {CardContent}
      </a>
    )
  }

  return (
    <Link
      href={href}
      className="block p-6 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-center"
    >
      {CardContent}
    </Link>
  )
}