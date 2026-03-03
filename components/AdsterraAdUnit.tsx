"use client";

import Script from "next/script";

export default function AdsterraAdUnit() {
  return (
    <div className="w-full flex justify-center">
      <div
        className="overflow-hidden"
        style={{ width: 300, height: 250 }}
        aria-label="Advertisement"
      >
        <Script id="adsterra-at-options" strategy="afterInteractive">
          {`
            window.atOptions = {
              key: '413afdb9ca2e73326f9b1a0b1eae144c',
              format: 'iframe',
              height: 250,
              width: 300,
              params: {}
            };
          `}
        </Script>
        <Script
          id="adsterra-invoke"
          strategy="afterInteractive"
          src="https://www.highperformanceformat.com/413afdb9ca2e73326f9b1a0b1eae144c/invoke.js"
        />
      </div>
    </div>
  );
}
