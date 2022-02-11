import { getList } from 'lib/spotify'
import { getSession } from 'next-auth/react'
import { GetServerSideProps } from 'next/types'
import Image from 'next/image'
import { Song } from 'types'
import { useRouter } from 'next/router'
import getCount from 'lib/netease'
import Link from 'next/link'
import Button from 'components/button'
import { useEffect } from 'react'
import { start } from './start'

interface Props {
  songList: Song[]
  score: number
}

const Result = ({ songList, score }: Props) => {
  const router = useRouter()
  const { query } = router
  const { list, range } = query
  useEffect(() => {
    window.gtag('event', 'success', { list, range, time: start ? Date.now() - start : 0})
  })
  if (score === -1) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <h1 className="text-sm text-center w-64 mb-5">
          Sorry, we have encounter a problem. Please try again later.
        </h1>
        <Link href="/">
          <Button text="Back to Home" />
        </Link>
      </div>
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
            Final Score:{' '}
            <span className="text-spotify-green text-6xl">{score}</span>
            <span className="opacity-40 text-sm">/100</span>
          </h2>
        )}
      </div>
      {songList ? (
        songList.map(item => (
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
  const songList = await getList(
    list as string,
    range as string,
    accessToken,
    50
  )

  const computedSongList = await Promise.all(
    songList.map(async song => ({
      ...song,
      score: await getCount(`${song.name} ${song.artist}`),
    }))
  )
  const { sum, count } = computedSongList.reduce(
    ({ sum, count }, song) => {
      if (song.score !== -1) {
        return {
          sum: sum + song.score,
          count: count + 1,
        }
      }
      return {
        sum,
        count,
      }
    },
    { sum: 0, count: 0 }
  )
  const finalScore =
    count > 0 ? Math.round(1000 - Math.min(sum / count, 1000)) / 10 : -1
  return {
    props: {
      songList: computedSongList,
      score: finalScore,
    },
  }
}

export default Result
