'use client';

// Variable Mapping: l -> AI_BG_COLOR, r -> AI_PATH_1, n -> AI_PATH_2, s -> AI_PATH_3, o -> LEGACY_BG_COLOR, i -> LEGACY_PATH_1, c -> LEGACY_PATH_2, d -> LEGACY_PATH_3, u -> LEGACY_PATH_4, m -> LegacyAvatar, y -> LegacyAvatar, f -> AVATAR_THEMES, z -> AVATAR_THEMES, h -> AvatarFallback, b -> AvatarFallback, p -> Avatar, U -> Avatar, g -> AIAvatar

import { memo, useId, useState, useEffect } from 'react';

const AI_BG_COLOR = '#8b5cf6';
const AI_PATH_1 = { color: '#06b6d4', translateX: 1, translateY: 2, rotate: 75, scale: 1.3 };
const AI_PATH_2 = { color: '#f59e0b', translateX: -2, translateY: -1, rotate: -120, scale: 1.4 };
const AI_PATH_3 = { color: '#10b981', translateX: 2, translateY: -2, rotate: 160, scale: 1.2 };

const LEGACY_BG_COLOR = '#141314';
const LEGACY_PATH_1 = { color: '#fd551d', translateX: 1, translateY: 1, rotate: 45, scale: 1.3 };
const LEGACY_PATH_2 = { color: '#fd8d68', translateX: -1, translateY: -1, rotate: -30, scale: 1.25 };
const LEGACY_PATH_3 = { color: '#fb460d', translateX: 2, translateY: -2, rotate: 120, scale: 1.15 };
const LEGACY_PATH_4 = { color: '#fd7142', translateX: -2, translateY: 2, rotate: -75, scale: 1.2 };

