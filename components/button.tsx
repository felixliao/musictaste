import React from 'react'

interface Props {
  text: string
  onClick?: () => void
  className?: string
}
const Button = React.forwardRef(({ text, onClick, className }: Props, ref) => (
  <button
    className={`rounded-full bg-spotify-green px-10 py-3 text-white ${className}`}
    onClick={onClick}
  >
    {text}
  </button>
))

export default Button
