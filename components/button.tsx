import React from 'react'

interface Props {
  text: string
  onClick?: () => void
  className?: string
}
const Button = ({ text, onClick, className }: Props) => (
  <button
    className={`rounded-full bg-spotify-green px-10 py-3 text-white ${className}`}
    onClick={onClick}
  >
    {text}
  </button>
)

export default Button