// NOTE: module id: 813920
export const LegacyAvatar = memo(function ({ size = 32, className = '' }) {
  const titleId = useId();
  const maskId = useId();
  const filterId = useId();

  return (
    <div
      className={`inline-flex items-center justify-center overflow-hidden select-none legacy-avatar ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 60 60"
        fill="none"
        role="img"
        aria-label="Founding Member"
        width={size}
        height={size}
      >
        <title id={titleId}>Founding Member</title>
        <mask
          id={maskId}
          maskUnits="userSpaceOnUse"
          x={0}
          y={0}
          width={60}
          height={60}
        >
          <rect width={60} height={60} rx={120} fill="#FFFFFF" />
        </mask>
        <g mask={`url(#${maskId})`}>
          <rect width={60} height={60} fill={LEGACY_BG_COLOR} />
          <path
            filter={`url(#${filterId})`}
            d="M32.414 59.35L50.376 70.5H72.5v-71H33.728L26.5 13.381l19.057 27.08L32.414 59.35z"
            fill={LEGACY_PATH_1.color}
            style={{ mixBlendMode: 'screen' }}
            transform={`
              translate(${LEGACY_PATH_1.translateX} ${LEGACY_PATH_1.translateY})
              rotate(${LEGACY_PATH_1.rotate} 30 30)
              scale(${LEGACY_PATH_1.scale})
            `}
          />
          <path
            filter={`url(#${filterId})`}
            style={{ mixBlendMode: 'multiply' }}
            d="M22.216 24L0 46.75l14.108 38.129L78 86l-3.081-59.276-22.378 4.005 12.972 20.186-23.35 27.395L22.215 24z"
            fill={LEGACY_PATH_2.color}
            transform={`
              translate(${LEGACY_PATH_2.translateX} ${LEGACY_PATH_2.translateY})
              rotate(${LEGACY_PATH_2.rotate} 30 30)
              scale(${LEGACY_PATH_2.scale})
            `}
          />
          {LEGACY_PATH_3 && (
            <path
              filter={`url(#${filterId})`}
              style={{ mixBlendMode: 'soft-light' }}
              d="M45.5 8.5L58 21v20L45.5 54.5 28 41V21l17.5-12.5z"
              fill={LEGACY_PATH_3.color}
              transform={`
                translate(${LEGACY_PATH_3.translateX} ${LEGACY_PATH_3.translateY})
                rotate(${LEGACY_PATH_3.rotate} 30 30)
                scale(${LEGACY_PATH_3.scale})
              `}
            />
          )}
          {LEGACY_PATH_4 && (
            <path
              filter={`url(#${filterId})`}
              style={{ mixBlendMode: 'overlay' }}
              d="M15 35L30 15l25 10-5 30-25 5-10-25z"
              fill={LEGACY_PATH_4.color}
              transform={`
                translate(${LEGACY_PATH_4.translateX} ${LEGACY_PATH_4.translateY})
                rotate(${LEGACY_PATH_4.rotate} 30 30)
                scale(${LEGACY_PATH_4.scale})
              `}
            />
          )}
        </g>
        <defs>
          <filter
            id={filterId}
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feFlood floodOpacity={0} result="BackgroundImageFix" />
            <feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
            <feGaussianBlur stdDeviation={7} result="effect1_foregroundBlur" />
          </filter>
        </defs>
      </svg>
    </div>
  );
});

export const AVATAR_THEMES = [
  {
    bgColor: '#E63525',
    path1: { color: '#050D4C', translateX: 2, translateY: 2, rotate: 98, scale: 1.2 },
    path2: { color: '#D4EBEE', translateX: -3, translateY: -3, rotate: -147, scale: 1.3 }
  },
  {
    bgColor: '#050D4C',
    path1: { color: '#D4EBEE', translateX: 0, translateY: 0, rotate: 76, scale: 1.2 },
    path2: { color: '#F6C750', translateX: 2, translateY: 2, rotate: 114, scale: 1.2 }
  },
  {
    bgColor: '#F6C750',
    path1: { color: '#E63525', translateX: 0, translateY: 0, rotate: -40, scale: 1.2 },
    path2: { color: '#050D4C', translateX: 0, translateY: 0, rotate: -240, scale: 1.2 }
  },
  {
    bgColor: '#D4EBEE',
    path1: { color: '#F6C750', translateX: -2, translateY: 2, rotate: -22, scale: 1.2 },
    path2: { color: '#E63525', translateX: 1, translateY: -1, rotate: 33, scale: 1.3 }
  }
];

export const AvatarFallback = memo(function ({
  name,
  avatarIndex,
  size = 40,
  className = ''
}) {
  const titleId = useId();
  const maskId = useId();
  const filterId = useId();

  if (avatarIndex === 4) {
    return <LegacyAvatar size={size} className={className} />;
  }

  let resolvedIndex = avatarIndex;
  if (resolvedIndex == null) {
    resolvedIndex =
      (function (str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
          hash = (hash << 5) - hash + str.charCodeAt(i);
          hash &= hash;
        }
        return Math.abs(hash);
      })(name || 'User') % AVATAR_THEMES.length;
  }

  const theme = AVATAR_THEMES[resolvedIndex % AVATAR_THEMES.length];

  return (
    <div
      className={`inline-flex items-center justify-center overflow-hidden select-none w-full ${className}`}
      style={{ height: size }}
    >
      <svg
        viewBox="0 0 60 60"
        fill="none"
        role="img"
        aria-label={name}
        width="100%"
        height={size}
      >
        <title id={titleId}>{name}</title>
        <mask
          id={maskId}
          maskUnits="userSpaceOnUse"
          x={0}
          y={0}
          width={60}
          height={60}
        >
          <rect width={60} height={60} rx={120} fill="#FFFFFF" />
        </mask>
        <g mask={`url(#${maskId})`}>
          <rect width={60} height={60} fill={theme.bgColor} />
          <path
            filter={`url(#${filterId})`}
            d="M32.414 59.35L50.376 70.5H72.5v-71H33.728L26.5 13.381l19.057 27.08L32.414 59.35z"
            fill={theme.path1.color}
            transform={`
              translate(${theme.path1.translateX} ${theme.path1.translateY})
              rotate(${theme.path1.rotate} 30 30)
              scale(${theme.path1.scale})
            `}
          />
          <path
            filter={`url(#${filterId})`}
            style={{ mixBlendMode: 'overlay' }}
            d="M22.216 24L0 46.75l14.108 38.129L78 86l-3.081-59.276-22.378 4.005 12.972 20.186-23.35 27.395L22.215 24z"
            fill={theme.path2.color}
            transform={`
              translate(${theme.path2.translateX} ${theme.path2.translateY})
              rotate(${theme.path2.rotate} 30 30)
              scale(${theme.path2.scale})
            `}
          />
        </g>
        <defs>
          <filter
            id={filterId}
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feFlood floodOpacity={0} result="BackgroundImageFix" />
            <feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
            <feGaussianBlur stdDeviation={7} result="effect1_foregroundBlur" />
          </filter>
        </defs>
      </svg>
    </div>
  );
});

export const Avatar = memo(function ({
  src,
  alt,
  name,
  avatarIndex,
  size = 40,
  className = ''
}) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (src) setHasError(false);
  }, [src]);

  const displayName = name || alt || 'User';
  const showFallback = !src || hasError;

  return (
    <div
      className={`relative inline-flex items-center justify-center overflow-hidden select-none rounded-full ${className}`}
      style={{ width: size, height: size }}
      title={displayName}
    >
      {showFallback ? (
        <AvatarFallback name={displayName} avatarIndex={avatarIndex} size={size} />
      ) : (
        <img
          src={src}
          alt={alt || displayName}
          onError={() => {
            setHasError(true);
          }}
          className="w-full h-full object-cover"
        />
      )}
    </div>
  );
});

