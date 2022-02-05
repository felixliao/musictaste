import spotifyApi, { LOGIN_URL } from 'lib/spotify'
import NextAuth from 'next-auth'
import { JWT } from 'next-auth/jwt/types'
import SpotifyProvider from 'next-auth/providers/spotify'

const refreshAccessToken = async (token: JWT) => {
  try {
    spotifyApi.setAccessToken(token.accessToken)
    spotifyApi.setRefreshToken(token.refreshToken)
    const { body } = await spotifyApi.refreshAccessToken()
    return {
      ...token,
      accessToken: body.access_token,
      accessTokenExpires: Date.now() + body.expires_in * 1000,
      refreshToken: body.refresh_token ?? token.refreshToken,
    }
  } catch (e) {
    return {
      ...token,
      error: e,
    }
  }
}

export default NextAuth({
  providers: [
    SpotifyProvider({
      authorization: LOGIN_URL,
      clientId: process.env.SPOTIFY_CLIENT_ID!,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.JWT_SECRET,
  callbacks: {
    jwt: async ({ token, account, user }) => {
      if (account && user) {
        return {
          ...token,
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          username: account.providerAccountId,
          accessTokenExpires: account.expires_at! * 1000,
        }
      }

      if (Date.now() < token.accessTokenExpires) {
        return token
      }

      return await refreshAccessToken(token)
    },
    session: async ({ session, token }) => {
      session.user.accessToken = token.accessToken
      session.user.refreshToken = token.accessToken
      session.user.username = token.username
      return session
    },
  },
})
