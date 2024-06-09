
import { pipeline } from '@xenova/transformers';
import fs from 'fs';
import path from 'path';

(async () => {
    try {
        let pipe = await pipeline('image-classification');

        // simple example:
        // const imageUrl = 'D:\\Dropbox\\Temp\\VER_NO_FINAL_DE_SEMANA\\jpg\\f125259840.jpg';
        // const result = await pipe(imageUrl);
        // console.log(result);

        const imagePath = 'D:\\Dropbox\\Temp\\VER_NO_FINAL_DE_SEMANA\\jpg\\';
        const imageList = fs.readdirSync(imagePath);
        const imageUrls = imageList
            .filter(image => fs.statSync(path.join(imagePath, image)).isFile())
            .map(image => `${imagePath}${image}`);

        const startTime = new Date().getTime();
        console.time('processoTime');

        for (let i = 0; i < imageUrls.length; i++) {
            const rootDestDir = 'D:\\Dropbox\\Temp\\VER_NO_FINAL_DE_SEMANA\\jpg\\AI\\';
            try {
                const result = await pipe(imageUrls[i]);

                let fileYearMonth = 'no_date';

                try {
                    const fileCreateDate = getMoreOldTime(imageUrls[i]);
                    fileYearMonth = fileCreateDate.getFullYear() + '-' + (fileCreateDate.getMonth() + 1).toString().padStart(2, '0');
                } catch (error) {
                    console.error(error);
                }

                let destDir = path.join(rootDestDir, `${fileYearMonth}\\unknown`);

                if (result && result.length) {
                    destDir = path.join(rootDestDir, `${fileYearMonth}\\${result[0].label}`);
                }

                fs.mkdirSync(destDir, { recursive: true });
                console.log(`copiando ${imageUrls[i]} para ${destDir}\\${imageList[i]}`);
                fs.copyFileSync(imageUrls[i], `${destDir}\\${imageList[i]}`);
                console.log('copiado');
            } catch (error) {
                console.error(error);
                destDir = path.join(rootDestDir, 'error');
                fs.mkdirSync(destDir, { recursive: true });
                console.log(`copiando ${imageUrls[i]} para ${destDir}\\${imageList[i]}`);
                fs.copyFileSync(imageUrls[i], `${destDir}\\${imageList[i]}`);
                console.log('copiado');
            }
        }

        const endTime = new Date().getTime();
        const elapsedTime = endTime - startTime;
        console.timeEnd('processoTime');
        console.log(`finalizado em ${elapsedTime} ms`);

    } catch (error) {
        console.error('Error getting file creation date:', error);
    }
})();

function getMoreOldTime(filePath) {
    const fileStat = fs.statSync(filePath);
    const dates = [fileStat.mtime, fileStat.ctime, fileStat.atime, fileStat.birthtime].filter(date => date);
    const olderDate = Math.min(...dates);
    return new Date(olderDate);
}