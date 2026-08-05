const W = 1080;
const H = 1350;

const GREEN = "#1F9D55";
const DARK = "#0B2A1D";
const CREAM = "#FFF8EE";
const ORANGE = "#FF7A3D";

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

function newCanvas() {
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  return canvas;
}

function drawCoverImage(ctx: CanvasRenderingContext2D, img: HTMLImageElement, x: number, y: number, w: number, h: number) {
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
  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
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

function wrapLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const test = line + word + " ";
    if (ctx.measureText(test).width > maxWidth && line !== "") {
      lines.push(line.trim());
      line = word + " ";
    } else {
      line = test;
    }
  }
  if (line.trim()) lines.push(line.trim());
  return lines;
}

function drawWrappedList(
  ctx: CanvasRenderingContext2D,
  items: string[],
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  numbered: boolean
) {
  let cy = y;
  items.forEach((item, idx) => {
    const prefix = numbered ? `${idx + 1}.  ` : "•  ";
    const lines = wrapLines(ctx, prefix + item, maxWidth);
    lines.forEach((line, i) => {
      ctx.fillText(i === 0 ? line : "     " + line, x, cy);
      cy += lineHeight;
    });
    cy += 10;
  });
  return cy;
}

// Slide 1 — capa com foto + texto grifado estilo destaque
async function buildCoverSlide(recipe: Recipe, img: HTMLImageElement): Promise<HTMLCanvasElement> {
  const canvas = newCanvas();
  const ctx = canvas.getContext("2d")!;

  drawCoverImage(ctx, img, 0, 0, W, H);

  const gradient = ctx.createLinearGradient(0, 0, 0, H);
  gradient.addColorStop(0, "rgba(11,42,29,0.35)");
  gradient.addColorStop(0.55, "rgba(11,42,29,0.15)");
  gradient.addColorStop(1, "rgba(11,42,29,0.85)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, W, H);

  // tag "salva para depois"
  ctx.fillStyle = "rgba(255,255,255,0.95)";
  roundRect(ctx, 60, 70, 380, 66, 33);
  ctx.fill();
  ctx.fillStyle = DARK;
  ctx.font = "bold 30px Segoe UI, sans-serif";
  ctx.fillText("📌 SALVA PARA DEPOIS", 90, 112);

  // titulo com fundo "grifado"
  ctx.font = "bold 76px Georgia, serif";
  const words = recipe.title.split(" ");
  const lines: string[] = [];
  let line = "";
  const maxWidth = W - 140;
  for (const w of words) {
    const test = line + w + " ";
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line.trim());
      line = w + " ";
    } else {
      line = test;
    }
  }
  if (line.trim()) lines.push(line.trim());

  const lineHeight = 92;
  const startY = H - 260 - (lines.length - 1) * lineHeight;

  lines.forEach((l, i) => {
    const y = startY + i * lineHeight;
    const textWidth = ctx.measureText(l).width;
    ctx.fillStyle = ORANGE;
    roundRect(ctx, 60, y - 62, textWidth + 40, 82, 12);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.fillText(l, 80, y);
  });

  ctx.font = "38px Segoe UI, sans-serif";
  ctx.fillStyle = "#fff";
  ctx.fillText(`⏱ ${recipe.prepTime}`, 60, H - 90);

  return canvas;
}

// Slides de ingredientes / modo de preparo — card solido + foto "espiando" embaixo
async function buildCardSlide(
  recipe: Recipe,
  img: HTMLImageElement,
  heading: string,
  items: string[],
  numbered: boolean,
  page: string
): Promise<HTMLCanvasElement> {
  const canvas = newCanvas();
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = CREAM;
  ctx.fillRect(0, 0, W, H);

  // pagina
  ctx.fillStyle = DARK;
  ctx.font = "bold 28px Segoe UI, sans-serif";
  ctx.textAlign = "right";
  ctx.fillText(page, W - 60, 90);
  ctx.textAlign = "left";

  ctx.fillStyle = DARK;
  ctx.font = "bold 58px Georgia, serif";
  ctx.fillText(recipe.title, 60, 90);

  // card solido
  const cardY = 160;
  const cardH = 850;
  ctx.fillStyle = GREEN;
  roundRect(ctx, 60, cardY, W - 120, cardH, 36);
  ctx.fill();

  ctx.fillStyle = "#fff";
  ctx.font = "bold 56px Segoe UI, sans-serif";
  ctx.fillText(heading, 100, cardY + 90);

  ctx.font = "36px Segoe UI, sans-serif";
  ctx.fillStyle = "#fff";
  drawWrappedList(ctx, items, 100, cardY + 170, W - 260, 48, numbered);

  // foto "espiando" por baixo do card, centralizada
  const photoSize = 320;
  const photoX = W / 2 - photoSize / 2;
  const photoY = cardY + cardH - photoSize / 2;
  ctx.save();
  ctx.beginPath();
  ctx.arc(photoX + photoSize / 2, photoY + photoSize / 2, photoSize / 2, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();
  drawCoverImage(ctx, img, photoX, photoY, photoSize, photoSize);
  ctx.restore();

  ctx.lineWidth = 10;
  ctx.strokeStyle = CREAM;
  ctx.beginPath();
  ctx.arc(photoX + photoSize / 2, photoY + photoSize / 2, photoSize / 2, 0, Math.PI * 2);
  ctx.stroke();

  return canvas;
}

// Slide final — CTA para o app
async function buildCtaSlide(): Promise<HTMLCanvasElement> {
  const canvas = newCanvas();
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = DARK;
  ctx.fillRect(0, 0, W, H);

  ctx.textAlign = "center";
  ctx.fillStyle = "#fff";
  ctx.font = "bold 64px Georgia, serif";
  wrapCentered(ctx, "Quer mais receitas assim?", W / 2, 480, W - 160, 76);

  ctx.font = "bold 40px Segoe UI, sans-serif";
  ctx.fillStyle = ORANGE;
  wrapCentered(ctx, "📲 Baixe o app Receitas Fit — de graça", W / 2, 650, W - 200, 54);

  ctx.fillStyle = "#fff";
  roundRect(ctx, W / 2 - 280, 760, 560, 110, 55);
  ctx.fillStyle = "#fff";
  ctx.fill();
  ctx.fillStyle = DARK;
  ctx.font = "bold 42px Segoe UI, sans-serif";
  ctx.fillText("Comente RECEITA 👇", W / 2, 828);

  ctx.font = "30px Segoe UI, sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.75)";
  wrapCentered(ctx, "que eu te mando o link no direct", W / 2, 950, W - 200, 42);

  ctx.textAlign = "left";
  return canvas;
}

function wrapCentered(ctx: CanvasRenderingContext2D, text: string, cx: number, y: number, maxWidth: number, lineHeight: number) {
  const lines = wrapLines(ctx, text, maxWidth);
  let cy = y;
  for (const line of lines) {
    ctx.fillText(line, cx, cy);
    cy += lineHeight;
  }
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
    canvas: await buildCardSlide(recipe, img, "Ingredientes", recipe.ingredients, false, "2/4"),
    name: `${recipe.id}-2-ingredientes.png`,
  });
  slides.push({
    canvas: await buildCardSlide(recipe, img, "Modo de preparo", recipe.steps, true, "3/4"),
    name: `${recipe.id}-3-preparo.png`,
  });
  slides.push({ canvas: await buildCtaSlide(), name: `${recipe.id}-4-cta.png` });

  for (let i = 0; i < slides.length; i++) {
    const blob = await canvasToBlob(slides[i].canvas);
    downloadBlob(blob, slides[i].name);
    await new Promise((r) => setTimeout(r, 400));
  }
}
