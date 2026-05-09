const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const imagesDir = path.join(__dirname, '..', 'images');

async function convertToWebp(inputPath) {
    const outputPath = inputPath.replace(/\.(jpeg|jpg|png)$/i, '.webp');

    try {
        await sharp(inputPath)
            .webp({ quality: 85 })
            .toFile(outputPath);

        const oldSize = fs.statSync(inputPath).size;
        const newSize = fs.statSync(outputPath).size;
        const savings = Math.round((1 - newSize / oldSize) * 100);

        console.log(`✓ ${path.basename(inputPath)} → ${path.basename(outputPath)} (${savings}% smaller)`);
        return { inputPath, outputPath, oldSize, newSize };
    } catch (err) {
        console.error(`✗ Error converting ${inputPath}:`, err.message);
        return null;
    }
}

async function findImages(dir) {
    const images = [];
    const items = fs.readdirSync(dir);

    for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            images.push(...await findImages(fullPath));
        } else if (/\.(jpeg|jpg|png)$/i.test(item)) {
            images.push(fullPath);
        }
    }

    return images;
}

async function main() {
    console.log('Finding images to convert...\n');

    const images = await findImages(imagesDir);
    console.log(`Found ${images.length} images to convert\n`);

    let totalOldSize = 0;
    let totalNewSize = 0;

    for (const img of images) {
        const result = await convertToWebp(img);
        if (result) {
            totalOldSize += result.oldSize;
            totalNewSize += result.newSize;
        }
    }

    const totalSavings = Math.round((1 - totalNewSize / totalOldSize) * 100);
    console.log(`\n✓ Done! Total savings: ${totalSavings}% (${Math.round(totalOldSize/1024)}KB → ${Math.round(totalNewSize/1024)}KB)`);
}

main().catch(console.error);
