'use client'

import { useEffect, useState } from 'react'

export default function Timer({ totalTime }: { totalTime: number }) {
  const [timeRemaining, setTimeRemaining] = useState(totalTime * 60)

  useEffect(() => {
    if (timeRemaining <= 0) return
    const timer = setInterval(() => {
      setTimeRemaining(prev => prev - 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [timeRemaining])

  // Calculate if we've hit 80% elapsed
  const timeElapsed = totalTime - timeRemaining
  const isEightyPercent = timeElapsed >= totalTime * 0.8

  // Format mm:ss
  const minutes = Math.floor(timeRemaining / 60)
  const seconds = timeRemaining % 60

  return (
    <div
      style={{
        fontWeight: isEightyPercent ? 'bold' : 'normal',
        color: isEightyPercent ? 'red' : 'black',
        fontSize: '1.2rem'
      }}
    >
      {minutes}:{seconds.toString().padStart(2, '0')}
    </div>
  )
}
