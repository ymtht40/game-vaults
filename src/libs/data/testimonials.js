'use client';

// Variable Mapping: s -> AVATAR_SOURCES, l -> testimonials, f -> testimonials, e -> item, t -> index

import dynamic from 'next/dynamic'; // NOTE: module id: 770703
import gsap from 'gsap'; // NOTE: module id: 989970
import { useGSAP } from '@gsap/react'; // NOTE: module id: 365747
import { ScrollTrigger } from 'gsap/ScrollTrigger'; // NOTE: module id: 883495
import { t } from '@/libs/utils/i18n'; // NOTE: module id: 398682

dynamic(() => import('@/features/globe/ImageSphere'), {
  loadableGenerated: { modules: [168950] },
  ssr: false
});

gsap.registerPlugin(useGSAP, ScrollTrigger);

const AVATAR_SOURCES = [
  '/imgs/lukas_avatar.avif',
  '/imgs/edoardo_avatar.avif',
  '/imgs/matthew_avatar.avif'
];

// NOTE: module id: 967791
export const testimonials = t('common.testimonials.items').map((item, index) => ({
  ...item,
  avatarSrc: AVATAR_SOURCES[index]
}));

