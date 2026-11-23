import { useState, useEffect } from 'react';
import QRCode from 'qrcode';

export interface QrCodeOptions {
  width?: number;
  margin?: number;
  color?: {
    dark?: string;
    light?: string;
  };
}

export function useQrCode(text: string, options?: QrCodeOptions) {
  const [dataUrl, setDataUrl] = useState<string>('');
  const [error, setError] = useState<Error | null>(null);

  const width = options?.width || 320;
  const margin = options?.margin ?? 2;
  const darkColor = options?.color?.dark || '#0C4A6E';
  const lightColor = options?.color?.light || '#FFFFFF';

  useEffect(() => {
    let isMounted = true;
    if (!text) return;

    QRCode.toDataURL(text, {
      width,
      margin,
      color: {
        dark: darkColor,
        light: lightColor,
      },
      errorCorrectionLevel: 'H',
    })
      .then((url) => {
        if (isMounted) setDataUrl(url);
      })
      .catch((err: Error) => {
        if (isMounted) setError(err);
      });

    return () => {
      isMounted = false;
    };
  }, [text, width, margin, darkColor, lightColor]);

  return { dataUrl: text ? dataUrl : '', error };
}
