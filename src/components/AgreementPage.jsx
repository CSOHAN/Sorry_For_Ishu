"use client"

import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import { Download, Send } from "lucide-react"

const PROMISES = [
  "I will not leave you.",
  "I will not uninstall the game.",
  "I will not uninstall Telegram.",
]

export default function AgreementPage() {
  const [checked, setChecked] = useState(PROMISES.map(() => false))
  const [whatsapp, setWhatsapp] = useState("")
  const [name, setName] = useState("")
  const [hasSignature, setHasSignature] = useState(false)
  const [error, setError] = useState("")
  const [status, setStatus] = useState("")
  const canvasRef = useRef(null)
  const drawing = useRef(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    setupCanvas(canvas)
  }, [])

  const point = (event) => {
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const touch = event.touches?.[0]
    const clientX = touch ? touch.clientX : event.clientX
    const clientY = touch ? touch.clientY : event.clientY
    return { x: clientX - rect.left, y: clientY - rect.top }
  }

  const startDraw = (event) => {
    event.preventDefault()
    event.currentTarget.setPointerCapture?.(event.pointerId)
    drawing.current = true
    const ctx = canvasRef.current.getContext("2d")
    const { x, y } = point(event)
    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  const moveDraw = (event) => {
    if (!drawing.current) return
    event.preventDefault()
    const ctx = canvasRef.current.getContext("2d")
    const { x, y } = point(event)
    ctx.lineTo(x, y)
    ctx.stroke()
    setHasSignature(true)
  }

  const endDraw = () => {
    drawing.current = false
  }

  const setupCanvas = (canvas) => {
    const ratio = window.devicePixelRatio || 1
    const width = canvas.offsetWidth
    const height = canvas.offsetHeight
    canvas.width = Math.floor(width * ratio)
    canvas.height = Math.floor(height * ratio)
    const ctx = canvas.getContext("2d")
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.scale(ratio, ratio)
    ctx.lineWidth = 2.2
    ctx.lineCap = "round"
    ctx.strokeStyle = "#f9a8d4"
  }

  const clearSignature = () => {
    const canvas = canvasRef.current
    setupCanvas(canvas)
    setHasSignature(false)
  }

  const allChecked = checked.every(Boolean)
  const cleanNumber = whatsapp.replace(/[^\d+]/g, "")
  const isValid = allChecked && cleanNumber.length >= 10 && name.trim().length >= 2 && hasSignature

  const agreementText = () => {
    const date = new Date().toLocaleString()
    return [
      "A Promise From My Heart",
      "",
      ...PROMISES.map((line, i) => `${checked[i] ? "☑" : "☐"} ${line}`),
      "",
      `WhatsApp: ${whatsapp.trim()}`,
      `Signed: ${name.trim()}`,
      `Date: ${date}`,
      "",
      "I promise this, and I mean it.",
    ].join("\n")
  }

  const buildImage = async () => {
    const source = canvasRef.current
    const out = document.createElement("canvas")
    out.width = 1080
    out.height = 1520
    const ctx = out.getContext("2d")

    const bg = ctx.createLinearGradient(0, 0, 1080, 1520)
    bg.addColorStop(0, "#1f1230")
    bg.addColorStop(1, "#3b1d4a")
    ctx.fillStyle = bg
    ctx.fillRect(0, 0, out.width, out.height)

    ctx.strokeStyle = "rgba(249, 168, 212, 0.45)"
    ctx.lineWidth = 8
    ctx.strokeRect(48, 48, 984, 1424)

    ctx.fillStyle = "#f9a8d4"
    ctx.font = "700 54px Kalam, cursive, sans-serif"
    ctx.textAlign = "center"
    ctx.fillText("A Promise From My Heart", 540, 160)

    ctx.fillStyle = "#fbcfe8"
    ctx.font = "400 28px Kalam, cursive, sans-serif"
    ctx.fillText("Signed with love, kept forever", 540, 210)

    ctx.textAlign = "left"
    ctx.font = "400 36px Kalam, cursive, sans-serif"
    ctx.fillStyle = "#fce7f3"
    PROMISES.forEach((line, i) => {
      const y = 340 + i * 90
      ctx.fillText(`${checked[i] ? "☑" : "☐"}  ${line}`, 120, y)
    })

    ctx.fillStyle = "#f9a8d4"
    ctx.font = "400 32px Kalam, cursive, sans-serif"
    ctx.fillText(`WhatsApp: ${whatsapp.trim()}`, 120, 680)
    ctx.fillText(`Name: ${name.trim()}`, 120, 740)
    ctx.fillText(`Date: ${new Date().toLocaleDateString()}`, 120, 800)

    ctx.fillText("Signature:", 120, 900)
    ctx.drawImage(source, 120, 930, 840, 280)

    ctx.textAlign = "center"
    ctx.fillStyle = "#fbcfe8"
    ctx.font = "400 26px Kalam, cursive, sans-serif"
    ctx.fillText("I promise this, and I mean it. 💕", 540, 1320)

    return out
  }

  const validate = () => {
    if (!allChecked) {
      setError("Please tick every promise first.")
      return false
    }
    if (cleanNumber.length < 10) {
      setError("Please enter your WhatsApp number.")
      return false
    }
    if (name.trim().length < 2) {
      setError("Please sign your name.")
      return false
    }
    if (!hasSignature) {
      setError("Please draw your signature.")
      return false
    }
    setError("")
    return true
  }

  const downloadAgreement = async () => {
    if (!validate()) return
    const canvas = await buildImage()
    const link = document.createElement("a")
    link.download = `${name.trim().replace(/\s+/g, "-").toLowerCase()}-promise.png`
    link.href = canvas.toDataURL("image/png")
    link.click()
    setStatus("Downloaded. Now send it to him 💌")
  }

  const sendAgreement = async () => {
    if (!validate()) return
    const canvas = await buildImage()
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"))
    const file = new File([blob], "promise-agreement.png", { type: "image/png" })
    const text = agreementText()

    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({
          title: "My Promise",
          text,
          files: [file],
        })
        setStatus("Sent 💕")
        return
      } catch (shareError) {
        if (shareError?.name === "AbortError") return
      }
    }

    const waUrl = `https://wa.me/?text=${encodeURIComponent(text)}`
    window.open(waUrl, "_blank", "noopener,noreferrer")
    const link = document.createElement("a")
    link.download = "promise-agreement.png"
    link.href = canvas.toDataURL("image/png")
    link.click()
    setStatus("WhatsApp opened. Attach the downloaded picture and send it.")
  }

  const togglePromise = (index) => {
    setChecked((prev) => prev.map((value, i) => (i === index ? !value : value)))
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16 text-center relative">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-lg bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-pink-300/25 rounded-3xl p-6 md:p-8 shadow-2xl"
      >
        <h2 className="text-3xl text-pink-300 mb-2">A Promise From My Heart</h2>
        <p className="text-purple-200 mb-8">Tick every line, then sign it for him.</p>

        <div className="space-y-4 text-left mb-8">
          {PROMISES.map((line, index) => (
            <label
              key={line}
              className="flex items-start gap-3 rounded-2xl border border-pink-300/20 bg-pink-500/10 px-4 py-3 text-pink-100 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={checked[index]}
                onChange={() => togglePromise(index)}
                className="mt-1 h-4 w-4 accent-pink-400"
              />
              <span className="text-lg leading-relaxed">{line}</span>
            </label>
          ))}
        </div>

        <label className="block text-left text-pink-200 mb-2">Your WhatsApp number</label>
        <input
          type="tel"
          inputMode="tel"
          placeholder="+91 98765 43210"
          value={whatsapp}
          onChange={(event) => setWhatsapp(event.target.value)}
          className="w-full mb-6 px-4 py-3 rounded-2xl bg-gray-900/70 border border-pink-300/30 text-pink-100 placeholder:text-pink-200/40 outline-none focus:border-pink-300/70"
        />

        <label className="block text-left text-pink-200 mb-2">Your name</label>
        <input
          type="text"
          placeholder="Write your name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="w-full mb-6 px-4 py-3 rounded-2xl bg-gray-900/70 border border-pink-300/30 text-pink-100 placeholder:text-pink-200/40 outline-none focus:border-pink-300/70"
        />

        <div className="flex items-center justify-between mb-2">
          <label className="text-pink-200">Sign here</label>
          <button type="button" onClick={clearSignature} className="text-sm text-pink-300/80 hover:text-pink-200">
            Clear
          </button>
        </div>
        <canvas
          ref={canvasRef}
          role="img"
          aria-label="Signature pad"
          onPointerDown={startDraw}
          onPointerMove={moveDraw}
          onPointerUp={endDraw}
          onPointerLeave={endDraw}
          className="w-full h-36 rounded-2xl bg-gray-900/80 border border-pink-300/30 touch-none mb-6"
        />

        {error && <p className="text-rose-300 mb-4">{error}</p>}
        {status && <p className="text-pink-200 mb-4">{status}</p>}

        <div className="flex flex-col sm:flex-row gap-3">
          <motion.button
            type="button"
            onClick={downloadAgreement}
            disabled={!isValid}
            className="flex-1 px-6 py-3 rounded-full bg-pink-500/25 border border-pink-300/40 text-pink-100 flex items-center justify-center gap-2 disabled:opacity-40"
            whileHover={{ scale: isValid ? 1.02 : 1 }}
            whileTap={{ scale: isValid ? 0.98 : 1 }}
          >
            <Download size={18} />
            Download
          </motion.button>
          <motion.button
            type="button"
            onClick={sendAgreement}
            disabled={!isValid}
            className="flex-1 px-6 py-3 rounded-full bg-gradient-to-r from-pink-500/40 to-purple-500/40 border border-pink-300/40 text-pink-50 flex items-center justify-center gap-2 disabled:opacity-40"
            whileHover={{ scale: isValid ? 1.02 : 1 }}
            whileTap={{ scale: isValid ? 0.98 : 1 }}
          >
            <Send size={18} />
            Send to him
          </motion.button>
        </div>
      </motion.div>
    </div>
  )
}
