const W = 1080;
const H = 1350;

type Recipe = {
  id: string;
  title: string;
  image: string;
  prepTime: string;
  ingredients: string[];
  steps: string[];
};

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function drawCoverImage(ctx: CanvasRenderingContext2D, img: HTMLImageElement, w: number, h: number) {
  const imgRatio = img.width / img.height;
  const targetRatio = w / h;
  let sx = 0, sy = 0, sw = img.width, sh = img.height;

  if (imgRatio > targetRatio) {
    sw = img.height * targetRatio;
    sx = (img.width - sw) / 2;
  } else {
    sh = img.width / targetRatio;
    sy = (img.height - sh) / 2;
  }
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, w, h);
}

function drawBlurredBackground(ctx: CanvasRenderingContext2D, img: HTMLImageElement) {
  ctx.save();
  ctx.filter = "blur(28px)";
  drawCoverImage(ctx, img, W, H);
  ctx.restore();
  ctx.fillStyle = "rgba(11, 42, 29, 0.55)";
  ctx.fillRect(0, 0, W, H);
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
) {
  const words = text.split(" ");
  let line = "";
  let currentY = y;

  for (const word of words) {
    const testLine = line + word + " ";
    if (ctx.measureText(testLine).width > maxWidth && line !== "") {
      ctx.fillText(line.trim(), x, currentY);
      line = word + " ";
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line.trim(), x, currentY);
  return currentY + lineHeight;
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

async function buildCoverSlide(recipe: Recipe, img: HTMLImageElement): Promise<HTMLCanvasElement> {
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  drawCoverImage(ctx, img, W, H);

  const gradient = ctx.createLinearGradient(0, H * 0.35, 0, H);
  gradient.addColorStop(0, "rgba(11,42,29,0)");
  gradient.addColorStop(1, "rgba(11,42,29,0.92)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = "#1F9D55";
  roundRect(ctx, 60, 70, 320, 64, 32);
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.font = "bold 32px Segoe UI, sans-serif";
  ctx.fillText("RECEITAS FIT", 90, 112);

  ctx.fillStyle = "#fff";
  ctx.font = "bold 64px Segoe UI, sans-serif";
  wrapText(ctx, recipe.title, 60, H - 260, W - 120, 74);

  ctx.font = "38px Segoe UI, sans-serif";
  ctx.fillStyle = "#FF7A3D";
  ctx.fillText(`⏱ ${recipe.prepTime}`, 60, H - 90);

  return canvas;
}

async function buildListSlide(
  recipe: Recipe,
  img: HTMLImageElement,
  heading: string,
  items: string[],
  numbered: boolean
): Promise<HTMLCanvasElement> {
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  drawBlurredBackground(ctx, img);

  const cardX = 60;
  const cardY = 140;
  const cardW = W - 120;
  const cardH = H - 280;
  ctx.fillStyle = "rgba(255,248,238,0.97)";
  roundRect(ctx, cardX, cardY, cardW, cardH, 32);
  ctx.fill();

  ctx.fillStyle = "#0B2A1D";
  ctx.font = "bold 52px Segoe UI, sans-serif";
  ctx.fillText(heading, cardX + 50, cardY + 90);

  ctx.font = "34px Segoe UI, sans-serif";
  ctx.fillStyle = "#0B2A1D";
  let y = cardY + 170;
  const maxWidth = cardW - 100;

  items.forEach((item, idx) => {
    const prefix = numbered ? `${idx + 1}. ` : "• ";
    y = wrapText(ctx, prefix + item, cardX + 50, y, maxWidth, 46);
    y += 14;
  });

  ctx.fillStyle = "#1F9D55";
  ctx.font = "bold 30px Segoe UI, sans-serif";
  ctx.fillText(recipe.title, cardX + 50, cardY + cardH - 30);

  return canvas;
}

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Falha ao gerar imagem"));
    }, "image/png");
  });
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export async function generateAndDownloadCarousel(recipe: Recipe) {
  const img = await loadImage(recipe.image);

  const slides: { canvas: HTMLCanvasElement; name: string }[] = [];

  slides.push({ canvas: await buildCoverSlide(recipe, img), name: `${recipe.id}-1-capa.png` });
  slides.push({
    canvas: await buildListSlide(recipe, img, "Ingredientes", recipe.ingredients, false),
    name: `${recipe.id}-2-ingredientes.png`,
  });
  slides.push({
    canvas: await buildListSlide(recipe, img, "Modo de preparo", recipe.steps, true),
    name: `${recipe.id}-3-preparo.png`,
  });

  for (let i = 0; i < slides.length; i++) {
    const blob = await canvasToBlob(slides[i].canvas);
    downloadBlob(blob, slides[i].name);
    await new Promise((r) => setTimeout(r, 400));
  }
}
