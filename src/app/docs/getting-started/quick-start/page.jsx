import CopyPageButton from '@/features/docs/components/CopyPageButton';
import ContentCard from '@/features/common/ContentCard';
import CodeWalkthrough from '@/features/docs/CodeWalkthrough';
import FigurePlayground from '@/features/docs/FigurePlayground';
import InlineCode from '@/features/docs/InlineCode';
import NavLink from '@/components/navigation/NavSurface';

export const metadata = {
  title: 'Quick start | GameVault Docs',
  description:
    'Take one component from the library into a page, start to finish: where the files go, how to import it, and how to change it. React, Vue and HTML.',
};

const P = ({ children }) => (
  <p className="text-reading text-foreground-reading">{children}</p>
);

const steps = [
  {
    title: 'Install GSAP',
    body: (
      <P>
        Once per project, see{' '}
        <NavLink variant="text" href="/docs/getting-started/installation">
          Installation
        </NavLink>
        . React needs <InlineCode>gsap</InlineCode> and{' '}
        <InlineCode>@gsap/react</InlineCode>, Vue needs{' '}
        <InlineCode>gsap</InlineCode>, and plain HTML loads GSAP from a CDN.
      </P>
    ),
    files: {
      react: { file: 'Terminal', lang: 'bash', code: 'npm install gsap @gsap/react' },
      vue: { file: 'Terminal', lang: 'bash', code: 'npm install gsap' },
      html: {
        file: 'index.html',
        lang: 'html',
        code: '<script src="https://cdn.jsdelivr.net/npm/gsap/dist/gsap.min.js"></script>',
        note: "Load each plugin a component needs the same way, before the component's script.",
      },
    },
  },
  {
    title: "Copy the component's files",
    body: (
      <P>
        Open{' '}
        <NavLink variant="text" href="/animations/text-reveal">
          Text Reveal
        </NavLink>{' '}
        and expand the code under the preview. Pick your stack, then save each file under the name shown above it.
      </P>
    ),
    files: {
      react: {
        file: 'Your project',
        lang: 'bash',
        code: 'components/gamevault/text-reveal/\n  text-reveal.jsx   the component\n  text-reveal.css   its styles, imported by the component',
        note: 'The component imports its own CSS, so keep the two files side by side under those names.',
      },
      vue: {
        file: 'Your project',
        lang: 'bash',
        code: 'components/gamevault/text-reveal/\n  text-reveal.vue   the component\n  text-reveal.css   its styles',
      },
      html: {
        file: 'Your project',
        lang: 'bash',
        code: 'index.html        your page\ntext-reveal.css\ntext-reveal.js',
      },
    },
  },
  {
    title: 'Use it in a page',
    body: (
      <P>
        The Usage tab next to the files shows this for every component: the import, the markup it expects and the props in context.
      </P>
    ),
    files: {
      react: {
        file: 'app/page.jsx',
        lang: 'jsx',
        code: 'import TextReveal from "@/components/gamevault/text-reveal/text-reveal";\n\nexport default function Page() {\n  return (\n    <main>\n      <TextReveal type="words" start="top 75%" stagger={0.1}>\n        Every stride is a statement.\n      </TextReveal>\n    </main>\n  );\n}',
        note: (
          <>
            That&apos;s all. The component file starts with{' '}
            <InlineCode>&quot;use client&quot;</InlineCode> and registers ScrollTrigger and SplitText itself, so it works from a server page in the Next.js App Router. The{' '}
            <InlineCode>@/</InlineCode> path is the Next.js default alias; use a relative path if your project doesn&apos;t have one.
          </>
        ),
      },
      vue: {
        file: 'App.vue',
        lang: 'javascript',
        code: '<script setup>\nimport TextReveal from "./components/gamevault/text-reveal/text-reveal.vue";\nimport "./components/gamevault/text-reveal/text-reveal.css";\n</script>\n\n<template>\n  <TextReveal type="words" start="top 75%" :stagger="0.1">\n    Every stride is a statement.\n  </TextReveal>\n</template>',
        note: 'The component registers ScrollTrigger and SplitText itself. The second import loads its stylesheet; Vue components leave that to you, so the CSS is only loaded where you need it.',
      },
      html: {
        file: 'index.html',
        lang: 'html',
        code: '<head>\n  <link rel="stylesheet" href="text-reveal.css" />\n</head>\n<body>\n  <h2\n    class="text_reveal_text"\n    data-anm-scroll-text-reveal\n    data-anm-start="top 75%"\n    data-anm-stagger="0.1"\n  >\n    Every stride is a statement.\n  </h2>\n\n  <script src="https://cdn.jsdelivr.net/npm/gsap/dist/gsap.min.js"></script>\n  <script src="https://cdn.jsdelivr.net/npm/gsap/dist/ScrollTrigger.min.js"></script>\n  <script src="https://cdn.jsdelivr.net/npm/gsap/dist/SplitText.min.js"></script>\n  <script src="text-reveal.js"></script>\n</body>',
        note: (
          <>
            The <InlineCode>data-anm-scroll-text-reveal</InlineCode> attribute is what the script looks for. The script starts on its own once the page has loaded.
          </>
        ),
      },
    },
  },
  {
    title: 'Change one value',
    body: (
      <>
        <P>
          Slow the reveal down and space the words out. In React and Vue that&apos;s a prop, in HTML the same name as a{' '}
          <InlineCode>data-anm-*</InlineCode> attribute.
        </P>
        <div className="border-l-2 border-foreground/20 bg-foreground/[0.04] px-16 py-12">
          <p className="text-body-sm font-medium text-foreground">
            That&apos;s the whole loop.
          </p>
          <div className="text-body-sm mt-4 leading-relaxed text-foreground-reading">
            Every component works this way: copy its files, import it, render it, change a value. Each component page lets you tune its options live before you copy, and the{' '}
            <NavLink variant="text" href="/docs/guides/customization">
              Customizing a component
            </NavLink>{' '}
            guide covers the naming.
          </div>
        </div>
      </>
    ),
    files: {
      react: { file: 'app/page.jsx', lang: 'jsx', code: '<TextReveal type="words" duration={1.4} stagger={0.15}>' },
      vue: { file: 'App.vue', lang: 'javascript', code: '<TextReveal type="words" :duration="1.4" :stagger="0.15">' },
      html: {
        file: 'index.html',
        lang: 'html',
        code: '<h2 class="text_reveal_text" data-anm-scroll-text-reveal data-anm-duration="1.4" data-anm-stagger="0.15">',
      },
    },
  },
];

