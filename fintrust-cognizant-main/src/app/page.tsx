'use client'

import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion"
import { useState, useEffect } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faArrowRight, faBolt, faShield, faChartLine, faUsers, faCreditCard, faRocket, faStar } from "@fortawesome/free-solid-svg-icons"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ThemeToggle } from "@/components/theme-toggle"
import Link from "next/link"
import { useRouter } from "next/navigation"

// Minimalistic animation variants with enhanced fade and slide effects
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.8,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
}

const fadeSlideUpVariants = {
  hidden: { 
    opacity: 0, 
    y: 40,
    filter: "blur(4px)"
  },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.7,
      ease: [0.25, 0.46, 0.45, 0.94] as const
    }
  }
}

const textFadeVariants = {
  hidden: { 
    opacity: 0, 
    y: 20,
    filter: "blur(2px)"
  },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94] as const
    }
  }
}

const cardHoverVariants = {
  rest: { 
    scale: 1, 
    y: 0,
    transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] as const }
  },
  hover: { 
    scale: 1.02, 
    y: -8,
    transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] as const }
  }
}

const features = [
  {
    icon: faBolt,
    title: "Lightning Fast",
    description: "Get recommended in under 60 seconds with our ML engine",
    gradient: "from-blue-500 to-blue-600"
  },
  {
    icon: faCreditCard,
    title: "Smart Rates",
    description: "Personalized rates up to 40% lower than traditional lenders",
    gradient: "from-sky-500 to-sky-600"
  },
  {
    icon: faRocket,
    title: "Strategic Plans",
    description: "Tailored repayment plans that fit your life and goals",
    gradient: "from-blue-400 to-blue-500"
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
  const y = useTransform(scrollYProgress, [0, 1], [0, -30])
  const router = useRouter();
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-zinc-200 relative overflow-hidden font-poppins">
      {/* Background gradient overlay for navbar blending */}
      <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-white/90 via-white/50 to-transparent z-40 pointer-events-none" />
      
      {/* Subtle Background Elements */}
      <motion.div 
        className="absolute inset-0 overflow-hidden"
        style={{ y }}
      >
        <motion.div 
          className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-100/50 to-sky-100/30 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-sky-100/40 to-blue-100/20 rounded-full blur-3xl"
          animate={{
            scale: [1.1, 1, 1.1],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </motion.div>

      {/* Clean Navigation */}
      <motion.nav 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="relative z-50 bg-gradient-to-b from-white via-white to-white/70 backdrop-blur-xl border-b-1 border-zinc-800/30"
      >
        {/* Gradient overlay for seamless blending */}
        <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-b from-transparent to-zinc-200/20 pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <motion.div 
              className="flex items-center space-x-3"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
                <Image 
                  src="/logo.PNG" 
                  alt="FinTrust Logo" 
                  width={200} 
                  height={200} 
                  onClick={() => router.push('/')}
                />
            </motion.div>
            
            <div className="hidden md:flex items-center space-x-8">
              {["Home", "Apply", "Dashboard"].map((item, index) => (
                <motion.div
                  key={item}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  className="animate-text-fade-in"
                  style={{ animationDelay: `${200 + index * 100}ms` }}
                >
                  <Link 
                    href={item === "Home" ? "/" : `/${item.toLowerCase()}`}
                    className="relative text-slate-700 font-medium hover:text-blue-600 transition-colors duration-300 group"
                  >
                    {item}
                    <motion.div
                      className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-500 group-hover:w-full transition-all duration-300"
                    />
                  </Link>
                </motion.div>
              ))}
            </div>
            
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button 
                  size="sm" 
                  className="px-6 py-3 font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300" 
                  asChild
                >
                  <Link href="/apply">
                    Get Started
                    <motion.div
                      className="ml-2 inline-block"
                      whileHover={{ x: 2 }}
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
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-7xl mx-auto text-center">
          {/* Hero Badge */}
          <motion.div 
            variants={fadeSlideUpVariants}
            className="mb-8"
          >
            <motion.div 
              className="inline-flex items-center px-6 py-3 rounded-full bg-blue-50 border border-blue-200 text-blue-700 font-medium shadow-sm animate-fade-in"
              whileHover={{ scale: 1.05, y: -2 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <FontAwesomeIcon icon={faBolt} className="w-5 h-5 mr-3 text-blue-500" />
              <span className="text-blue-800 font-semibold">
                ML-Powered Lending Revolution
              </span>
            </motion.div>
          </motion.div>

          {/* Main Heading */}
          <motion.div variants={fadeSlideUpVariants} className="mb-8">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold leading-tight mb-6 animate-text-fade-in">
              <span className="text-slate-900">
                Get Your
              </span>
              <br />
              <motion.span 
                className="text-blue-600 relative"
                animate={{
                  scale: [1, 1.02, 1],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                Dream Loan
              </motion.span>
            </h1>
            
            <motion.p 
              className="text-xl md:text-2xl text-slate-600 max-w-4xl mx-auto font-bold leading-relaxed animate-text-slide-up animate-delay-300"
              variants={textFadeVariants}
            >
              Instant recommendations, optimal rates for your needs.
              <br className="hidden md:block" />
              <span className="text-blue-600 font-semibold text-medium">
                No hidden fees, no waiting.
              </span>
            </motion.p>
          </motion.div>

          {/* Action Buttons */}
          <motion.div 
            variants={fadeSlideUpVariants} 
            className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-4 animate-slide-up animate-delay-500"
          >
            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button 
                size="lg" 
                className="px-8 py-4 text-lg font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300" 
                asChild
              >
                <Link href="/apply">
                  <motion.span
                    className="flex items-center"
                    whileHover={{ x: 2 }}
                  >
                    Apply in 60 Seconds
                    <motion.div
                      className="ml-3"
                      animate={{ x: [0, 3, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <FontAwesomeIcon icon={faArrowRight} className="w-5 h-5" />
                    </motion.div>
                  </motion.span>
                </Link>
              </Button>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button 
                variant="outline" 
                size="lg" 
                className="px-8 py-4 text-lg font-semibold border-2 border-blue-200 text-blue-700 hover:bg-blue-50 rounded-xl transition-all duration-300" 
                asChild
              >
                <Link href="/dashboard">
                  <FontAwesomeIcon icon={faChartLine} className="w-5 h-5 mr-3" />
                  View Dashboard
                </Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="relative z-10 py-12 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-7xl mx-auto">
          <motion.div
            variants={fadeSlideUpVariants}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6 animate-text-fade-in">
              Why Everyone Chooses
              <br />
              <span className="text-blue-600">FinTrust</span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto font-medium animate-text-slide-up animate-delay-200">
              We're not just another lender. We're your financial partner, powered by cutting-edge ML.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={cardHoverVariants}
                initial="rest"
                whileHover="hover"
                className="group animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <Card className="h-full bg-white/80 backdrop-blur-sm border border-blue-100 shadow-md hover:shadow-lg transition-all duration-300">
                  <CardHeader className="text-center pb-4">
                    <motion.div 
                      className={`w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center shadow-md`}
                      whileHover={{ 
                        rotate: [0, -5, 5, -5, 0],
                        scale: 1.1
                      }}
                      transition={{ duration: 0.5 }}
                    >
                      <FontAwesomeIcon icon={feature.icon} className="w-8 h-8 text-white" />
                    </motion.div>
                    <CardTitle className="text-xl font-bold text-slate-800 mb-3">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-center pt-0">
                    <CardDescription className="text-slate-600 text-base leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Testimonials Section */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="relative z-10 py-32 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2
            variants={fadeSlideUpVariants}
            className="text-4xl md:text-5xl font-bold text-slate-900 mb-16 animate-text-fade-in"
          >
            What Our Customers Say
          </motion.h2>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentTestimonial}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -40 }}
              transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="bg-white/80 backdrop-blur-sm border border-blue-100 rounded-3xl p-12 shadow-md"
            >
              <p className="text-2xl md:text-3xl font-medium text-slate-700 mb-8 leading-relaxed">
                "{testimonials[currentTestimonial].text}"
              </p>
              <div className="flex items-center justify-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                  <FontAwesomeIcon icon={faUsers} className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-bold text-slate-800">
                    {testimonials[currentTestimonial].author}
                  </p>
                  <p className="text-slate-600">
                    {testimonials[currentTestimonial].role}
                  </p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="flex justify-center space-x-3 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentTestimonial(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentTestimonial
                    ? 'bg-blue-500 scale-125'
                    : 'bg-slate-300 hover:bg-slate-400'
                }`}
              />
            ))}
          </div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="relative z-10 py-32 px-4 sm:px-6 lg:px-8"
      >
        <motion.div 
          variants={fadeSlideUpVariants}
          className="max-w-4xl mx-auto text-center"
        >
          <Card className="bg-white/80 backdrop-blur-sm border border-blue-100 shadow-md">
            <CardContent className="p-16">
              <h3 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 animate-text-fade-in">
                Ready to Transform Your Finances?
              </h3>
              <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed animate-text-slide-up animate-delay-200">
                Become one of the customers who will secure their financial future with FinTrust's ML-powered lending platform.
              </p>
              
              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button 
                  size="lg" 
                  className="px-12 py-6 text-xl font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300" 
                  asChild
                >
                  <Link href="/apply">
                    <motion.span
                      className="flex items-center"
                      whileHover={{ x: 2 }}
                    >
                      Start Your Application
                      <motion.div
                        className="ml-4"
                        animate={{ x: [0, 5, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <FontAwesomeIcon icon={faArrowRight} className="w-6 h-6" />
                      </motion.div>
                    </motion.span>
                  </Link>
                </Button>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-blue-100 bg-white/60 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <motion.div 
              className="flex items-center justify-center space-x-3"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <span className="text-xl font-bold text-blue-900">
                FinTrust
              </span>
            </motion.div>
          </div>
        </div>
      </footer>
    </div>
  );
}