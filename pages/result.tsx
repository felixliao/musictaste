import { getList } from 'lib/spotify'
import { getSession, useSession } from 'next-auth/react'
import { GetServerSideProps } from 'next/types'
import Image from 'next/image'
import React, { useCallback, useEffect, useState } from 'react'
import { Song } from 'types'
import { useRouter } from 'next/router'

interface Props {
  serverSongList: Song[]
}

const Result = ({ serverSongList }: Props) => {
  const [songList, setSongList] = useState<Song[]>(serverSongList)
  const [score, setScore] = useState<number>()
  const router = useRouter()
  const { query } = router
  const { list, range } = query
  const { data } = useSession()
  const { user } = data ?? {}
  const { accessToken } = user ?? ({} as any)
  useEffect(() => {
    if (serverSongList || (list && accessToken)) load()
    else router.push('/')
  }, [])
  const load = useCallback(async () => {
    let res
    if (serverSongList) {
      res = songList
    } else {
      res = await getList(list as string, range as string, accessToken)
      setSongList(res)
    }

    setFinalScore(await Promise.all(res.map((song, i) => getScore(song, i))))
  }, [list, range, accessToken])
  const setFinalScore = useCallback(
    (list: number[]) => {
      let { sum, count } = list
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
      setScore(Math.round(1000 - Math.min(sum / count, 1000)) / 10)
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
      songList!
        .slice(0, idx)
        .concat({ ...songList![idx], score }, songList!.slice(idx + 1))
    )
  }
  return (
    <div className="mx-2 mt-4">
      <div className="mb-5">
        <h1 className="mb-3 text-5xl">Your Results</h1>
        <p className="mb-2 text-xl opacity-60">
          Parameters:{' '}
          {list === 'top'
            ? `Top Songs, ${
                range === 'short_term'
                  ? 'Last Month'
                  : range === 'medium_term'
                  ? 'Last 6 Months'
                  : 'All'
              }`
            : 'Liked Songs'}
        </p>
        {score !== undefined && (
          <h2 className="text-4xl">
            Final Score: <span className="text-spotify-green text-6xl">{score}</span><span className="opacity-40 text-sm">/100</span>
          </h2>
        )}
      </div>
      {songList ? (
        songList.map(item => (
          <div className="my-3 flex" key={item.name}>
            <Image
              src={item.src}
              alt={item.name}
              width={75}
              height={75}
            />
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
              <p className="opacity-60">comments</p>
              <p className="text-xl">
                {item.score === undefined
                  ? 'loading'
                  : item.score === -1
                  ? 'failed'
                  : item.score}
              </p>
            </div>
          </div>
        ))
      ) : (
        <h1 className="text-4xl">Loading...</h1>
      )}
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async ctx => {
  const { query, req } = ctx
  const session = await getSession({ req })
  const { user } = session ?? {}
  const { accessToken } = user ?? ({} as any)
  const { list, range } = query
  const res = await getList(list as string, range as string, accessToken)
  return {
    props: {
      serverSongList: res,
    },
  }
}

export default Result
