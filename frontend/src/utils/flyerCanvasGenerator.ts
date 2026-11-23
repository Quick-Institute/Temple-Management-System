/**
 * Pure Native HTML5 Canvas Flyer Image Generator.
 * Generates and downloads a crystal-clear high-resolution PNG image of the official
 * Dayaka Registration QR Flyer matching the exact graphic design specifications.
 * Zero external libraries required.
 */

export interface FlyerOptions {
  templeName: string;
  templeCode: string;
  qrDataUrl: string;
  directUrl: string;
  isSinhala: boolean;
}

export async function downloadFlyerImage(options: FlyerOptions): Promise<void> {
  const { templeName, templeCode, qrDataUrl, directUrl, isSinhala } = options;

  // Dimensions scaled proportionally from the official reference flyer design
  const width = 800;
  const height = 1045;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // 1. White Background
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, width, height);

  // Helper: rounded rectangle
  function roundRect(
    x: number,
    y: number,
    w: number,
    h: number,
    r: number,
    fill = true,
    stroke = true
  ) {
    if (!ctx) return;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y + r, x + r, y);
    ctx.closePath();
    if (fill) ctx.fill();
    if (stroke) ctx.stroke();
  }

  // Helper: draw SVG Golden Lotus Icon
  function drawLotusIcon(cx: number, cy: number, size: number, color: string) {
    if (!ctx) return;
    ctx.save();
    ctx.translate(cx - size / 2, cy - size / 2);
    const scale = size / 24;
    ctx.scale(scale, scale);
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.6;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const p1 = new Path2D('M12 3c1.5 3 4.5 6 7 6-2 3-5 5-7 9-2-4-5-6-7-9 2.5 0 5.5-3 7-6z');
    const p2 = new Path2D('M12 12c-1.5 2-3 3-5 3.5 1-2 2-3.5 3-5');
    const p3 = new Path2D('M12 12c1.5 2 3 3 5 3.5-1-2-2-3.5-3-5');
    const p4 = new Path2D('M12 18c0 2-1 3-2 3.5');
    const p5 = new Path2D('M12 18c0 2 1 3 2 3.5');

    ctx.stroke(p1);
    ctx.stroke(p2);
    ctx.stroke(p3);
    ctx.stroke(p4);
    ctx.stroke(p5);
    ctx.restore();
  }

  // 2. Double Border Frame
  // Outer Border (Navy #0C4A6E, lineWidth = 8)
  ctx.strokeStyle = '#0C4A6E';
  ctx.lineWidth = 8;
  roundRect(20, 20, width - 40, height - 40, 24, false, true);

  // Inner Border (Sky Blue #38BDF8, lineWidth = 2)
  ctx.strokeStyle = '#38BDF8';
  ctx.lineWidth = 2;
  roundRect(30, 30, width - 60, height - 60, 18, false, true);

  // 3. Top Header: Lotus Marks & Temple Name
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Upper tracking title with flanking Lotus icons
  ctx.font = 'bold 12px "Nirmala UI", "Segoe UI", sans-serif';
  ctx.fillStyle = '#0C4A6E';
  const upperTitle = templeName.toUpperCase();
  const titleMetrics = ctx.measureText(upperTitle);
  const textHalfW = titleMetrics.width / 2;

  drawLotusIcon(width / 2 - textHalfW - 20, 76, 18, '#0284C7');
  ctx.fillText(upperTitle, width / 2, 76);
  drawLotusIcon(width / 2 + textHalfW + 20, 76, 18, '#0284C7');

  // Main Temple Name (Serif)
  ctx.font = 'bold 30px "Playfair Display", "Cinzel", "Georgia", "Nirmala UI", serif';
  ctx.fillStyle = '#0C4A6E';
  ctx.fillText(templeName, width / 2, 126);

  // Buddhist Affairs Code Line
  const codePrefix = isSinhala
    ? 'බෞද්ධ කටයුතු දෙපාර්තමේන්තු කේතය: '
    : 'Department of Buddhist Affairs Code: ';
  ctx.font = '12.5px "Nirmala UI", "Segoe UI", sans-serif';
  const prefixMetrics = ctx.measureText(codePrefix);
  ctx.font = 'bold 13px monospace, "Nirmala UI", sans-serif';
  const valMetrics = ctx.measureText(templeCode);
  const totalCodeW = prefixMetrics.width + valMetrics.width;

  ctx.textAlign = 'left';
  ctx.font = '12.5px "Nirmala UI", "Segoe UI", sans-serif';
  ctx.fillStyle = '#0284C7';
  ctx.fillText(codePrefix, width / 2 - totalCodeW / 2, 163);

  ctx.font = 'bold 13px monospace, "Nirmala UI", sans-serif';
  ctx.fillStyle = '#0C4A6E';
  ctx.fillText(templeCode, width / 2 - totalCodeW / 2 + prefixMetrics.width, 163);

  // Horizontal Divider Line
  ctx.strokeStyle = '#BAE6FD';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(65, 198);
  ctx.lineTo(width - 65, 198);
  ctx.stroke();

  // 4. Badges & Notices
  ctx.textAlign = 'center';

  // Dark Blue Pill Badge
  ctx.fillStyle = '#0C4A6E';
  ctx.strokeStyle = '#0284C7';
  ctx.lineWidth = 1.5;
  const pillW = isSinhala ? 290 : 330;
  const pillH = 34;
  const pillY = 222;
  roundRect(width / 2 - pillW / 2, pillY, pillW, pillH, pillH / 2, true, true);

  ctx.font = 'bold 13.5px "Nirmala UI", "Segoe UI", sans-serif';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText(
    isSinhala ? 'නිල දායක ලියාපදිංචි නිවේදනය' : 'Official Dayaka Registration Notice',
    width / 2,
    pillY + pillH / 2 + 1
  );

  // Secondary Main Notice Headline
  ctx.font = 'bold 22px "Noto Serif", "Georgia", "Nirmala UI", serif';
  ctx.fillStyle = '#0C4A6E';
  ctx.fillText(
    isSinhala
      ? 'පින්වත් දායක පවුල් ලියාපදිංචි කිරීමේ නිවේදනය'
      : 'Devotee Household Registration Notice',
    width / 2,
    301
  );

  // Subtitle text (2 lines)
  ctx.font = '13px "Nirmala UI", "Segoe UI", sans-serif';
  ctx.fillStyle = '#0369A1';
  if (isSinhala) {
    ctx.fillText('විහාරස්ථානයේ දායක සභාවේ නිල ලේඛනයට ඔබගේ පවුලේ තොරතුරු', width / 2, 330);
    ctx.fillText('පහසුවෙන් ඇතුළත් කිරීමට පහත QR කේතය Scan කරන්න.', width / 2, 352);
  } else {
    ctx.fillText('Scan the QR code below with your mobile phone camera to register', width / 2, 330);
    ctx.fillText('your household in the official Dayaka registry.', width / 2, 352);
  }

  // 5. Central QR Card Container
  const qrBoxW = 370;
  const qrBoxH = 430;
  const qrBoxX = width / 2 - qrBoxW / 2;
  const qrBoxY = 398;

  // Outer Light Cyan Card
  ctx.fillStyle = '#F0F9FF';
  ctx.strokeStyle = '#7DD3FC';
  ctx.lineWidth = 2.5;
  roundRect(qrBoxX, qrBoxY, qrBoxW, qrBoxH, 22, true, true);

  // White inner box for QR
  const qrInnerW = 290;
  const qrInnerH = 290;
  const qrInnerX = width / 2 - qrInnerW / 2;
  const qrInnerY = qrBoxY + 28;

  ctx.fillStyle = '#FFFFFF';
  ctx.strokeStyle = '#BAE6FD';
  ctx.lineWidth = 1.5;
  roundRect(qrInnerX, qrInnerY, qrInnerW, qrInnerH, 16, true, true);

  // Draw Real QR Code Image inside white box
  if (qrDataUrl) {
    const qrImg = new Image();
    await new Promise<void>((resolve) => {
      qrImg.onload = () => {
        ctx.drawImage(qrImg, qrInnerX + 16, qrInnerY + 16, qrInnerW - 32, qrInnerH - 32);
        resolve();
      };
      qrImg.onerror = () => resolve();
      qrImg.src = qrDataUrl;
    });
  }

  // Text below QR inside the card
  ctx.font = 'bold 13.5px "Nirmala UI", monospace, sans-serif';
  ctx.fillStyle = '#0C4A6E';
  ctx.fillText(
    isSinhala ? 'ජංගම දුරකථනයෙන් SCAN කරන්න' : 'SCAN ME WITH PHONE CAMERA',
    width / 2,
    qrBoxY + qrBoxH - 62
  );

  ctx.font = 'bold 12px monospace, sans-serif';
  ctx.fillStyle = '#0284C7';
  ctx.fillText(directUrl || 'localhost:5173/families/add', width / 2, qrBoxY + qrBoxH - 34);

  // 6. Bottom 3 Steps Cards
  const stepCardW = 220;
  const stepCardH = 90;
  const stepY = 855;
  const stepGap = 20;
  const totalStepsW = stepCardW * 3 + stepGap * 2;
  const startX = width / 2 - totalStepsW / 2;

  const steps = isSinhala
    ? [
        { num: '1', title: 'QR එක Scan කරන්න', desc: 'දුරකථන කැමරාවෙන්' },
        { num: '2', title: 'තොරතුරු පුරවන්න', desc: 'සාමාජික නම් සහ විස්තර' },
        { num: '3', title: 'පවුල් අංකය ගන්න', desc: 'ක්ෂණික ලියාපදිංචිය' },
      ]
    : [
        { num: '1', title: 'Scan QR Code', desc: 'Use phone camera' },
        { num: '2', title: 'Fill Details', desc: 'Household information' },
        { num: '3', title: 'Get Family ID', desc: 'Instant registration' },
      ];

  steps.forEach((step, idx) => {
    const stepX = startX + idx * (stepCardW + stepGap);

    // Card background
    ctx.fillStyle = '#F0F9FF';
    ctx.strokeStyle = '#BAE6FD';
    ctx.lineWidth = 1.5;
    roundRect(stepX, stepY, stepCardW, stepCardH, 14, true, true);

    // Blue circle for number
    ctx.fillStyle = '#0284C7';
    ctx.beginPath();
    ctx.arc(stepX + stepCardW / 2, stepY + 22, 11, 0, Math.PI * 2);
    ctx.fill();

    ctx.font = 'bold 11.5px sans-serif';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(step.num, stepX + stepCardW / 2, stepY + 23);

    // Title
    ctx.font = 'bold 13px "Nirmala UI", "Segoe UI", sans-serif';
    ctx.fillStyle = '#0C4A6E';
    ctx.fillText(step.title, stepX + stepCardW / 2, stepY + 52);

    // Description
    ctx.font = '10.5px "Nirmala UI", "Segoe UI", sans-serif';
    ctx.fillStyle = '#64748B';
    ctx.fillText(step.desc, stepX + stepCardW / 2, stepY + 71);
  });

  // 7. Trigger Direct PNG Image Download
  canvas.toBlob((blob) => {
    if (!blob) return;
    const downloadUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `temple-flyer-${templeCode || 'notice'}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(downloadUrl);
  }, 'image/png');
}
