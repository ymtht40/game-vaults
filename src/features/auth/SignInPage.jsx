'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { GoogleLogo } from '@phosphor-icons/react';

import { createClient } from '@/libs/supabase/client';
import { toast } from 'sonner';
import { resolvePostAuthPath } from '@/libs/utils/resolvePostAuthPath';
import Button from '@/components/ui/Button'; // module id: 687989
import FadeIn from '@/components/motion/FadeIn'; // module id: 460391
import { BrandLogo } from '@/assets/logos/BrandLogo'; // module id: 635566
import { AuthShowcase } from '@/features/auth/AuthShowcase'; // module id: 111235
import SignInCodeForm from '@/features/auth/SignInCodeForm'; // module id: 588003
import Loader from '@/components/ui/Loader'; // module id: 461376
import NavLink from '@/components/navigation/NavSurface'; // module id: 520237

import { Envelope, GithubLogo, ArrowLeft, ArrowRight } from '@phosphor-icons/react';
import { useTransitionRouter } from '@/providers/TransitionRouterProvider'; // module id: 676040
import { OAuthButton } from '@/components/ui/OAuthButton'; // module id: 281991

function sanitizeRedirectPath(value, fallback = '/animations') {
  if (
    typeof value !== 'string' ||
    !value.startsWith('/') ||
    value.startsWith('//') ||
    value.startsWith('/\\')
  ) {
    return fallback;
  }

  return value;
}