const troubleshooting = [
  {
    q: 'The component shows up, but without its styling.',
    a: (
      <>
        The stylesheet isn&apos;t loading. In React, <InlineCode>text-reveal.jsx</InlineCode> imports{' '}
        <InlineCode>./text-reveal.css</InlineCode>, so the CSS file has to sit next to it under exactly that name. In Vue, import the CSS yourself, where you use the component or once in{' '}
        <InlineCode>main.js</InlineCode>. In HTML, link it in <InlineCode>{'<head>'}</InlineCode>.
      </>
    ),
  },
  {
    q: 'The text never appears.',
    a: (
      <>
        Some components hide their content until GSAP takes over, so nothing flashes before the animation starts. If GSAP never runs, the content stays hidden. In HTML, check the browser console and make sure GSAP and every plugin from the component&apos;s What you&apos;ll need list load before the component&apos;s script. In React and Vue, make sure <InlineCode>gsap</InlineCode> is installed.
      </>
    ),
  },
  {
    q: 'Next.js says hooks only work in a client component.',
    a: (
      <>
        Every React component starts with <InlineCode>&quot;use client&quot;</InlineCode>. If you copied only part of the file, put that line back at the very top. Your page itself can stay a server component.
      </>
    ),
  },
  {
    q: 'Do I need containerRef, useGSAP or gsap.from?',
    a: 'No. Those are for writing an animation of your own (see Installation). An GameVault component sets up its own refs, scope and cleanup. You import it and render it.',
  },
  {
    q: 'Which plugins does a component need?',
    a: "Its page lists them under What you'll need. React and Vue components import and register their plugins for you. In plain HTML, load each one from the CDN before the component's script.",
  },
];

export default function QuickStartPage() {
  return (
    <article className="flex flex-col gap-80 pb-96 lg:gap-128">
      <header className="flex flex-col">
        <div className="flex items-center justify-between gap-16">
          <span />
          <CopyPageButton aiActions={false} />
        </div>

        <div className="mt-12 grid gap-32 lg:grid-cols-2 lg:items-start">
          <div className="flex min-w-0 flex-col">
            <h1 className="text-h2 text-foreground">Quick start.</h1>
            <p className="text-body mt-16 leading-relaxed text-foreground-reading max-w-[64ch]">
              Take one component from the library into a page, start to finish. We&apos;ll use Text Reveal, a scroll-triggered headline. It&apos;s in the free Starter Pack, so you can follow along with the real files.
            </p>
          </div>

          <div className="min-w-0">
            <FigurePlayground figure="doc-quick-start" />
          </div>
        </div>
      </header>

      <CodeWalkthrough steps={steps} />

      <div className="flex max-w-[760px] flex-col gap-80 lg:gap-128">
        <section>
          <h2
            id="if-something-looks-off"
            className="text-h3 scroll-mt-96 text-foreground"
          >
            If something looks off
          </h2>

          <dl className="mt-24 flex flex-col gap-40 lg:mt-32 lg:gap-48">
            {troubleshooting.map((item) => (
              <div key={item.q}>
                <dt className="text-reading m-0 font-medium text-foreground">{item.q}</dt>
                <dd className="text-reading m-0 mt-8 text-foreground-reading">{item.a}</dd>
              </div>
            ))}
          </dl>
        </section>

        <div className="grid grid-cols-1 gap-12 border-t border-foreground/10 pt-32 md:grid-cols-2">
          <ContentCard
            href="/docs/guides/customization"
            eyebrow="Next"
            title="Customizing a component"
            description="Props, attributes and how they're named."
            size="sm"
          />
          <ContentCard
            href="/docs/guides/production"
            eyebrow="Next"
            title="Performance and accessibility"
            description="Reduced motion and the performance budget."
            size="sm"
          />
        </div>
      </div>
    </article>
  );
}
