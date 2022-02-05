import React from 'react'

interface Props {
  text: string
  onClick?: () => void
}
const Button = ({ text, onClick }: Props) => (
  <button
    className="mt-5 rounded-full bg-spotify-green px-10 py-3 text-white"
    onClick={onClick}
  >
    {text}
  </button>
)

export default Button
