import { createCanvas, loadImage } from "canvas";
import { Meta } from "../interfaces/meta";
import fs from "node:fs/promises";
import path from "node:path";

export async function draw(data: Meta | null) {
  if (!data) return;

  // Preprocess data
  const username = data.meta.url.split("/")[3];
  const displayName = data.og.title.split("on Twitter")[0].trim();
  const avatarSmall = data.images[0].src.split("_normal.jpg")[0];
  const avatar = `${avatarSmall}_400x400.jpg`;
  const text = data.og.description;

  // Initiate the canvas
  const canvas = createCanvas(1200, 630);
  const ctx = canvas.getContext("2d");

  // Set the background
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, 1200, 630);

  // Draw the avatar
  await loadImage(avatar).then((image) => {
    ctx.drawImage(image, 64, 32, 96, 96);
  });

  ctx.font = "32px Sans-serif";
  ctx.fillStyle = "#222222";
  ctx.fillText(displayName, 168, 64);

  ctx.font = "24px Sans-serif";
  ctx.fillStyle = "#a0a0a0";
  ctx.fillText(`@${username}`, 168, 108);

  ctx.font = "32px Sans-serif";
  ctx.scale(1, 0.9);
  ctx.fillStyle = "#222222";
  ctx.fillText(text, 64, 192, 1072);

  ctx.font = "16px Sans-serif";
  ctx.scale(1, 1.1);
  ctx.fillStyle = "#222222";
  ctx.textAlign = "right";
  ctx.fillText(
    "Made using Spanduck with ♥",
    canvas.width - 32,
    canvas.height - 32
  );

  const fileName = Math.floor(Date.now() / 1000);
  await fs.writeFile(path.resolve(`output/${fileName}.png`), canvas.toBuffer());
}