const AIAvatar = memo(function ({ size = 32, className = '' }) {
  const titleId = useId();
  const maskId = useId();
  const filterId = useId();

  return (
    <div
      className={`inline-flex items-center justify-center overflow-hidden select-none w-full ${className}`}
      style={{ height: size }}
    >
      <svg
        viewBox="0 0 60 60"
        fill="none"
        role="img"
        aria-label="GameVault AI"
        width="100%"
        height={size}
      >
        <title id={titleId}>GameVault AI</title>
        <mask
          id={maskId}
          maskUnits="userSpaceOnUse"
          x={0}
          y={0}
          width={60}
          height={60}
        >
          <rect width={60} height={60} rx={120} fill="#FFFFFF" />
        </mask>
        <g mask={`url(#${maskId})`}>
          <rect width={60} height={60} fill={AI_BG_COLOR} />
          <path
            filter={`url(#${filterId})`}
            d="M32.414 59.35L50.376 70.5H72.5v-71H33.728L26.5 13.381l19.057 27.08L32.414 59.35z"
            fill={AI_PATH_1.color}
            style={{ mixBlendMode: 'multiply' }}
            transform={`
              translate(${AI_PATH_1.translateX} ${AI_PATH_1.translateY})
              rotate(${AI_PATH_1.rotate} 30 30)
              scale(${AI_PATH_1.scale})
            `}
          />
          <path
            filter={`url(#${filterId})`}
            style={{ mixBlendMode: 'screen' }}
            d="M22.216 24L0 46.75l14.108 38.129L78 86l-3.081-59.276-22.378 4.005 12.972 20.186-23.35 27.395L22.215 24z"
            fill={AI_PATH_2.color}
            transform={`
              translate(${AI_PATH_2.translateX} ${AI_PATH_2.translateY})
              rotate(${AI_PATH_2.rotate} 30 30)
              scale(${AI_PATH_2.scale})
            `}
          />
          {AI_PATH_3 && (
            <path
              filter={`url(#${filterId})`}
              style={{ mixBlendMode: 'soft-light' }}
              d="M45.5 8.5L58 21v20L45.5 54.5 28 41V21l17.5-12.5z"
              fill={AI_PATH_3.color}
              transform={`
                translate(${AI_PATH_3.translateX} ${AI_PATH_3.translateY})
                rotate(${AI_PATH_3.rotate} 30 30)
                scale(${AI_PATH_3.scale})
              `}
            />
          )}
        </g>
        <defs>
          <filter
            id={filterId}
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feFlood floodOpacity={0} result="BackgroundImageFix" />
            <feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
            <feGaussianBlur stdDeviation={7} result="effect1_foregroundBlur" />
          </filter>
        </defs>
      </svg>
    </div>
  );
});

Avatar.Fallback = AvatarFallback;
Avatar.AI = AIAvatar;
Avatar.Legacy = LegacyAvatar;

