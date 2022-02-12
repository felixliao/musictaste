import { getList } from 'lib/spotify'
import { getSession, useSession } from 'next-auth/react'
import { GetServerSideProps } from 'next/types'
import Image from 'next/image'
import { Song } from 'types'
import getCount from 'lib/netease'
import Link from 'next/link'
import Button from 'components/button'
import { useCallback, useEffect, useState } from 'react'
import { start } from './start'
import createImage from 'lib/poster'

interface Props {
  songList: Song[]
  score: number
  list: string
  range: string
  error: boolean
}

const Result = ({ songList, score, list, range, error }: Props) => {
  const [profile, setProfile] = useState<any>()
  const [modalVisible, setModalVisible] = useState(false)
  const [poster, setPoster] = useState<string>()
  useEffect(() => {
    window.gtag('event', 'success', {
      list,
      range,
      time: start ? Date.now() - start : 0,
      score,
    })
    loadProfile()
  }, [])
  const loadProfile = useCallback(async () => {
    const me = await fetch('/api/me').then(res => res.json())
    setProfile(me)
    return me
  }, [])
  const onShare = useCallback(async () => {
    let time = Date.now()
    poster ??
      setPoster(
        await createImage({
          _songList: songList,
          user: profile ?? (await loadProfile()),
          score,
        })
      )
    setModalVisible(true)
    window.gtag('event', 'share', { time: Date.now() - time, score })
  }, [poster, profile])
  if (error || score === -1) {
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
        <h2 className="text-4xl">
          Final Score:{' '}
          <span className="text-spotify-green text-6xl">{score}</span>
          <span className="opacity-40 text-sm">/100</span>
        </h2>
      </div>
      {songList.map(item => (
        <div className="my-3 flex" key={item.name}>
          <Image src={item.src} alt={item.name} width={75} height={75} />
          <div className="ml-3 flex flex-col justify-center">
            <h3 className="w-44 overflow-hidden text-ellipsis whitespace-nowrap text-xl">
              {item.name}
            </h3>
            <p className="w-44 overflow-hidden text-ellipsis whitespace-nowrap opacity-80">
              {item.artist}
            </p>
            <p className="w-44 overflow-hidden text-ellipsis whitespace-nowrap text-sm opacity-60">
              {item.album}
            </p>
          </div>
          <div className="ml-auto mr-3 flex flex-col items-end justify-center">
            <p className="opacity-60">comments</p>
            <p className="text-xl">
              {item.score === -1 ? 'failed' : item.score}
            </p>
          </div>
        </div>
      ))}
      <Link href="/info">
        <p className="text-sm pl-8 opacity-30 my-12">FAQs</p>
      </Link>
      {!modalVisible && (
        <Button
          className="fixed w-32 bottom-8 mx-auto left-0 right-0"
          text="Share"
          onClick={onShare}
          canLoad
        />
      )}
      {modalVisible && poster && (
        <div className="fixed top-0 left-0 w-screen h-screen bg-black/70 z-10">
          <div className="flex flex-col justify-center items-center max-w-xs absolute m-auto left-0 top-0 right-0 bottom-0 my-auto">
            <img className="w-full h-auto" src={poster} alt="poster" />
            <p className="text-lg my-3">Long press to download</p>
            <Button text="Close" onClick={() => setModalVisible(false)} />
          </div>
        </div>
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

  if (!list) {
    return {
      props: {
        error: true,
      },
    }
  }

  const songList = await getList(list as string, range as string, accessToken)

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
          sum: sum + Math.min(song.score, 1000),
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
      list,
      range,
    },
  }
}

export default Result
