import '../styles/globals.css'
import { appWithTranslation } from 'next-i18next'
import type { AppProps } from 'next/app'
import { SessionProvider } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Script from 'next/script'

function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  const router = useRouter()
  const [from, setFrom] = useState<string>('')
  useEffect(() => {
    const handleRouteChange = (url: string) => {
      window.gtag('config', process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS, {
        page_path: url.split('?')[0],
        from,
      })
    }

    router.events.on('routeChangeComplete', handleRouteChange)

    return () => {
      router.events.off('routeChangeComplete', handleRouteChange)
    }
  }, [router.events])

  useEffect(() => {
    router.query?.from && setFrom(router.query.from as string)
  })
  return (
    <>
      {/* Global Site Tag (gtag.js) - Google Analytics */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){window.dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', '${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS}');
        `}
      </Script>
      <title>Netease Music Taste</title>
      <SessionProvider session={session}>
        <Component {...pageProps} />
      </SessionProvider>
    </>
  )
}

export default appWithTranslation(MyApp)
