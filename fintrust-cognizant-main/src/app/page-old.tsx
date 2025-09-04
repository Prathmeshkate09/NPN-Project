'use client'

import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion"
import { useState, useEffect } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faArrowRight, faBolt, faShield, faChartLine, faUsers, faCreditCard, faRocket, faStar } from "@fortawesome/free-solid-svg-icons"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ThemeToggle } from "@/components/theme-toggle"
import Link from "next/link"

// Advanced animation variants inspired by Current.com
const heroVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 1.2,
      ease: [0.25, 0.46, 0.45, 0.94],
      staggerChildren: 0.15,
      delayChildren: 0.3
    }
  }
}

const floatingVariants = {
  hidden: { opacity: 0, scale: 0.8, y: 60 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
}

const cardHoverVariants = {
  rest: { 
    scale: 1, 
    y: 0,
    transition: { duration: 0.3, ease: "easeOut" }
  },
  hover: { 
    scale: 1.05, 
    y: -10,
    transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }
  }
}

const sparkleVariants = {
  hidden: { opacity: 0, scale: 0 },
  visible: {
    opacity: [0, 1, 0],
    scale: [0, 1, 0],
    transition: {
      duration: 2,
      repeat: Infinity,
      repeatDelay: Math.random() * 3
    }
  }
}

const slideUpVariants = {
  hidden: { opacity: 0, y: 100 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
}

const features = [
  {
    icon: faBolt,
    title: "Lightning Fast",
    description: "Get approved in under 60 seconds with our AI engine",
    color: "from-yellow-400 to-orange-500"
  },
  {
    icon: faShield,
    title: "Bank-Level Security",
    description: "256-bit encryption with zero data storage policy",
    color: "from-green-400 to-emerald-500"
  },
  {
    icon: faCreditCard,
    title: "Smart Rates",
    description: "Personalized rates up to 40% lower than traditional lenders",
    color: "from-blue-400 to-cyan-500"
  },
  {
    icon: faRocket,
    title: "Instant Funding",
    description: "Money in your account within 24 hours guaranteed",
    color: "from-purple-400 to-pink-500"
  }
]

const testimonials = [
  { text: "Got my loan approved in 30 seconds!", author: "Sarah K.", role: "Small Business Owner" },
  { text: "The best rates I've ever seen for personal loans", author: "Mike T.", role: "Entrepreneur" },
  { text: "Finally, a lender that actually understands me", author: "Jessica R.", role: "Freelancer" }
]

export default function Home() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0)
  const { scrollYProgress } = useScroll()
  const y = useTransform(scrollYProgress, [0, 1], [0, -50])
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-blue-950 dark:to-indigo-950 relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <motion.div 
        className="absolute inset-0 overflow-hidden"
        style={{ y, opacity }}
      >
        <motion.div 
          className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-purple-500/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div 
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-cyan-400/20 to-blue-500/20 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        
        {/* Floating Sparkles */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-blue-400 rounded-full"
            style={{
              left: `${20 + (i * 10)}%`,
              top: `${30 + (i * 5)}%`,
            }}
            variants={sparkleVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: i * 0.3 }}
          />
        ))}
      </motion.div>

      {/* Modern Navigation */}
      <motion.nav 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="relative z-50 backdrop-blur-xl bg-white/10 dark:bg-black/10 border-b border-white/20 dark:border-white/10"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <motion.div 
              className="flex items-center space-x-3"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 via-purple-600 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
                <FontAwesomeIcon icon={faBolt} className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                FinTrust
              </span>
            </motion.div>
            
            <div className="hidden md:flex items-center space-x-8">
              {["Home", "Apply", "Dashboard"].map((item, index) => (
                <motion.div
                  key={item}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                >
                  <Link 
                    href={item === "Home" ? "/" : `/${item.toLowerCase()}`}
                    className="relative text-slate-700 dark:text-slate-300 font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300 group"
                  >
                    {item}
                    <motion.div
                      className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 group-hover:w-full transition-all duration-300"
                    />
                  </Link>
                </motion.div>
              ))}
            </div>
            
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button variant="banking" size="sm" className="px-6 py-3 font-semibold" asChild>
                  <Link href="/apply">
                    Get Started
                    <motion.div
                      className="ml-2 inline-block"
                      whileHover={{ x: 3 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    >
                      <FontAwesomeIcon icon={faArrowRight} className="w-4 h-4" />
                    </motion.div>
                  </Link>
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <motion.section 
        variants={heroVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20"
      >
        <div className="text-center">
          <motion.div variants={floatingVariants} className="mb-8">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100/50 dark:bg-blue-900/30 border border-blue-200/50 dark:border-blue-400/30 text-blue-700 dark:text-blue-300 text-sm font-medium mb-6">
              <FontAwesomeIcon icon={faBolt} className="w-4 h-4 mr-2" />
              AI-Powered Loan Intelligence
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-zinc-900 dark:text-zinc-100 mb-6">
              Smart Lending
              <br />
              Made Simple
            </h1>
            <p className="text-xl text-zinc-600 dark:text-zinc-300 max-w-3xl mx-auto mb-8">
              Experience the future of banking with our AI-driven loan recommendation system. 
              Get instant eligibility assessments and personalized financial solutions.
            </p>
          </motion.div>

          <motion.div variants={floatingVariants} className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Button variant="banking" size="lg" asChild>
              <Link href="/apply">
                Apply for Loan
                <FontAwesomeIcon icon={faArrowRight} className="w-5 h-5 ml-2" />
              </Link>
            </Button>
            <Button variant="glass" size="lg" asChild>
              <Link href="/dashboard">
                View Dashboard
              </Link>
            </Button>
          </motion.div>
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.section 
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20"
      >
        <motion.div variants={floatingVariants} className="text-center mb-16">
          <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">
            Why Choose FinTrust?
          </h2>
          <p className="text-lg text-zinc-600 dark:text-zinc-300 max-w-2xl mx-auto">
            Our advanced AI technology provides unparalleled accuracy and speed in loan processing
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div key={index} variants={floatingVariants}>
              <Card className="glass border-white/20 hover:border-blue-200/50 transition-all duration-300 glow-hover h-full">
                <CardHeader className="text-center pb-4">
                  <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                    <FontAwesomeIcon icon={feature.icon} className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-lg text-zinc-800 dark:text-zinc-100">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-center pt-0">
                  <CardDescription className="text-zinc-600 dark:text-zinc-300">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section 
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-20"
      >
        <motion.div variants={floatingVariants}>
          <Card className="glass border-white/20 glow">
            <CardContent className="p-12 text-center">
              <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">
                Ready to Get Started?
              </h3>
              <p className="text-lg text-zinc-600 dark:text-zinc-300 mb-8 max-w-2xl mx-auto">
                Join thousands of satisfied customers who have secured their loans through our intelligent platform
              </p>
              <Button variant="banking" size="lg" asChild>
                <Link href="/apply">
                  Start Your Application
                  <FontAwesomeIcon icon={faArrowRight} className="w-5 h-5 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </motion.section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/20 glass">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2">
              <div className="w-6 h-6 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center">
                <FontAwesomeIcon icon={faBolt} className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold text-zinc-800 dark:text-zinc-100">FinTrust</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
