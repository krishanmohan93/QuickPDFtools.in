"use client";

const adMarkup = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      html, body {
        margin: 0;
        padding: 0;
        width: 300px;
        height: 250px;
        overflow: hidden;
        background: transparent;
      }
    </style>
  </head>
  <body>
    <script>
      atOptions = {
        key: '413afdb9ca2e73326f9b1a0b1eae144c',
        format: 'iframe',
        height: 250,
        width: 300,
        params: {}
      };
    </script>
    <script src="https://www.highperformanceformat.com/413afdb9ca2e73326f9b1a0b1eae144c/invoke.js"></script>
  </body>
</html>`;

export default function AdsterraAdUnit() {
  return (
    <div className="w-full flex justify-center" aria-label="Advertisement">
      <iframe
        title="Adsterra Advertisement"
        srcDoc={adMarkup}
        width={300}
        height={250}
        className="block border-0 overflow-hidden"
        sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox"
        loading="lazy"
      />
    </div>
  );
}
