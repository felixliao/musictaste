import Button from 'components/button'
import { NextPageContext } from 'next'
import { useSession, signIn, signOut, getSession } from 'next-auth/react'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import Link from 'next/link'
import Image from 'next/image'
import localeSrc from 'public/locale.png'
import { useRouter } from 'next/router'

export default function Home() {
  const session = useSession()
  const { t } = useTranslation()
  const { locale } = useRouter()
  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-2 px-2">
      <h1 className="text-center text-2xl">{t('title')}</h1>
      <p className="mt-5 text-center text-sm opacity-60 mx-5">{t('desc')}</p>
      {session.status === 'authenticated' && (
        <>
          <Link href="/start" passHref>
            <Button className="mt-4" text={t('start')} />
          </Link>
          <p className="mt-6 text-sm opacity-70">
            {t('signedin')}
            <span className="italic">{session.data.user?.name}</span>
          </p>
          <p
            className="mt-1 cursor-pointer text-sm italic opacity-70"
            onClick={() => signOut()}
          >
            {`${t('not')} ${session.data.user?.name}?`}
            <span className="text-spotify-green">{t('clickhere')}</span>{' '}
            {t('logout')}
          </p>
        </>
      )}
      {session.status === 'unauthenticated' && (
        <Button
          className="mt-5"
          text={t('signin')}
          onClick={() => signIn('spotify', { callbackUrl: '/start' })}
        />
      )}
      <div className="flex absolute bottom-8 items-center justify-evenly gap-3 opacity-40">
        <Link href="/info">
          <p className="text-sm">{t('faq')}</p>
        </Link>{' '}
        <p className='text-sm'>|</p>
        <Link href="/" locale={locale === 'en' ? 'zh-CN' : 'en'}>
          <Image src={localeSrc} width={16} height={16} layout="fixed" />
        </Link>
      </div>
    </div>
  )
}

export async function getServerSideProps(context: NextPageContext) {
  const session = await getSession({ req: context.req })
  return {
    props: {
      session,
      ...(await serverSideTranslations(context.locale!, ['common'])),
    },
  }
}
