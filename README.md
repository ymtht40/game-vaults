project tree 
tree
.
├── README.md
├── jsconfig.json
├── next.config.mjs
├── package.json
├── postcss.config.mjs
├── public
│   ├── fonts
│   │   ├── AktivGroteskCorp-Bold.woff2
│   │   ├── AktivGroteskCorp-BoldItalic.woff2
│   │   ├── AktivGroteskCorp-Italic.woff2
│   │   ├── AktivGroteskCorp-Light.woff2
│   │   ├── AktivGroteskCorp-Medium.woff2
│   │   ├── AktivGroteskCorp-MediumItalic.woff2
│   │   ├── AktivGroteskCorp-Regular.woff2
│   │   ├── Geist-Variable.woff2
│   │   ├── GeistMono-Variable.woff2
│   │   └── ShadowsIntoLight_Regular.woff2
│   └── imgs
│       ├── apple-touch-icon.png
│       ├── edoardo_avatar.avif
│       ├── favicon.ico
│       ├── logo.png
│       ├── lukas_avatar.avif
│       ├── matthew_avatar.avif
│       └── og-image.jpg
└── src
    ├── animations
    │   ├── AnimatedHeadline.jsx
    │   ├── AnimatedList.jsx
    │   ├── AnimatedNumber.jsx
    │   ├── AnimatedReveal.jsx
    │   ├── AnimatedSubtext.jsx
    │   ├── AnimatedTabs.jsx
    │   ├── AnimatedText.jsx
    │   ├── AnimationCard.jsx
    │   ├── EaseSelect.jsx
    │   ├── FadeIn.jsx
    │   ├── PageEnterAnimation.jsx
    │   ├── RevealHeading.jsx
    │   ├── SaveAnimationButton.jsx
    │   ├── ScrambleText.jsx
    │   ├── SegmentedControl.jsx
    │   └── Switch.jsx
    ├── app
    │   ├── api
    │   │   ├── animations
    │   │   │   ├── save
    │   │   │   │   └── route.js
    │   │   │   └── view
    │   │   │       └── route.js
    │   │   ├── announcements
    │   │   │   └── route.js
    │   │   ├── attribution
    │   │   │   └── backfill
    │   │   │       └── route.js
    │   │   ├── events
    │   │   │   └── route.js
    │   │   ├── newsletter
    │   │   │   ├── profile
    │   │   │   │   └── route.js
    │   │   │   └── route.js
    │   │   ├── sandbox
    │   │   │   └── iframe
    │   │   │       └── [slug]
    │   │   │           └── route.js
    │   │   ├── starter-pack
    │   │   │   └── resend
    │   │   │       └── route.js
    │   │   └── stripe
    │   │       └── create-portal
    │   │           └── route.js
    │   ├── global-error.jsx
    │   ├── layout.jsx
    │   ├── login
    │   │   └── page.jsx
    │   ├── page.jsx
    │   ├── provider.jsx
    │   ├── robots.js
    │   └── sitemap.js
    ├── assets
    │   ├── icons
    │   │   ├── AnimatedStrokeIcon.jsx
    │   │   ├── ArrowUpRightIcon.jsx
    │   │   ├── HtmlIcon.jsx
    │   │   ├── LockIcon.jsx
    │   │   ├── ReactIcon.jsx
    │   │   └── VueIcon.jsx
    │   ├── logos
    │   │   ├── AnnnimateLogo.jsx
    │   │   ├── BodyArmorLogo.js
    │   │   ├── BrandLogo.jsx
    │   │   ├── CocaColaLogo.js
    │   │   ├── LogoIcon.jsx
    │   │   ├── LogoText.jsx
    │   │   ├── PoweradeLogo.js
    │   │   └── WkndhrsLogo.js
    │   └── styles
    │       ├── cursor.css
    │       ├── global.css
    │       ├── macc.css
    │       └── prose.css
    ├── components
    │   ├── announcements
    │   │   └── AnnouncementHost.jsx
    │   ├── layout
    │   │   ├── AppShell.jsx
    │   │   ├── LoadingScreen.jsx
    │   │   ├── ScrollerSync.jsx
    │   │   └── TransitionLayout.jsx
    │   ├── navigation
    │   │   ├── ConceptTooltipLink.jsx
    │   │   ├── NavSurface.jsx
    │   │   ├── SidebarNav.jsx
    │   │   └── TransitionLink.jsx
    │   ├── notifications
    │   │   ├── NotificationItem.jsx
    │   │   ├── NotificationsButton.jsx
    │   │   └── NotificationsDrawer.jsx
    │   ├── onboarding
    │   │   ├── OnboardingChecklist.jsx
    │   │   └── OnboardingComplete.jsx
    │   └── ui
    │       ├── Avatar.jsx
    │       ├── Badge.jsx
    │       ├── BrandMark.jsx
    │       ├── BulletPoints.jsx
    │       ├── Button.jsx
    │       ├── ConceptChip.jsx
    │       ├── FAQItem.jsx
    │       ├── GroundBackground.jsx
    │       ├── LibraryPreview.jsx
    │       ├── Loader.jsx
    │       ├── OAuthButton.jsx
    │       ├── ProvenanceChip.jsx
    │       ├── SecondaryButton.jsx
    │       ├── SlideText.jsx
    │       ├── Tooltip.jsx
    │       └── VideoLabelOverlay.jsx
    ├── contexts
    │   ├── AnimationProvider.jsx
    │   ├── CategoryProvider.jsx
    │   ├── CookieConsentProvider.jsx
    │   ├── GlobalProviders.jsx
    │   ├── LenisProvider.jsx
    │   ├── ListSizeProvider.jsx
    │   ├── NotificationProvider.jsx
    │   ├── OnboardingProvider.jsx
    │   ├── RouterTransitionProvider.jsx
    │   ├── ScrollLockProvider.jsx
    │   ├── SidebarProvider.jsx
    │   ├── ThemeProvider.jsx
    │   ├── TooltipProvider.jsx
    │   ├── TransitionRouterProvider.jsx
    │   └── UserProvider.jsx
    ├── features
    │   ├── affiliate
    │   │   ├── AffiliateEarningsCard.jsx
    │   │   └── AffiliateModal.jsx
    │   ├── animation-detil
    │   │   ├── AnimationDetailPage.jsx
    │   │   ├── components
    │   │   │   ├── AnimationDetailHeader.jsx
    │   │   │   ├── CodeAccessGate.jsx
    │   │   │   ├── FirstComponentBanner.jsx
    │   │   │   ├── InlineCodeCollapsible.jsx
    │   │   │   ├── LockedDocsCallout.jsx
    │   │   │   ├── MobileCaptureCard.jsx
    │   │   │   └── SidebarCopyActions.jsx
    │   │   ├── preview
    │   │   │   ├── AnimationPreview.jsx
    │   │   │   ├── AnimationViewTracker.jsx
    │   │   │   └── PreviewIframe.jsx
    │   │   ├── sections
    │   │   │   ├── AnimationFAQ.jsx
    │   │   │   ├── CategoryBrowseSection.jsx
    │   │   │   ├── ProvenanceSection.jsx
    │   │   │   ├── RelatedAnimationsSection.jsx
    │   │   │   ├── RequirementsSection.jsx
    │   │   │   └── TeachingSection.jsx
    │   │   └── utils
    │   │       ├── inlinePreviewAssets.js
    │   │       ├── shortcutBridgeScript.js
    │   │       ├── templateBuilder.js
    │   │       ├── timelineCaptureScript.js
    │   │       └── viewportPresets.js
    │   ├── animation-page
    │   │   ├── AnimationsLibrary.jsx
    │   │   ├── components
    │   │   │   ├── AnimationAttributes.jsx
    │   │   │   ├── AnimationTips.jsx
    │   │   │   ├── AnimationsLibraryNav.jsx
    │   │   │   ├── AttributesTable.jsx
    │   │   │   ├── FrameworkGuideLink.jsx
    │   │   │   ├── FrameworkGuides.jsx
    │   │   │   ├── LearnConceptLink.jsx
    │   │   │   ├── PresetItem.jsx
    │   │   │   ├── StaggerSegments.jsx
    │   │   │   ├── StarterPackPopup.jsx
    │   │   │   ├── TimelineRow.jsx
    │   │   │   ├── TimelineRowTooltip.jsx
    │   │   │   ├── TimelineStrip.jsx
    │   │   │   ├── TipItem.jsx
    │   │   │   ├── TipsList.jsx
    │   │   │   └── UseCaseItem.jsx
    │   │   ├── sections
    │   │   │   ├── AnimationsHero.jsx
    │   │   │   └── FAQ.jsx
    │   │   └── utils
    │   │       └── sortOptions.js
    │   ├── common
    │   │   ├── AnimationCollection.jsx
    │   │   ├── AnimationDetailNav.jsx
    │   │   ├── AnimationsFilterBar.jsx
    │   │   ├── Breadcrumb.jsx
    │   │   ├── CodeBlock.jsx
    │   │   ├── CodeViewer.jsx
    │   │   ├── ConfirmInbox.jsx
    │   │   ├── ConsentAwareAnalytics.jsx
    │   │   ├── ContentCard.jsx
    │   │   ├── CookiePreferencesModal.jsx
    │   │   ├── CopyPageButton.jsx
    │   │   ├── CustomizePanel.jsx
    │   │   ├── DescriptionList.jsx
    │   │   ├── Dialog.jsx
    │   │   ├── DocBlockRenderer.jsx
    │   │   ├── DraggableGrid.jsx
    │   │   ├── EmptyAnimationsState.jsx
    │   │   ├── EndCta.jsx
    │   │   ├── EndCtaRing.jsx
    │   │   ├── IsometricFigure.jsx
    │   │   ├── LibraryShowcaseLayout.jsx
    │   │   ├── MediaHoverReveal.jsx
    │   │   ├── PageReadyTrigger.jsx
    │   │   ├── PillContainer.jsx
    │   │   ├── PingIndicator.jsx
    │   │   ├── PlatformSwitcher.jsx
    │   │   ├── RangeSlider.jsx
    │   │   ├── Select.jsx
    │   │   └── SmoothScroll.jsx
    │   ├── demos
    │   │   ├── DocDemoLoader.jsx
    │   │   ├── EasingGraph.jsx
    │   │   ├── ScrubDemo.jsx
    │   │   ├── SplitTextReveal.jsx
    │   │   └── StaggerDemo.jsx
    │   ├── globe
    │   │   ├── Globe.jsx
    │   │   ├── ImageCard.jsx
    │   │   ├── ImageGlobe.jsx
    │   │   ├── ImageGlobeScene.jsx
    │   │   ├── ImageSphere.jsx
    │   │   ├── WebGLWarmup.jsx
    │   │   └── utils
    │   │       ├── globeDiagnostics.js
    │   │       └── loadImageBitmap.js
    │   ├── landing
    │   │   ├── BottomCTA.jsx
    │   │   ├── CircularSlider.jsx
    │   │   ├── CustomCursor.jsx
    │   │   ├── FAQSection.jsx
    │   │   ├── HeroSection.jsx
    │   │   ├── HowItWorksSection.jsx
    │   │   ├── LandingClient.jsx
    │   │   ├── LandingLogos.jsx
    │   │   ├── OneComponentSection.jsx
    │   │   ├── PricingSection.jsx
    │   │   ├── ProblemSection.jsx
    │   │   ├── RingBackground.jsx
    │   │   ├── StarterPackSection.jsx
    │   │   ├── Testimonials.jsx
    │   │   ├── TwoWaysSection.jsx
    │   │   └── ValueMath.jsx
    │   ├── newsletter
    │   │   ├── NewsletterForm.jsx
    │   │   └── StarterPackPopup.jsx
    │   ├── paywall
    │   │   ├── PaywallBlock.jsx
    │   │   └── PaywallSubscribedBlock.jsx
    │   ├── pricing
    │   │   ├── PricingCard.jsx
    │   │   ├── PricingFeatures.jsx
    │   │   ├── PricingToggle.jsx
    │   │   └── components
    │   │       ├── CheckoutButton.jsx
    │   │       ├── FeatureList.jsx
    │   │       ├── KitPrice.jsx
    │   │       └── PppLabel.jsx
    │   ├── sidebar
    │   │   ├── Sidebar.jsx
    │   │   ├── SidebarGroup.jsx
    │   │   ├── SidebarItem.jsx
    │   │   ├── SidebarMobileTrigger.jsx
    │   │   └── UserProfileDropdown.jsx
    │   └── sigin
    │       ├── AuthShowcase.jsx
    │       ├── ImageShowcase.jsx
    │       ├── SignInCodeForm.jsx
    │       └── SignInPage.jsx
    ├── hooks
    │   ├── useBreakpoint.js
    │   ├── useDualLayerScramble.js
    │   ├── useImageTextures.js
    │   ├── useInfiniteScroll.js
    │   ├── useMultilineScrambleText.js
    │   ├── usePauseOffscreenAnimations.js
    │   ├── usePppGeo.js
    │   ├── usePreviewDocument.js
    │   ├── useRevealTimeline.js
    │   ├── useSaveAnimation.js
    │   ├── useScramble.js
    │   ├── useScrollAnimation.js
    │   ├── useTransitionLinkClick.js
    │   └── useWebGLSupport.js
    └── libs
        ├── analytics
        │   ├── analytics-utils.js
        │   ├── analytics.js
        │   └── posthogAnalytics.js
        ├── auth
        │   ├── authHashErrorHandler.js
        │   ├── gameAccounts.js
        │   └── site.js
        ├── code
        │   ├── anmAttributeCatalog.js
        │   ├── anmAttributeHighlighter.js
        │   ├── anmAttributeMarks.js
        │   ├── anmBaseExtensions.js
        │   ├── anmColors.js
        │   ├── anmEditorTheme.js
        │   ├── anmHighlightStyle.js
        │   ├── anmThemeExtensions.js
        │   ├── createAnmAutocomplete.js
        │   ├── editorSetup.js
        │   ├── index.js
        │   └── parseAttributesFromJs.js
        ├── config
        │   ├── affiliate.js
        │   ├── configurables.js
        │   ├── consent.js
        │   ├── constants.js
        │   ├── discord.js
        │   ├── isRouteActive.js
        │   ├── onboarding.js
        │   ├── pricing.js
        │   ├── pricingHelpers.js
        │   ├── routeConfig.js
        │   └── stripe.js
        ├── data
        │   ├── pricing.js
        │   ├── seat-prices.js
        │   ├── stripe-prices.js
        │   └── testimonials.js
        ├── locales
        │   ├── affiliate-v3.json
        │   ├── affiliate.json
        │   ├── built-with.json
        │   ├── common.json
        │   ├── contact.json
        │   ├── faq.json
        │   ├── frameworks-v3.json
        │   ├── home-v3.json
        │   ├── kits-v3.json
        │   ├── kits.json
        │   ├── landing.json
        │   ├── packs-v3.json
        │   ├── packs.json
        │   ├── platform-v3.json
        │   ├── platform.json
        │   ├── pricing-v3.json
        │   ├── pricing.json
        │   ├── seo.json
        │   ├── starter-pack.json
        │   ├── students-v3.json
        │   ├── students.json
        │   └── whats-new.json
        ├── supabase
        │   ├── animationDetail.js
        │   ├── client.js
        │   ├── latestAnimation.js
        │   └── server.js
        └── utils
            ├── className.js
            ├── discord.js
            ├── events.js
            ├── figures.jsx
            ├── formatCode.js
            ├── formatImageUrl.js
            ├── i18n.js
            ├── loadImageBitmap.js
            ├── loadSharedImage.js
            ├── packSlugs.js
            ├── pendingRoute.js
            ├── perf.js
            ├── ppp.js
            ├── provenance.js
            ├── resolvePostAuthPath.js
            └── vendor.js