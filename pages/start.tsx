import Button from 'components/button'
import { GetStaticProps } from 'next'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import Link from 'next/link'
import React, { useState } from 'react'

const initState = {
  list: 'top',
  range: 'short_term',
}

let start: number

const options = {
  list: ['top', 'liked'],
  range: ['short_term', 'medium_term', 'long_term'],
}
const Start = () => {
  const [form, setForm] = useState(initState)
  const { list, range } = form
  const { t } = useTranslation(['start', 'parameter'])
  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col items-center px-5 py-10">
      <h1 className="mb-6 w-full text-left text-4xl">{t('select')}</h1>
      <h3 className="mb-3 w-full text-left text-lg">{t('from')}</h3>
      <div className="mb-5 flex w-full">
        {options.list.map(value => (
          <div
            className={`flex-1 text-center ${
              value === list ? 'bg-spotify-green' : ''
            } rounded-full py-3`}
            key={value}
            onClick={() => setForm({ ...form, list: value })}
          >
            {t(value, { ns: 'parameters' })}
          </div>
        ))}
      </div>
      {list === 'top' && (
        <>
          <h3 className="mb-3 w-full text-left text-lg">{t('timeframe')}</h3>
          <div className="flex w-full">
            {options.range.map(value => (
              <div
                className={`flex-1 text-center ${
                  value === range ? 'bg-spotify-green' : ''
                } rounded-full py-3 text-sm`}
                key={value}
                onClick={() => setForm({ ...form, range: value })}
              >
                {t(value, { ns: 'parameters' })}
              </div>
            ))}
          </div>
        </>
      )}
      <Link href={`/result?list=${list}&range=${range}`} passHref>
        <Button
          className="mt-12 mb-6"
          text={t('calculate')}
          canLoad
          loadingText={t('loading')}
          onClick={() => {
            start = Date.now()
            window.gtag('event', 'start', {
              list,
              range,
            })
          }}
        />
      </Link>
    </div>
  )
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale!, ['start', 'parameters'])),
    },
  }
}
export { start }

export default Start
