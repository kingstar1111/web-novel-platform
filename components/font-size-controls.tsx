"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Minus, Plus, RotateCcw } from "lucide-react"

export function FontSizeControls() {
  const [fontSize, setFontSize] = useState(16)

  useEffect(() => {
    // Load saved font size from localStorage
    const saved = localStorage.getItem("chapter-font-size")
    if (saved) {
      const size = Number.parseInt(saved)
      setFontSize(size)
      updateFontSize(size)
    }
  }, [])

  const updateFontSize = (size: number) => {
    const content = document.getElementById("chapter-content")
    if (content) {
      content.style.fontSize = `${size}px`
    }
    localStorage.setItem("chapter-font-size", size.toString())
  }

  const increaseFontSize = () => {
    if (fontSize < 24) {
      const newSize = fontSize + 2
      setFontSize(newSize)
      updateFontSize(newSize)
    }
  }

  const decreaseFontSize = () => {
    if (fontSize > 12) {
      const newSize = fontSize - 2
      setFontSize(newSize)
      updateFontSize(newSize)
    }
  }

  const resetFontSize = () => {
    setFontSize(16)
    updateFontSize(16)
  }

  return (
    <div className="flex items-center justify-center gap-2 mb-6 p-3 bg-muted/50 rounded-lg">
      <span className="text-sm text-muted-foreground ml-2">حجم الخط:</span>
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8 bg-transparent"
        onClick={decreaseFontSize}
        disabled={fontSize <= 12}
        aria-label="تصغير الخط"
      >
        <Minus className="h-4 w-4" />
      </Button>
      <span className="text-sm font-medium min-w-[3rem] text-center">{fontSize}px</span>
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8 bg-transparent"
        onClick={increaseFontSize}
        disabled={fontSize >= 24}
        aria-label="تكبير الخط"
      >
        <Plus className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 mr-2"
        onClick={resetFontSize}
        aria-label="إعادة تعيين حجم الخط"
      >
        <RotateCcw className="h-4 w-4" />
      </Button>
    </div>
  )
}
