'use client'

import { useState } from "react"
import { motion } from "framer-motion"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faArrowLeft, faUser, faDollarSign, faFileText, faBolt, faSpinner } from "@fortawesome/free-solid-svg-icons"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ThemeToggle } from "@/components/theme-toggle"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Variants } from "framer-motion"

interface LoanFormData {
  age: string
  gender: string
  marital_status: string
  education: string
  employment: string
  experience: string
  salary: string
  cibil_id: string
}

interface LoanResponse {
  eligibility_status: string
  recommended_product_type: string
  optimal_loan_amount: number
  tenure_months: number
  interest_rate: number
  eligibility_probability: number
  monthly_emi: number
  recommendations: string[]
}

// Define the animation variants with proper types
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.3
    }
  }
};

const fadeSlideUpVariants: Variants = {
  hidden: { 
    opacity: 0, 
    y: 20 
  },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
};

const steps = [
  { id: 1, title: "Personal Info", icon: faUser },
  { id: 2, title: "Financial Details", icon: faDollarSign },
  { id: 3, title: "Verification", icon: faFileText }
]

export default function ApplyPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<LoanResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showContactModal, setShowContactModal] = useState(false)
  const router = useRouter();
  const [formData, setFormData] = useState<LoanFormData>({
    age: '',
    gender: '',
    marital_status: '',
    education: '',
    employment: '',
    experience: '',
    salary: '',
    cibil_id: ''
  })

  const handleInputChange = (field: keyof LoanFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch('http://localhost:8000/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          age: parseInt(formData.age),
          gender: formData.gender,
          marital_status: formData.marital_status,
          property_type: "Owned",
          education: formData.education,
          employment: formData.employment,
          experience: parseInt(formData.experience),
          salary: parseFloat(formData.salary),
          cibil_id: formData.cibil_id
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to process loan application')
      }

      const data: LoanResponse = await response.json()
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const validateCurrentStep = () => {
    if (currentStep === 1) {
      return formData.age && formData.gender && formData.marital_status && formData.education
    }
    if (currentStep === 2) {
      return formData.employment && formData.experience && formData.salary && formData.cibil_id
    }
    return true
  }

  const nextStep = () => {
    if (!validateCurrentStep()) {
      setError('Please fill in all required fields')
      return
    }
    
    setError(null)
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
    } else {
      handleSubmit()
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  if (result) {
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
        </motion.nav>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <Card className="bg-white/80 backdrop-blur-sm border border-blue-100 shadow-lg">
              <CardHeader className="text-center pb-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-md">
                  <FontAwesomeIcon icon={faBolt} className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-3xl font-bold text-slate-900">
                  {result.eligibility_status === 'Eligible' ? 'Congratulations!' : 'Application Review'}
                </CardTitle>
                <CardDescription className="text-lg text-slate-600">
                  {result.eligibility_status === 'Eligible' 
                    ? 'Your loan application has been approved' 
                    : 'Your application needs additional review'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-md">
                    <Label className="text-blue-100 text-sm">Eligibility Status</Label>
                    <div className={`font-semibold text-lg ${result.eligibility_status === 'Eligible' ? 'text-white' : 'text-yellow-200'}`}>
                      {result.eligibility_status}
                    </div>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-sky-500 to-sky-600 rounded-lg shadow-md">
                    <Label className="text-sky-100 text-sm">Probability Score</Label>
                    <div className="font-semibold text-lg text-white">
                      {result.eligibility_probability}%
                    </div>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg shadow-md">
                    <Label className="text-blue-100 text-sm">Recommended Product</Label>
                    <div className="font-semibold text-lg text-white">
                      {result.recommended_product_type}
                    </div>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-blue-400 to-blue-500 rounded-lg shadow-md">
                    <Label className="text-blue-100 text-sm">Loan Amount</Label>
                    <div className="font-semibold text-lg text-white">
                      ₹{result.optimal_loan_amount.toLocaleString()}
                    </div>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-sky-600 to-sky-700 rounded-lg shadow-md">
                    <Label className="text-sky-100 text-sm">Tenure</Label>
                    <div className="font-semibold text-lg text-white">
                      {result.tenure_months} months
                    </div>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-blue-700 to-blue-800 rounded-lg shadow-md">
                    <Label className="text-blue-100 text-sm">Interest Rate</Label>
                    <div className="font-semibold text-lg text-white">
                      {result.interest_rate}% per annum
                    </div>
                  </div>
                  <div className="p-6 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg shadow-md md:col-span-2">
                    <Label className="text-blue-100 text-sm">Monthly EMI</Label>
                    <div className="font-bold text-3xl text-white">
                      ₹{result.monthly_emi.toLocaleString()}
                    </div>
                  </div>
                </div>

                {result.recommendations.length > 0 && (
                  <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-md">
                    <Label className="text-blue-100 text-sm font-semibold mb-3 block">Recommendations</Label>
                    <ul className="space-y-2">
                      {result.recommendations.map((rec, index) => (
                        <li key={index} className="text-white flex items-start">
                          <span className="w-2 h-2 bg-white rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-4 pt-6">
                  {result.eligibility_status === 'Eligible' && (
                    <Button 
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                      onClick={() => setShowContactModal(true)}
                    >
                      Proceed with Application
                    </Button>
                  )}
                  <Button 
                    variant="outline" 
                    className="border-2 border-blue-200 text-blue-700 hover:bg-blue-50 rounded-xl transition-all duration-300"
                    onClick={() => setResult(null)}
                  >
                    Apply Again
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Contact Modal */}
        {showContactModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="bg-white backdrop-blur-sm border  border-blue-100 rounded-2xl p-8 max-w-md w-full shadow-2xl"
            >
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="cursor-pointer" onClick={() => router.push('/')}>
                    <Image 
                      src="/logo.PNG" 
                      alt="FinTrust Logo" 
                      width={100} 
                      height={100} 
                    />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">Congratulations!</h3>
                <p className="text-slate-600 mb-6 leading-relaxed">
                  You are eligible for the loan. To proceed with your application, please contact our loan officers at the email below.
                </p>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <p className="text-blue-800 font-medium mb-2">For immediate assistance:</p>
                  <a 
                    href="mailto:service@fintrust.com" 
                    className="text-blue-600 font-semibold hover:text-blue-700 transition-colors duration-200"
                  >
                    service@fintrust.com
                  </a>
                </div>

                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    className="flex-1 border-2 border-blue-200 text-blue-700 hover:bg-blue-50 rounded-xl transition-all duration-300"
                    onClick={() => setShowContactModal(false)}
                  >
                    Close
                  </Button>
                  <Button 
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                    onClick={() => window.open('mailto:service@fintrust.com')}
                  >
                    Contact Now
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    )
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
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Progress Steps */}
          <motion.div variants={fadeSlideUpVariants} className="mb-8">
            <div className="flex items-center justify-center space-x-8">
              {steps.map((step) => (
                <div key={step.id} className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md ${
                    currentStep >= step.id 
                      ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white' 
                      : 'bg-white text-slate-400 border-2 border-slate-200'
                  }`}>
                    <FontAwesomeIcon icon={step.icon} className="w-5 h-5" />
                  </div>
                  <div className="ml-2 hidden sm:block">
                    <div className={`text-sm font-medium ${
                      currentStep >= step.id ? 'text-blue-600' : 'text-slate-500'
                    }`}>
                      {step.title}
                    </div>
                  </div>
                  {step.id < 3 && (
                    <div className={`w-16 h-0.5 mx-4 ${
                      currentStep > step.id ? 'bg-blue-500' : 'bg-slate-200'
                    }`}></div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Form Card */}
          <motion.div variants={fadeSlideUpVariants}>
            <Card className="bg-white/80 backdrop-blur-sm border border-blue-100 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-slate-900">
                  {currentStep === 1 && "Personal Information"}
                  {currentStep === 2 && "Financial Details"}
                  {currentStep === 3 && "Verification & Submit"}
                </CardTitle>
                <CardDescription className="text-slate-600">
                  {currentStep === 1 && "Tell us about yourself"}
                  {currentStep === 2 && "Share your financial information"}
                  {currentStep === 3 && "Review and submit your application"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-700">{error}</p>
                  </div>
                )}

                {currentStep === 1 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="age" className="text-slate-700 font-medium">Age</Label>
                      <Input
                        id="age"
                        type="number"
                        placeholder="Enter your age"
                        value={formData.age}
                        onChange={(e) => handleInputChange('age', e.target.value)}
                        className="border-blue-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-700 font-medium">Gender</Label>
                      <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                        <SelectTrigger className="border-blue-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl">
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-700 font-medium">Marital Status</Label>
                      <Select value={formData.marital_status} onValueChange={(value) => handleInputChange('marital_status', value)}>
                        <SelectTrigger className="border-blue-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl">
                          <SelectValue placeholder="Select marital status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Single">Single</SelectItem>
                          <SelectItem value="Married">Married</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label className="text-slate-700 font-medium">Education Level</Label>
                      <Select value={formData.education} onValueChange={(value) => handleInputChange('education', value)}>
                        <SelectTrigger className="border-blue-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl">
                          <SelectValue placeholder="Select education level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="High School">High School</SelectItem>
                          <SelectItem value="Diploma">Diploma</SelectItem>
                          <SelectItem value="Bachelor">Bachelor's Degree</SelectItem>
                          <SelectItem value="Master">Master's Degree</SelectItem>
                          <SelectItem value="PhD">PhD</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-slate-700 font-medium">Employment Status</Label>
                      <Select value={formData.employment} onValueChange={(value) => handleInputChange('employment', value)}>
                        <SelectTrigger className="border-blue-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl">
                          <SelectValue placeholder="Select employment status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Salaried">Salaried</SelectItem>
                          <SelectItem value="Self-Employed">Self-Employed</SelectItem>
                          <SelectItem value="Unemployed">Unemployed</SelectItem>
                          <SelectItem value="Student">Student</SelectItem>
                          <SelectItem value="Retired">Retired</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="experience" className="text-slate-700 font-medium">Work Experience (Years)</Label>
                      <Input
                        id="experience"
                        type="number"
                        placeholder="Enter years of experience"
                        value={formData.experience}
                        onChange={(e) => handleInputChange('experience', e.target.value)}
                        className="border-blue-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="salary" className="text-slate-700 font-medium">Annual Salary (₹)</Label>
                      <Input
                        id="salary"
                        type="number"
                        placeholder="Enter your annual salary"
                        value={formData.salary}
                        onChange={(e) => handleInputChange('salary', e.target.value)}
                        className="border-blue-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="cibil_id" className="text-slate-700 font-medium">CIBIL ID</Label>
                      <Input
                        id="cibil_id"
                        placeholder="Enter your CIBIL ID"
                        value={formData.cibil_id}
                        onChange={(e) => handleInputChange('cibil_id', e.target.value)}
                        className="border-blue-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl"
                      />
                    </div>
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-slate-900">Review Your Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="text-zinc-800"><span className="text-slate-600 font-medium">Age:</span> {formData.age}</div>
                      <div className="text-zinc-800"><span className="text-slate-600 font-medium">Gender:</span> {formData.gender}</div>
                      <div className="text-zinc-800"><span className="text-slate-600 font-medium">Marital Status:</span> {formData.marital_status}</div>
                      <div className="text-zinc-800"><span className="text-slate-600 font-medium">Education:</span> {formData.education}</div>
                      <div className="text-zinc-800"><span className="text-slate-600 font-medium">Employment:</span> {formData.employment}</div>
                      <div className="text-zinc-800"><span className="text-slate-600 font-medium">Experience:</span> {formData.experience} years</div>
                      <div className="text-zinc-800"><span className="text-slate-600 font-medium">Salary:</span> ₹{formData.salary}</div>
                      <div className="md:col-span-2 text-zinc-800"><span className="text-slate-600 font-medium">CIBIL ID:</span> {formData.cibil_id}</div>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-blue-700 text-sm">
                        By submitting this application, you agree to our terms and conditions and authorize us to check your credit score.
                      </p>
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between pt-6">
                  <Button 
                    variant="outline" 
                    onClick={prevStep}
                    disabled={currentStep === 1}
                    className="border-2 border-blue-200 text-blue-700 hover:bg-blue-50 rounded-xl transition-all duration-300"
                  >
                    Previous
                  </Button>
                  <Button 
                    onClick={nextStep}
                    disabled={isLoading || !validateCurrentStep()}
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    {isLoading ? (
                      <>
                        <FontAwesomeIcon icon={faSpinner} className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : currentStep === 3 ? (
                      'Submit Application'
                    ) : (
                      'Next'
                    )}
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