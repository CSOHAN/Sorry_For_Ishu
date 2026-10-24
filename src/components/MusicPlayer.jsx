"use client"

import { useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { Volume2, VolumeX } from "lucide-react"

export default function MusicPlayer({ musicPlaying, setMusicPlaying }) {
  const audioRef = useRef(null)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    audio.volume = 0.7

    if (!musicPlaying) {
      audio.pause()
      return
    }

    const play = () => {
      audio.play().catch(console.error)
    }

    if (audio.readyState >= 2) {
      play()
      return
    }

    audio.addEventListener("canplay", play, { once: true })
    audio.load()
    return () => audio.removeEventListener("canplay", play)
  }, [musicPlaying])

  const toggleMusic = () => {
    setMusicPlaying(!musicPlaying)
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="fixed top-4 right-4 z-50"
    >
      <motion.button
        onClick={toggleMusic}
        className="bg-pink-500/20 backdrop-blur-sm border border-pink-300/30 rounded-full p-3 text-pink-200 hover:bg-pink-500/30 transition-all duration-300"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        {musicPlaying ? <Volume2 size={20} /> : <VolumeX size={20} />}
      </motion.button>

      <audio
        ref={audioRef}
        loop
        preload="auto"
        src="/audio/gehra_hua_lyrics_english_translation_dhurandhar_arijit_singh_s.mp3"
      />
    </motion.div>
  )
}
