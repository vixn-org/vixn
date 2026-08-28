"use client";

import { usePathname } from "next/navigation";

export type BannerSize =
  | "728x90"
  | "468x60"
  | "300x250"
  | "160x600"
  | "160x300"
  | "320x50";

export const BANNER_CONFIG: Record<
  BannerSize,
  { key: string; width: number; height: number }
> = {
  "728x90": {
    key: "827ed8db1531a4f8e003702b37c5c7cb",
    width: 728,
    height: 90,
  },
  "468x60": {
    key: "8208b847eb27f6294095f5812f8f2c29",
    width: 468,
    height: 60,
  },
  "300x250": {
    key: "ce9fa3f94cb18a3c5929fc69896ff2b7",
    width: 300,
    height: 250,
  },
  "160x600": {
    key: "cbc7528b79a07fe751d3c90c319574fb",
    width: 160,
    height: 600,
  },
  "160x300": {
    key: "e0310920e05dd1d99fff6fe0c6a6a318",
    width: 160,
    height: 300,
  },
  "320x50": {
    key: "dc714e32906fb3452df6521f43692fe9",
    width: 320,
    height: 50,
  },
};

interface AdsterraBannerProps {
  size: BannerSize;
  className?: string;
  label?: boolean;
}

/**
 * Adsterra Display Banner Ad
 * Renders an isolated sandbox iframe for the chosen banner size.
 * Allows multiple simultaneous banner formats to render independently on the same page.
 */
export default function AdsterraBanner({
  size,
  className = "",
  label = false,
}: AdsterraBannerProps) {
  const pathname = usePathname();
  const config = BANNER_CONFIG[size];

  if (pathname?.startsWith("/admin")) return null;

  const iframeSrcDoc = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            display: flex;
            justify-content: center;
            align-items: center;
            background: transparent;
            overflow: hidden;
            width: ${config.width}px;
            height: ${config.height}px;
          }
        </style>
      </head>
      <body>
        <script type="text/javascript">
          atOptions = {
            'key' : '${config.key}',
            'format' : 'iframe',
            'height' : ${config.height},
            'width' : ${config.width},
            'params' : {}
          };
        </script>
        <script type="text/javascript" src="https://www.highrevenueformat.com/${config.key}/invoke.js"></script>
      </body>
    </html>
  `;

  return (
    <div
      className={`my-3 flex flex-col items-center justify-center transition-all ${className}`}
    >
      {label && (
        <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-1">
          Advertisement
        </span>
      )}
      <div
        className="flex justify-center items-center overflow-hidden"
        style={{
          width: config.width,
          height: config.height,
          maxWidth: "100%",
        }}
      >
        <iframe
          srcDoc={iframeSrcDoc}
          width={config.width}
          height={config.height}
          title={`Adsterra Ad ${size}`}
          frameBorder="0"
          scrolling="no"
          style={{
            border: "none",
            width: `${config.width}px`,
            height: `${config.height}px`,
            overflow: "hidden",
          }}
        />
      </div>
    </div>
  );
}
