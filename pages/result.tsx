import { getList } from 'lib/spotify'
import { getSession } from 'next-auth/react'
import { GetServerSideProps } from 'next/types'
import Image from 'next/image'
import React, { useEffect } from 'react'

const Result = props => {
  const { list } = props
  return (
    <div>
      {list.map(item => (
        <div className="flex" key={item.name}>
          <Image src={item.src} alt={item.name} width={150} height={150} />
          <div className="flex flex-col justify-center ml-3">
            <h3 className='text-2xl'>{item.name}</h3>
            <p>{item.artist}</p>
            <p className='text-sm opacity-80'>{item.album}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

export default Result

export const getServerSideProps: GetServerSideProps = async context => {
  const { list, range } = context.query
  const session = await getSession({ req: context.req })
  if (!session || !list || !range) {
    return {
      props: {},
    }
  }
  const { accessToken } = session.user
  return {
    props: {
      list: await getList(list, range, accessToken),
    },
  }
}
