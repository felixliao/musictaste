import Button from 'components/button'
import Link from 'next/link'
import React, { useState } from 'react'

const initState = {
  list: 'top',
  range: 'short_term',
}

let start: number

const options = {
  list: [
    {
      label: 'Top Songs',
      value: 'top',
    },
    {
      label: 'Liked Songs',
      value: 'liked',
    },
  ],
  range: [
    {
      label: 'Last Month',
      value: 'short_term',
    },
    {
      label: 'Last 6 Months',
      value: 'medium_term',
    },
    {
      label: 'All',
      value: 'long_term',
    },
  ],
}
const Start = () => {
  const [form, setForm] = useState(initState)
  const { list, range } = form
  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col items-center px-5 py-10">
      <h1 className="mb-6 w-full text-left text-4xl">
        Select the songs you want to analyze
      </h1>
      <h3 className="mb-3 w-full text-left text-lg">Songs from...</h3>
      <div className="mb-5 flex w-full">
        {options.list.map(({ label, value }) => (
          <div
            className={`flex-1 text-center ${
              value === list ? 'bg-spotify-green' : ''
            } rounded-full py-3`}
            key={value}
            onClick={() => setForm({ ...form, list: value })}
          >
            {label}
          </div>
        ))}
      </div>
      {list === 'top' && (
        <>
          <h3 className="mb-3 w-full text-left text-lg">Timeframe</h3>
          <div className="flex w-full">
            {options.range.map(({ label, value }) => (
              <div
                className={`flex-1 text-center ${
                  value === range ? 'bg-spotify-green' : ''
                } rounded-full py-3 text-sm`}
                key={value}
                onClick={() => setForm({ ...form, range: value })}
              >
                {label}
              </div>
            ))}
          </div>
        </>
      )}
      <Link href={`/result?list=${list}&range=${range}`} passHref>
        <Button
          className="mt-12 mb-6"
          text="Calculate"
          canLoad
          onClick={() => {
            start = Date.now()
            window.gtag('event', 'start', {
              list,
              range,
            })
          }}
        />
      </Link>
    </div>
  )
}

export { start }

export default Start
