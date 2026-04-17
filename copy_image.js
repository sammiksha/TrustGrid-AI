const fs = require('fs');
const path = require('path');

const baseSrc = 'C:\\Users\\samik\\.gemini\\antigravity\\brain\\c1835a5a-2aaa-4328-8569-974c1348ffa8';
const images = [
    { src: 'bharat_smart_infrastructure_1776425930988.png', dest: 'bharat_hero.png' },
    { src: 'citizen_portal_bg_1776427114759.png', dest: 'citizen_portal_bg.png' },
    { src: 'gov_portal_bg_1776427146760.png', dest: 'gov_portal_bg.png' }
];

images.forEach(({ src, dest }) => {
    const sourcePath = path.join(baseSrc, src);
    const targetPath = path.join(__dirname, 'public', dest);
    if (fs.existsSync(sourcePath)) {
        fs.copyFileSync(sourcePath, targetPath);
        console.log(`Copied ${dest} successfully!`);
    } else {
        console.log(`Source image not found: ${sourcePath}`);
    }
});
