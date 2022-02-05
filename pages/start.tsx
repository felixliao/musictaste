import Button from 'components/button'
import Select from 'components/select'
import Link from 'next/link'
import { useRouter } from 'next/router'
import React, { useState } from 'react'

const initState = {
  list: 'Top Songs',
  timeframe: 'mid',
}
const Start = () => {
  const router = useRouter()
  const [form, setForm] = useState(initState)
  const { list, timeframe } = form
  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col items-center p-5">
      <h1 className="mb-3 w-full text-left text-4xl">Select your range</h1>
      <h3 className="mb-3 w-full text-left text-lg">Songs from...</h3>
      <div className="flex w-full">
        {['Top Songs', 'Liked Songs'].map(option => (
          <div
            className={`flex-1 text-center ${
              option === form.list ? 'bg-spotify-green' : ''
            } rounded-full py-5`}
            key={option}
            onClick={() => setForm({ ...form, list: option })}
          >
            {option}
          </div>
        ))}
      </div>
      <h3 className="mb-3 w-full text-left text-lg">
        {list === 'Top Songs' ? 'Timeframe' : 'Number of songs'}
      </h3>
      <div className="flex w-full">
        {/* {(range === 'Top Songs' ? ['', 'Liked Songs'] : ).map(option => (
          <div
            className={`flex-1 text-center ${
              option === form.range ? 'bg-spotify-green' : ''
            } rounded-full py-5`}
            key={option}
            onClick={() => setForm({ ...form, range: option })}
          >
            {option}
          </div>
        ))} */}
        <Button
          text="开始"
          onClick={() => {
            fetch('/api/start')
            router.push(`/result?list=${list}&timeframe=${timeframe}`)
          }}
        />
      </div>
    </div>
  )
}

export default Start
