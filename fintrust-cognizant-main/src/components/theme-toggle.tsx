'use client'

import * as React from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faSun, faMoon } from "@fortawesome/free-solid-svg-icons"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button variant="glass" size="sm" className="w-9 h-9 p-0">
        <div className="h-4 w-4" />
      </Button>
    )
  }

  const toggleTheme = () => {
    if (resolvedTheme === "dark") {
      setTheme("light")
    } else {
      setTheme("dark")
    }
  }

  return (
    <Button
      variant="glass"
      size="sm"
      onClick={toggleTheme}
      className="w-9 h-9 p-0"
      title={`Switch to ${resolvedTheme === "dark" ? "light" : "dark"} theme`}
    >
      <FontAwesomeIcon 
        icon={faSun} 
        className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" 
      />
      <FontAwesomeIcon 
        icon={faMoon} 
        className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" 
      />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}