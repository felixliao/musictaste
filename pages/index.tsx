import Button from 'components/button'
import { useSession, signIn, signOut } from 'next-auth/react'
import Head from 'next/head'
import Link from 'next/link'

export default function Home() {
  const session = useSession()
  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-2">
      <Head>
        <title>Create Next App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <h1 className="text-lg">测试你的音乐逼格</h1>
      {session.status === 'authenticated' && (
        <>
          <Link href="/start">
            <Button text="开始" />
          </Link>
          <p className="mt-6 text-sm opacity-70">
            已以 {session.data.user?.name} 的身份登录
          </p>
          <p
            className="mt-1 cursor-pointer text-sm italic opacity-70"
            onClick={() => signOut()}
          >
            不是{session.data.user?.name}? 点击
            <span className="text-spotify-green">此处</span>登出
          </p>
        </>
      )}
      {session.status === 'unauthenticated' && (
        <Button text="Login with Spotify" onClick={() => signIn('spotify')} />
      )}
    </div>
  )
}
