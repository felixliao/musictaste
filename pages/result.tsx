import { getList } from 'lib/spotify'
import { getSession, useSession } from 'next-auth/react'
import { GetServerSideProps } from 'next/types'
import Image from 'next/image'
import React, { useCallback, useEffect, useState } from 'react'
import { Song } from 'types'
import { useRouter } from 'next/router'

interface Props {
  list: Song[]
}

const Result = (props: Props) => {
  const [songList, setSongList] = useState<Song[]>([])
  const [score, setScore] = useState<number | null>(null)
  const router = useRouter()
  const { query } = router
  const { list, range } = query
  const { data } = useSession()
  const { user } = data ?? {}
  const { accessToken } = user ?? ({} as any)
  useEffect(() => {
    if (list && range && accessToken) load()
    else router.push('/')
  }, [])
  const load = useCallback(async () => {
    const res = await getList(list as string, range as string, accessToken)
    setSongList(res)

    setFinalScore(await Promise.all(res.map((song, i) => getScore(song, i))))
  }, [list, range, accessToken])
  const setFinalScore = useCallback(
    (list: number[]) => {
      const { sum, count } = list
        .filter(s => s >= 0)
        .reduce(
          ({ sum, count }, score) => {
            sum += score
            count++
            return {
              sum,
              count,
            }
          },
          {
            sum: 0,
            count: 0,
          }
        )
      setScore(sum / count)
    },
    [songList]
  )
  const getScore = async (song: Song, idx: number) => {
    try {
      const res = await fetch(
        `/api/score?keyword=${encodeURIComponent(
          `${song.name} ${song.artist}`
        )}`
      )
      if (!res.ok) {
        addScore(-1, idx)
        return -1
      }
      const { score } = await res.json()
      addScore(score, idx)
      return score
    } catch (e) {
      addScore(-1, idx)
      return -1
    }
  }
  const addScore = async (score: number, idx: number) => {
    setSongList(songList =>
      songList
        .slice(0, idx)
        .concat({ ...songList[idx], score }, songList.slice(idx + 1))
    )
  }
  return (
    <div className="mx-2 mt-4">
      <div className="mb-8">
        <h1 className="mb-3 text-5xl">Your Results</h1>
        {score && <h2 className="text-3xl">Final Score: {score}</h2>}
      </div>
      {songList.map(item => (
        <div className="my-3 flex" key={item.name}>
          <Image src={item.src} alt={item.name} width={75} height={75} />
          <div className="ml-3 flex flex-col justify-center">
            <h3 className="w-48 overflow-hidden text-ellipsis whitespace-nowrap text-xl">
              {item.name}
            </h3>
            <p className="w-48 overflow-hidden text-ellipsis whitespace-nowrap opacity-80">
              {item.artist}
            </p>
            <p className="w-48 overflow-hidden text-ellipsis whitespace-nowrap text-sm opacity-60">
              {item.album}
            </p>
          </div>
          <div className="ml-auto mr-3 flex flex-col items-end justify-center">
            <p className="opacity-60">score</p>
            <p className="text-xl">
              {item.score === undefined
                ? 'loading'
                : item.score === -1
                ? 'failed'
                : item.score}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}

export default Result
