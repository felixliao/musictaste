import Button from 'components/button'
import { NextPageContext } from 'next'
import { useSession, signIn, signOut, getSession } from 'next-auth/react'
import Link from 'next/link'

export default function Home() {
  const session = useSession()
  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-2 px-2">
      <h1 className="text-center text-2xl">Netease Music Taste Calculator</h1>
      <p className="mt-5 text-center text-sm opacity-60">
        Assess your music taste by the comment counts on Netease Music. The
        less, the better your taste.
      </p>
      {session.status === 'authenticated' && (
        <>
          <Link href="/start" passHref>
            <Button className="mt-4" text="Start" />
          </Link>
          <p className="mt-6 text-sm opacity-70">
            Sign in as <span className="italic">{session.data.user?.name}</span>
          </p>
          <p
            className="mt-1 cursor-pointer text-sm italic opacity-70"
            onClick={() => signOut()}
          >
            Not {session.data.user?.name}?
            <span className="text-spotify-green"> Click here</span> to log out
          </p>
        </>
      )}
      {session.status === 'unauthenticated' && (
        <Button
          className="mt-5"
          text="Login with Spotify"
          onClick={() => signIn('spotify', { callbackUrl: '/start' })}
        />
      )}
    </div>
  )
}

export async function getServerSideProps(context: NextPageContext) {
  const session = await getSession({ req: context.req })
  return {
    props: {
      session,
    },
  }
}
