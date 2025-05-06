import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const sourceIcon = path.join(__dirname, '../src/assets/money.png');
const outputDir = path.join(__dirname, '../public/icons');

// Garantir que o diretório de saída existe
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Gerar ícones em diferentes tamanhos
async function generateIcons() {
  try {
    for (const size of sizes) {
      await sharp(sourceIcon)
        .resize(size, size)
        .toFile(path.join(outputDir, `icon-${size}x${size}.png`));
      console.log(`Ícone ${size}x${size} gerado com sucesso!`);
    }
  } catch (error) {
    console.error('Erro ao gerar ícones:', error);
  }
}

generateIcons(); 