import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

export const dynamic = 'force-dynamic'

const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  'https://app.drivexstore.shop'
).replace(/\/$/, '')

function safeRedirect(value) {
  if (!value || typeof value !== 'string') {
    return '/animations'
  }

  if (
    !value.startsWith('/') ||
    value.startsWith('//') ||
    value.includes('\\') ||
    /[\u0000-\u001F\u007F]/.test(value)
  ) {
    return '/animations'
  }

  try {
    const decoded = decodeURIComponent(value)

    if (
      !decoded.startsWith('/') ||
      decoded.startsWith('//') ||
      decoded.includes('\\') ||
      /[\u0000-\u001F\u007F]/.test(decoded)
    ) {
      return '/animations'
    }

    return value
  } catch {
    return '/animations'
  }
}

export async function GET(request) {
  const { searchParams } = new URL(request.url)

  const code = searchParams.get('code')
  const next = safeRedirect(searchParams.get('redirectTo'))

  if (!code) {
    return NextResponse.redirect(
      new URL('/login?error=missing_code', SITE_URL)
    )
  }

  try {
    const cookieStore = await cookies()

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },

          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          },
        },
      }
    )

    const { error } =
      await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error('OAuth callback:', error.message)

      return NextResponse.redirect(
        new URL('/login?error=auth_failed', SITE_URL)
      )
    }

    const response = NextResponse.redirect(
      new URL(next, SITE_URL)
    )

    response.headers.set('Cache-Control', 'private, no-store')

    return response
  } catch (error) {
    console.error('OAuth callback failed:', error.message)

    return NextResponse.redirect(
      new URL('/login?error=auth_failed', SITE_URL)
    )
  }
}
