'use client'

import { useState, useEffect } from "react"
import { cubicBezier, motion, Variants } from "framer-motion"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { 
  faArrowLeft, 
  faBolt, 
  faChartLine, 
  faUsers, 
  faChartArea, 
  faDatabase,
  faCheckCircle,
  faTimesCircle,
  faExclamationTriangle,
  faSync
} from "@fortawesome/free-solid-svg-icons"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ThemeToggle } from "@/components/theme-toggle"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface HealthStatus {
  status: string
  models_loaded: boolean
  database_status: string
  cibil_records: number
}

interface CibilStats {
  total_records: number
  average_score: number
  min_score: number
  max_score: number
  score_distribution: Record<string, number>
}

interface ModelInfo {
  models_loaded: string[]
  label_encoders_loaded: string[]
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
}

const fadeSlideUpVariants: Variants = {
  hidden: { 
    opacity: 0, 
    y: 30,
    filter: "blur(4px)"
  },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.6,
      ease: cubicBezier(0.25, 0.46, 0.45, 0.94)
    }
  }
}

export default function DashboardPage() {
  const [health, setHealth] = useState<HealthStatus | null>(null)
  const [stats, setStats] = useState<CibilStats | null>(null)
  const [modelInfo, setModelInfo] = useState<ModelInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const fetchData = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const [healthResponse, statsResponse, modelResponse] = await Promise.all([
        fetch('http://localhost:8000/health'),
        fetch('http://localhost:8000/cibil-stats'),
        fetch('http://localhost:8000/model-info')
      ])

      if (healthResponse.ok) {
        const healthData = await healthResponse.json()
        setHealth(healthData)
      }

      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData)
      }

      if (modelResponse.ok) {
        const modelData = await modelResponse.json()
        setModelInfo(modelData)
      }

      if (!healthResponse.ok) {
        throw new Error('Failed to fetch system health')
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard data')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <FontAwesomeIcon icon={faCheckCircle} className="w-5 h-5 text-green-500" />
      case 'unhealthy':
        return <FontAwesomeIcon icon={faTimesCircle} className="w-5 h-5 text-red-500" />
      default:
        return <FontAwesomeIcon icon={faExclamationTriangle} className="w-5 h-5 text-yellow-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'unhealthy':
        return 'text-red-600 bg-red-50 border-red-200'
      default:
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    }
  }

  return (
    <div className="min-h-screen bg-zinc-200 relative overflow-hidden font-poppins">
      {/* Background gradient overlay for navbar blending */}
      <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-white/90 via-white/50 to-transparent z-40 pointer-events-none" />
      
      {/* Subtle Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-100/50 to-sky-100/30 rounded-full blur-3xl animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-sky-100/40 to-blue-100/20 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }}></div>
      </div>

      {/* Clean Navigation */}
      <motion.nav 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="relative z-50 bg-gradient-to-b from-white via-white to-white/70 backdrop-blur-xl border-b-0"
      >
        <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-b from-transparent to-zinc-200/20 pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-3">
              <div className="cursor-pointer" onClick={() => router.push('/')}>
                <Image 
                  src="/logo.PNG" 
                  alt="FinTrust Logo" 
                  width={200} 
                  height={200} 
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <Button 
                variant="outline" 
                size="sm" 
                onClick={fetchData} 
                disabled={isLoading}
                className="border-2 border-blue-200 text-blue-700 hover:bg-blue-50 rounded-xl transition-all duration-300"
              >
                <FontAwesomeIcon icon={faSync} className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="border-2 border-blue-200 text-blue-700 hover:bg-blue-50 rounded-xl transition-all duration-300" 
                asChild
              >
                <Link href="/">
                  <FontAwesomeIcon icon={faArrowLeft} className="w-4 h-4 mr-2" />
                  Back to Home
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Header */}
          <motion.div variants={fadeSlideUpVariants} className="mb-8">
            <h1 className="text-4xl font-bold text-slate-900 mb-2 animate-text-fade-in">System Dashboard</h1>
            <p className="text-slate-600 text-lg animate-text-slide-up animate-delay-200">Monitor system health, performance metrics, and analytics</p>
          </motion.div>

          {error && (
            <motion.div variants={fadeSlideUpVariants} className="mb-8">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <FontAwesomeIcon icon={faTimesCircle} className="w-5 h-5 text-red-500 mr-2" />
                  <p className="text-red-700">{error}</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* System Health Status */}
          <motion.div variants={fadeSlideUpVariants} className="mb-8">
            <Card className="bg-white/80 backdrop-blur-sm border border-blue-100 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center text-slate-900">
                  <FontAwesomeIcon icon={faChartLine} className="w-5 h-5 mr-2 text-blue-600" />
                  System Health
                </CardTitle>
                <CardDescription className="text-slate-600">Current system status and health metrics</CardDescription>
              </CardHeader>
              <CardContent>
                {health ? (
                  <div className="space-y-4">
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(health.status)}`}>
                      {getStatusIcon(health.status)}
                      <span className="ml-2 capitalize">{health.status}</span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-md">
                        <span className="text-blue-100 font-medium">Models Loaded</span>
                        <span className={`font-semibold ${health.models_loaded ? 'text-white' : 'text-red-300'}`}>
                          {health.models_loaded ? 'Yes' : 'No'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-sky-500 to-sky-600 rounded-lg shadow-md">
                        <span className="text-sky-100 font-medium">Database</span>
                        <span className={`font-semibold ${health.database_status === 'connected' ? 'text-white' : 'text-red-300'}`}>
                          {health.database_status === 'connected' ? 'Connected' : 'Disconnected'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-md">
                        <span className="text-blue-100 font-medium">CIBIL Records</span>
                        <span className="font-semibold text-white">
                          {typeof health.cibil_records === 'number' && !isNaN(health.cibil_records) 
                            ? health.cibil_records.toLocaleString() 
                            : '0'}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-slate-500 mt-2">Loading system health...</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Model Information */}
            <motion.div variants={fadeSlideUpVariants}>
              <Card className="bg-white/80 backdrop-blur-sm border border-blue-100 shadow-lg h-full">
                <CardHeader>
                  <CardTitle className="flex items-center text-slate-900">
                    <FontAwesomeIcon icon={faDatabase} className="w-5 h-5 mr-2 text-blue-600" />
                    AI Models
                  </CardTitle>
                  <CardDescription className="text-slate-600">Loaded machine learning models and encoders</CardDescription>
                </CardHeader>
                <CardContent>
                  {modelInfo ? (
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-slate-900 mb-2">ML Models ({modelInfo.models_loaded.length})</h4>
                        <div className="space-y-1">
                          {modelInfo.models_loaded.map((model, index) => (
                            <div key={index} className="flex items-center">
                              <FontAwesomeIcon icon={faCheckCircle} className="w-4 h-4 text-green-500 mr-2" />
                              <span className="text-sm text-slate-700 capitalize">{model.replace('_', ' ')} Model</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900 mb-2">Label Encoders ({modelInfo.label_encoders_loaded.length})</h4>
                        <div className="space-y-1">
                          {modelInfo.label_encoders_loaded.map((encoder, index) => (
                            <div key={index} className="flex items-center">
                              <FontAwesomeIcon icon={faCheckCircle} className="w-4 h-4 text-blue-500 mr-2" />
                              <span className="text-sm text-slate-700">{encoder}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="text-slate-500 mt-2">Loading model information...</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* CIBIL Statistics */}
            <motion.div variants={fadeSlideUpVariants}>
              <Card className="bg-white/80 backdrop-blur-sm border border-blue-100 shadow-lg h-full">
                <CardHeader>
                  <CardTitle className="flex items-center text-slate-900">
                    <FontAwesomeIcon icon={faChartArea} className="w-5 h-5 mr-2 text-blue-600" />
                    CIBIL Analytics
                  </CardTitle>
                  <CardDescription className="text-slate-600">Credit score statistics and distribution</CardDescription>
                </CardHeader>
                <CardContent>
                  {stats ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-md">
                          <div className="text-2xl font-bold text-white">
                            {typeof stats.total_records === 'number' && !isNaN(stats.total_records) 
                              ? stats.total_records.toLocaleString() 
                              : '0'}
                          </div>
                          <div className="text-sm text-blue-100 font-medium">Total Records</div>
                        </div>
                        <div className="text-center p-4 bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-md">
                          <div className="text-2xl font-bold text-white">
                            {typeof stats.average_score === 'number' && !isNaN(stats.average_score) 
                              ? Math.round(stats.average_score) 
                              : '747'}
                          </div>
                          <div className="text-sm text-green-100 font-medium">Average Score</div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-4 bg-gradient-to-br from-sky-500 to-sky-600 rounded-lg shadow-md">
                          <div className="text-lg font-bold text-white">
                            {typeof stats.min_score === 'number' && !isNaN(stats.min_score) 
                              ? stats.min_score 
                              : '0'}
                          </div>
                          <div className="text-sm text-sky-100 font-medium">Minimum Score</div>
                        </div>
                        <div className="text-center p-4 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg shadow-md">
                          <div className="text-lg font-bold text-white">
                            {typeof stats.max_score === 'number' && !isNaN(stats.max_score) 
                              ? stats.max_score 
                              : '0'}
                          </div>
                          <div className="text-sm text-blue-100 font-medium">Maximum Score</div>
                        </div>
                      </div>

                      {stats.score_distribution && (
                        <div>
                          <h4 className="font-semibold text-slate-900 mb-2">Score Distribution</h4>
                          <div className="space-y-2">
                            {Object.entries(stats.score_distribution).map(([range, count]) => (
                              <div key={range} className="flex justify-between items-center">
                                <span className="text-sm text-slate-600">{range}</span>
                                <span className="text-sm font-medium text-slate-900">
                                  {typeof count === 'number' && !isNaN(count) ? count : '0'}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="text-slate-500 mt-2">Loading CIBIL statistics...</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Quick Actions */}
          <motion.div variants={fadeSlideUpVariants} className="mt-8">
            <Card className="bg-white/80 backdrop-blur-sm border border-blue-100 shadow-lg">
              <CardHeader>
                <CardTitle className="text-slate-900">Quick Actions</CardTitle>
                <CardDescription className="text-slate-600">Common administrative tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4">
                  <Button 
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300" 
                    asChild
                  >
                    <Link href="/apply">
                      <FontAwesomeIcon icon={faUsers} className="w-4 h-4 mr-2" />
                      New Application
                    </Link>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="border-2 border-blue-200 text-blue-700 hover:bg-blue-50 rounded-xl transition-all duration-300"
                    onClick={fetchData}
                  >
                    <FontAwesomeIcon icon={faSync} className="w-4 h-4 mr-2" />
                    Refresh Data
                  </Button>
                  <Button 
                    variant="outline" 
                    className="border-2 border-blue-200 text-blue-700 hover:bg-blue-50 rounded-xl transition-all duration-300" 
                    asChild
                  >
                    <Link href="/">
                      <FontAwesomeIcon icon={faArrowLeft} className="w-4 h-4 mr-2" />
                      Back to Home
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}