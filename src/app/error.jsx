'use client'
import Errorpage from '@/features/marketing/ErrorPage'

export default function Error({ error, reset }) {
  return <Errorpage error={error} reset={reset} />
}
