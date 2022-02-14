import { getList } from 'lib/spotify'
import { getSession, useSession } from 'next-auth/react'
import { GetServerSideProps } from 'next/types'
import Image from 'next/image'
import { Song } from 'types'
import getCount from 'lib/netease'
import Link from 'next/link'
import Button from 'components/button'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { start } from './start'
import createImage from 'lib/poster'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useTranslation } from 'next-i18next'
import backButton from 'public/back.svg'
import { useRouter } from 'next/router'

interface Props {
  songList: Song[]
  score: number
  list: string
  range: string
  error: boolean
}

const Result = ({ songList, score, list, range, error }: Props) => {
  const router = useRouter()
  const [profile, setProfile] = useState<any>()
  const { t } = useTranslation(['result', 'parameters'])
  const [modalVisible, setModalVisible] = useState(false)
  const [poster, setPoster] = useState<string>()
  const descriptions = useMemo(
    () =>
      list === 'top'
        ? `${t('top', { ns: 'parameters' })}, ${t(range, { ns: 'parameters' })}`
        : t(list, { ns: 'parameters' }),
    [list, range]
  )
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
          descriptions,
        })
      )
    setModalVisible(true)
    window.gtag('event', 'share', { time: Date.now() - time, score })
  }, [poster, profile])
  if (error || score === -1) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <h1 className="text-sm text-center w-64 mb-5">{t('error')}</h1>
        <Link href="/">
          <Button text="Back to Home" />
        </Link>
      </div>
    )
  }
  return (
    <div className="mx-2 mt-4">
      <div className="mb-5">
        <h1 className="mb-3 text-5xl">{t('title')}</h1>
        <p className="mb-2 text-xl opacity-60">
          {t('parameters')}
          {descriptions}
        </p>
        <h2 className="text-4xl">
          {t('score')}
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
            <p className="opacity-60">{t('comments')}</p>
            <p className="text-xl">
              {item.score === -1 ? t('fail') : item.score}
            </p>
          </div>
        </div>
      ))}
      <div className="h-24 relative">
        <Link href="/info">
          <p className="absolute h-8 right-8 text-sm text-right cursor-pointer opacity-30 my-auto top-0 bottom-0 w-16">
            {t('faq')}
          </p>
        </Link>
      </div>
      {!modalVisible && (
        <Button
          className="fixed w-32 bottom-8 mx-auto left-0 right-0 drop-shadow-lg"
          text={t('share')}
          onClick={onShare}
          canLoad
          loadingText={t('loading')}
        />
      )}
      <button
        className="fixed bottom-8 rounded-full w-14 bg-spotify-green left-8 h-12 flex justify-center items-center drop-shadow-lg cursor-pointer"
        onClick={router.back}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          height="24px"
          viewBox="0 0 24 24"
          width="24px"
          fill="#FFFFFF"
        >
          <path d="M0 0h24v24H0V0z" fill="none" />
          <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
        </svg>
      </button>
      {modalVisible && poster && (
        <div className="fixed top-0 left-0 w-screen h-screen bg-black/70 z-10">
          <div className="flex flex-col justify-center items-center max-w-xs absolute m-auto left-0 top-0 right-0 bottom-0 my-auto">
            <img className="w-11/12 h-auto" src={poster} alt="poster" />
            <p className="text-lg my-3">{t('download')}</p>
            <Button text={t('close')} onClick={() => setModalVisible(false)} />
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
      ...(await serverSideTranslations(ctx.locale!, ['result', 'parameters'])),
    },
  }
}

export default Result
