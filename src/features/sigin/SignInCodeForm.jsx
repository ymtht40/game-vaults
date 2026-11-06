'use client';

import { useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';

import Button from '@/components/ui/Button'; // module id: 687989

function isValidCode(code) {
  return /^\d{6}$/.test(code);
}

export default function SignInCodeForm({ onVerify }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const inputRef = useRef(null);
  const digitRefs = useRef([]);
  const previousLengthRef = useRef(0);

  useLayoutEffect(() => {
    const previousLength = previousLengthRef.current;

    previousLengthRef.current = code.length;

    if (code.length <= previousLength) {
      return;
    }

    for (
      let digitIndex = previousLength;
      digitIndex < code.length;
      digitIndex++
    ) {
      const digitElement = digitRefs.current[digitIndex];

      if (digitElement) {
        gsap.fromTo(
          digitElement,
          {
            y: 14,
            autoAlpha: 0,
            scale: 0.85,
          },
          {
            y: 0,
            autoAlpha: 1,
            scale: 1,
            duration: 0.5,
            ease: 'expo.out',
            delay: (digitIndex - previousLength) * 0.05,
            overwrite: true,
          },
        );
      }
    }
  }, [code]);

  const moveCaretToEnd = () => {
    const input = inputRef.current;

    if (input) {
      input.setSelectionRange(input.value.length, input.value.length);
    }
  };

  const verifyCode = async (verificationCode) => {
    if (!isVerifying) {
      setError('');
      setIsVerifying(true);

      try {
        await onVerify(verificationCode);
        setIsVerified(true);
      } catch (verificationError) {
        console.error('Code verification error:', verificationError);
        setError(
          "That code didn't work. It may have expired, request a new code below.",
        );
        setIsVerifying(false);
      }
    }
  };

  if (isVerified) {
    return (
      <div className="border-t border-foreground/10 pt-16">
        <p role="status" className="text-body-sm text-foreground">
          Signed in. One moment, taking you to GameVault.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();

        if (isValidCode(code)) {
          verifyCode(code);
        } else {
          setError('Enter the 6-digit code from the email.');
        }
      }}
      noValidate
      className="flex flex-col gap-12 border-t border-foreground/10 pt-16"
    >
      <label
        htmlFor="signin-code"
        className="text-body-sm text-foreground-muted"
      >
        Enter the 6-digit code from the email.
      </label>

      {error ? (
        <p role="alert" className="text-mono-sm text-brand">
          {error}
        </p>
      ) : null}

      <div className="flex items-stretch gap-12">
        <div
          className={`relative min-w-0 flex-1 ${isVerifying ? 'opacity-50' : ''}`}
        >
          <div
            aria-hidden="true"
            className="grid h-48 grid-cols-6 gap-6"
          >
            {Array.from({ length: 6 }, (_, digitIndex) => (
              <div
                key={digitIndex}
                className={`flex items-center justify-center overflow-hidden border bg-transparent transition-colors duration-(--duration-quick) ease-(--ease-expo-out) ${
                  error
                    ? 'border-brand'
                    : isFocused &&
                        digitIndex === code.length &&
                        !isVerifying
                      ? 'border-foreground'
                      : 'border-foreground/20'
                }`}
              >
                <span
                  ref={(element) => {
                    digitRefs.current[digitIndex] = element;
                  }}
                  className={`font-mono text-[20px] ${
                    code[digitIndex]
                      ? 'text-foreground'
                      : 'text-foreground-muted/40'
                  }`}
                >
                  {code[digitIndex] || '0'}
                </span>
              </div>
            ))}
          </div>

          <input
            ref={inputRef}
            id="signin-code"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            value={code}
            onChange={(event) => {
              const nextCode = String(event.target.value || '')
                .replace(/\D/g, '')
                .slice(0, 6);

              setCode(nextCode);

              if (error) {
                setError('');
              }

              if (isValidCode(nextCode)) {
                verifyCode(nextCode);
              }
            }}
            onFocus={() => {
              setIsFocused(true);
              requestAnimationFrame(moveCaretToEnd);
            }}
            onBlur={() => setIsFocused(false)}
            onSelect={moveCaretToEnd}
            disabled={isVerifying}
            maxLength={6}
            aria-invalid={error ? 'true' : 'false'}
            className="absolute inset-0 size-full cursor-text opacity-0"
          />
        </div>

        <Button
          type="submit"
          theme="surface"
          size="sm"
          loading={isVerifying}
          disabled={code.length < 6}
        >
          Sign in
        </Button>
      </div>
    </form>
  );
}