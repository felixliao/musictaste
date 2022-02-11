import React from 'react'

interface Props {
  text: string
  onClick?: () => void
  className?: string
  canLoad?: boolean
}
const Button = React.forwardRef(
  ({ text, onClick, className, canLoad = false }: Props, ref) => {
    const [clicked, setClicked] = React.useState(false)
    const handleClick = React.useCallback(
      (e: any) => {
        setClicked(true)
        // @ts-expect-error
        onClick?.(e)
      },
      [onClick]
    )
    return (
      <button
        className={`text-center rounded-full w-32 bg-spotify-green py-3 text-white ${className}`}
        onClick={handleClick}
      >
        {canLoad && clicked ? 'computing' : text}
      </button>
    )
  }
)

export default Button
