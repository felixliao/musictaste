import React from 'react'

interface Props {
  options: string[]
  onChange: (value: string) => void
  title: string
}
const Select = ({ title, options, onChange }: Props) => {
  return (
    <>
      <div>{title}</div>
      <div className="flex">
        {options.map(option => (
          <div className="text-center w-60 bg-slate-500 py-5" key={option}>
            {option}
          </div>
        ))}
      </div>
    </>
  )
}

export default Select
