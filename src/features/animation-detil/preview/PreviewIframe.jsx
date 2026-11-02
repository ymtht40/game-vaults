
export default function PreviewIframe({
  srcdoc,
  src,
  reloadKey,
  title,
  renderWidth,
  scale,
  stageHeight,
}) {
  return (
    <div
      style={{
        width: renderWidth * scale,
        height: stageHeight,
        flexShrink: 0,
      }}
    >
      <div
        style={{
          width: renderWidth,
          height: stageHeight / scale,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
        }}
      >
        <iframe
          key={reloadKey}
          {...(src ? { src } : { srcDoc: srcdoc })}
          title={title}
          sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox"
          style={{
            width: '100%',
            height: '100%',
            border: 0,
            display: 'block',
          }}
        />
      </div>
    </div>
  );
}