function resolveRedirect({ destination, redirectTo }) {
  const redirectPath = sanitizeRedirectPath(
    redirectTo,
    sanitizeRedirectPath(destination),
  );

  if (redirectPath.startsWith('/api/teams/invites/accept')) {
    return {
      href: redirectPath,
      hard: true,
    };
  }

  return {
    href: redirectPath,
    hard: false,
  };
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SignInPage({ images = [] }) {
  const router = useTransitionRouter();
  const searchParams = useSearchParams();
  const redirectTo = sanitizeRedirectPath(
    searchParams.get('redirectTo'),
  );

  const [email, setEmail] = useState(
    () => searchParams.get('email') || '',
  );
  const [emailRedirectTo, setEmailRedirectTo] = useState(null);
  const [emailError, setEmailError] = useState('');
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isGitHubLoading, setIsGitHubLoading] = useState(false);
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [incompleteUser, setIncompleteUser] = useState(null);

   const navigate = useCallback(
     ({ href, hard }) => {
       if (hard) {
         window.location.assign(href);
       } else {
         router.push(href);
       }
     },
     [router],
   );

  useEffect(() => {
    if (resendCountdown > 0) {
      const timeoutId = setTimeout(
        () => setResendCountdown(resendCountdown - 1),
        1000,
      );

      return () => clearTimeout(timeoutId);
    }
  }, [resendCountdown]);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const callbackError = searchParams.get('error');
      const callbackDescription = searchParams.get(
        'error_description',
      );

      if (callbackError) {
        if (callbackError !== 'no_code') {
          console.error(
            'Auth error from callback:',
            callbackError,
            callbackDescription,
          );

          const hasMultipleAccounts =
            typeof callbackDescription === 'string' &&
            callbackDescription.includes('Multiple accounts');

          if (callbackError === 'otp_expired') {
            toast.error(
              'Your login link has expired. Please request a new one.',
            );
          } else if (hasMultipleAccounts) {
            toast.error(
              'Your account has multiple emails matching different GameVault users. Please sign in with your email instead.',
              { duration: 10000 },
            );
          } else if (callbackError === 'oauth_no_subscription') {
            toast.error(
              callbackDescription?.replace(/\+/g, ' ') ||
                "We didn't find an GameVault subscription at this email.",
              {
                duration: 10000,
                action: {
                  label: 'Get the library',
                  onClick: () => router.push('/pricing'),
                },
              },
            );
          } else if (
            callbackError === 'session_error' ||
            callbackError === 'callback_error'
          ) {
            toast.error('Authentication failed. Please try again.');
          } else {
            toast.error(
              callbackDescription?.replace(/\+/g, ' ') ||
                'Authentication failed',
            );
          }
        }

        window.history.replaceState(
          null,
          '',
          window.location.pathname,
        );
        setIsCheckingSession(false);
        return;
      }

      const { data: userData, error: userError } = await supabase.auth.getUser();

      if (!userError && userData?.user) {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (
          session &&
          !window.location.hash.includes('type=recovery')
        ) {
          navigate(
            resolveRedirect({
              destination: '/animations',
              redirectTo,
            }),
          );
          return;
        }
      }

      const hash = window.location.hash;

      if (hash && hash.includes('access_token')) {
        const hashParams = new URLSearchParams(hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const hashError = hashParams.get('error');
        const hashDescription = hashParams.get('error_description');

        if (hashError) {
          console.error(
            'Auth error from hash:',
            hashError,
            hashDescription,
          );

          const errorCode = hashParams.get('error_code');

          const hasSubscriptionError =
            errorCode === 'hook_rejected' ||
            errorCode === 'access_denied' ||
            (typeof hashDescription === 'string' &&
              hashDescription.includes('GameVault subscription'));

          const hasMultipleAccounts =
            typeof hashDescription === 'string' &&
            hashDescription.includes('Multiple accounts');

          if (hashError === 'otp_expired') {
            toast.error(
              'Your login link has expired. Please request a new one.',
            );
          } else if (hasMultipleAccounts) {
            toast.error(
              'Your account has multiple emails matching different GameVault users. Please sign in with your email instead.',
              { duration: 10000 },
            );
          } else if (hasSubscriptionError) {
            toast.error(
              hashDescription?.replace(/\+/g, ' ') ||
                "We didn't find an GameVault subscription at this email.",
              {
                duration: 10000,
                action: {
                  label: 'Get the library',
                  onClick: () => router.push('/pricing'),
                },
              },
            );
          } else {
            toast.error(
              hashDescription?.replace(/\+/g, ' ') ||
                'Authentication failed',
            );
          }

          window.history.replaceState(
            null,
            '',
            window.location.pathname + window.location.search,
          );
          setIsCheckingSession(false);
          return;
        }

        if (accessToken && refreshToken) {
          try {
            const { data, error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });

            if (error) {
              throw error;
            }

            if (data?.session) {
              const {
                data: { user: authenticatedUser },
              } = await supabase.auth.getUser();

              if (authenticatedUser) {
                toast.success('Welcome back!');

                window.history.replaceState(
                  null,
                  '',
                  window.location.pathname,
                );

                navigate(
                  resolveRedirect({
                    destination: '/animations',
                    redirectTo,
                  }),
                );
                return;
              }
            }
          } catch (sessionError) {
            console.error('Session error:', sessionError);
            toast.error(
              sessionError.message || 'Failed to authenticate',
            );

            window.history.replaceState(
              null,
              '',
              window.location.pathname + window.location.search,
            );
          }
        }
      }

      setIsCheckingSession(false);
    })().catch(() => {
      console.error('Unable to check the current session.');
      toast.error('Unable to check your session. Please try signing in again.');
      setIsCheckingSession(false);
    });
  }, [router, redirectTo, searchParams, navigate]);

  const sendSignInCode = useCallback(async () => {
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setEmailError('Email is required.');
      return;
    }

    if (!emailPattern.test(trimmedEmail)) {
      setEmailError('Enter a valid email address.');
      return;
    }

    setEmailError('');
    setIsSendingCode(true);
    setIncompleteUser(null);

    try {
      const response = await fetch('/api/auth/magic-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: trimmedEmail,
          origin: window.location.origin,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.error === 'incomplete_user') {
          setIncompleteUser({
            email: trimmedEmail,
            checkoutUrl: result.checkout_url,
            message: result.message,
          });
          return;
        }

        throw Error(
          result.error || 'Failed to send the sign-in code',
        );
      }

      setIsCodeSent(true);
      setVerificationEmail(result.email || trimmedEmail);
      setEmailRedirectTo(result.redirectTo || null);
      setResendCountdown(60);

      toast.success('Check your email for your sign-in code.');
    } catch (requestError) {
      console.error('Magic link error:', requestError);
      toast.error(requestError.message || 'An error occurred');
    } finally {
      setIsSendingCode(false);
    }
  }, [email]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    await sendSignInCode();
  };

  const handleResendCode = async () => {
    if (!(resendCountdown > 0)) {
      await sendSignInCode();
    }
  };

  const handleVerifyCode = useCallback(
    async (code) => {
      const supabase = createClient();

      const { data, error } = await supabase.auth.verifyOtp({
        email: verificationEmail || email.trim(),
        token: code,
        type: 'email',
      });

      if (error || !data?.session) {
        throw error || Error('Verification failed');
      }

      const destination = await resolvePostAuthPath({
        supabase,
        session: data.session,
      });

      toast.success('Welcome back!');

      navigate(
        resolveRedirect({
          destination,
          redirectTo: searchParams.get('redirectTo')
            ? redirectTo
            : emailRedirectTo || redirectTo,
        }),
      );
    },
    [
      verificationEmail,
      email,
      navigate,
      redirectTo,
      emailRedirectTo,
      searchParams,
    ],
  );

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);

    try {
      const supabase = createClient();

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback?redirectTo=${encodeURIComponent(redirectTo)}`,
        },
      });

      if (error) {
        throw error;
      }
    } catch (loginError) {
      console.error('Google login error:', loginError);
      toast.error('Failed to login with Google');
      setIsGoogleLoading(false);
    }
  };

  const handleGitHubLogin = async () => {
    setIsGitHubLoading(true);

    try {
      const supabase = createClient();

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback?redirectTo=${encodeURIComponent(redirectTo)}`,
        },
      });

      if (error) {
        throw error;
      }
    } catch (loginError) {
      console.error('GitHub login error:', loginError);
      toast.error('Failed to login with GitHub');
      setIsGitHubLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen bg-background lg:grid-cols-[2fr_3fr]">
      <div className="relative flex flex-col bg-background">
        <div className="absolute bottom-0 right-0 top-0 hidden w-px bg-foreground/10 lg:block" />

        {isCheckingSession ? (
          <div className="flex flex-1 items-center justify-center p-24">
            <Loader size="32" />
          </div>
        ) : (
          <FadeIn
            className="flex flex-1 flex-col gap-16 p-24 md:p-40"
            stagger={0.08}
          >
            <div className="flex items-center">
              <BrandLogo />
            </div>

            <div className="flex flex-1 items-center justify-center">
              <div className="w-full max-w-[26rem]">
                {incompleteUser ? (
                  <div className="flex flex-col gap-24">
                    <div className="flex flex-col gap-12 border border-foreground/15 bg-surface p-24 text-center">
                      <div className="flex justify-center text-brand">
                        <ArrowRight className="size-40" />
                      </div>

                      <h3 className="text-h5 m-0 text-foreground">
                        Complete your subscription
                      </h3>

                      <p className="text-body-sm m-0 text-foreground-muted">
                        We found an account for{' '}
                        <span className="text-foreground">
                          {incompleteUser.email}
                        </span>{' '}
                        but your subscription was never activated.
                      </p>

                      <div className="mt-4 flex justify-center">
                        <Button
                          href={incompleteUser.checkoutUrl}
                          theme="brand"
                          size="sm"
                        >
                          Subscribe to GameVault
                        </Button>
                      </div>

                      <p className="text-mono-sm mt-4 text-foreground-muted">
                        Once you subscribe, you'll receive a magic link to sign in.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setIncompleteUser(null);
                        setEmail('');
                      }}
                      className="text-mono-sm inline-flex items-center justify-center gap-6 text-foreground-muted transition-colors duration-(--duration-quick) ease-(--ease-expo-out) hover:text-foreground"
                    >
                      <ArrowLeft className="size-16" />
                      Try a different email
                    </button>
                  </div>
                ) : isCodeSent ? (
                  <div className="flex flex-col gap-24">
                    <div className="flex flex-col gap-16 border border-foreground/15 bg-surface p-24">
                      <div className="flex justify-center text-brand">
                        <Envelope className="size-40" />
                      </div>

                      <div className="text-center">
                        <h3 className="text-h5 m-0 text-foreground">
                          Check your email
                        </h3>
                        <p className="text-body-sm mt-8 text-foreground-muted">
                          We sent a sign-in code to{' '}
                          <span className="text-foreground">
                            {email}
                          </span>
                        </p>
                      </div>

                      <ol className="text-body-sm flex flex-col gap-8 text-foreground-muted">
                        {[
                          'Open your email inbox',
                          'Copy the 6-digit code from the email',
                          'Enter it below to sign in',
                        ].map((instruction, index) => (
                          <li
                            key={index}
                            className="flex items-center gap-10"
                          >
                            <span className="text-mono-sm flex size-20 shrink-0 items-center justify-center bg-foreground/10 text-foreground">
                              {index + 1}
                            </span>
                            <span>{instruction}</span>
                          </li>
                        ))}
                      </ol>

                      <SignInCodeForm onVerify={handleVerifyCode} />

                      <div className="border-t border-foreground/10 pt-16 text-center">
                        <p className="text-mono-sm mb-8 text-foreground-muted">
                          Didn't receive the email?
                        </p>
                        <button
                          type="button"
                          onClick={handleResendCode}
                          disabled={
                            resendCountdown > 0 || isSendingCode
                          }
                          className="text-mono-sm text-foreground underline underline-offset-4 transition-colors duration-(--duration-quick) ease-(--ease-expo-out) hover:text-brand disabled:opacity-50 disabled:no-underline"
                        >
                          {resendCountdown > 0
                            ? `Resend in ${resendCountdown}s`
                            : 'Resend code'}
                        </button>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setIsCodeSent(false);
                        setEmail('');
                        setVerificationEmail('');
                        setResendCountdown(0);
                      }}
                      className="text-mono-sm inline-flex items-center justify-center gap-6 text-foreground-muted transition-colors duration-(--duration-quick) ease-(--ease-expo-out) hover:text-foreground"
                    >
                      <ArrowLeft className="size-16" />
                      Back to login
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col">
                    <header className="mb-32">
                      <h1 className="text-h3 m-0 text-foreground">
                        Sign in to GameVault.
                      </h1>
                      <p className="text-body-sm mt-12 text-foreground-muted">
                        Copy code, save components, manage your plan.
                      </p>
                    </header>

                    <form
                      onSubmit={handleSubmit}
                      noValidate
                      className="flex flex-col gap-20"
                    >
                      <div className="relative flex flex-col">
                        <label
                          htmlFor="login-email"
                          className="sr-only"
                        >
                          Email address
                        </label>

                        {emailError ? (
                          <p
                            role="alert"
                            className="text-mono-sm absolute bottom-full left-0 mb-6 text-brand"
                          >
                            {emailError}
                          </p>
                        ) : null}

                        <input
                          id="login-email"
                          type="email"
                          inputMode="email"
                          autoComplete="email"
                          value={email}
                          onChange={(event) => {
                            setEmail(event.target.value);

                            if (emailError) {
                              setEmailError('');
                            }
                          }}
                          placeholder="you@studio.com"
                          disabled={isSendingCode}
                          aria-invalid={emailError ? 'true' : 'false'}
                          className={`text-body rounded-none bg-transparent px-0 pb-16 pt-8 text-foreground placeholder:text-foreground-muted/60 transition-colors duration-(--duration-quick) ease-(--ease-expo-out) focus:outline-none disabled:opacity-50 ${
                            emailError
                              ? 'border-b border-brand'
                              : 'border-b border-foreground/20 focus:border-foreground'
                          }`}
                        />
                      </div>

                      <Button
                        type="submit"
                        theme="brand"
                        size="sm"
                        loading={isSendingCode}
                        className="w-full"
                      >
                        Continue
                      </Button>

                      <p className="text-mono-sm text-foreground-muted">
                        We'll email you a secure link to sign in instantly.
                      </p>
                    </form>

                    <div className="my-24 flex items-center gap-12">
                      <span className="h-px flex-1 bg-foreground/10" />
                      <span className="text-mono-sm text-foreground-muted">
                        Or continue with
                      </span>
                      <span className="h-px flex-1 bg-foreground/10" />
                    </div>

                    <div className="flex flex-col gap-12">
                      <OAuthButton
                        icon={<GoogleLogo className="size-16" />}
                        label="Google"
                        loading={isGoogleLoading}
                        onClick={handleGoogleLogin}
                      />
                      <OAuthButton
                        icon={<GithubLogo className="size-16" />}
                        label="GitHub"
                        loading={isGitHubLoading}
                        onClick={handleGitHubLogin}
                      />
                    </div>

                    <p className="text-mono-sm mt-24 text-foreground-muted">
                      New here? Browsing and previewing need no account. You only sign in to copy and save.{' '}
                      <NavLink
                        href="/pricing"
                        inline
                        className="text-foreground"
                      >
                        See plans
                      </NavLink>
                    </p>
                  </div>
                )}
              </div>
            </div>

            <p className="text-mono-sm text-center text-foreground-muted">
              By signing in, you agree to our{' '}
              <NavLink
                href="/terms"
                inline
                className="text-foreground"
              >
                Terms
              </NavLink>{' '}
              and{' '}
              <NavLink
                href="/privacy"
                inline
                className="text-foreground"
              >
                Privacy Policy
              </NavLink>
              .
            </p>
          </FadeIn>
        )}
      </div>

      <AuthShowcase images={images} />
    </div>
  );
}