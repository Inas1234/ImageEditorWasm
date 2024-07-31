import init, { blur_image, grayscale_img, resize_img } from './pkg/rustact.js';


async function main() {
    await init();
    

    const fileInput = document.getElementById('fileInput');
    const blurButton = document.getElementById('blurButton');
    const blurSlider = document.getElementById('blurSlider');
    const sliderValue = document.getElementById('sliderValue');
    const width_input = document.getElementById('widthInput');
    const height_input = document.getElementById('heightInput');
    const resize_button = document.getElementById('resizeButton');
    const crop_button = document.getElementById('cropButton');
    const grayscale_button = document.getElementById('grayButton');

    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');

    let cropping = false;
    let startX, startY, endX, endY;
    let croppedImgData = null;
    let imgData = null;

    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);
                imgData = ctx.getImageData(0, 0, img.width, img.height);
                width_input.value = img.width;
                height_input.value = img.height;
            }
            img.src = e.target.result;
        }
        reader.readAsDataURL(file);
    });


    crop_button.addEventListener('click', () => {
        cropping = true;
        canvas.style.cursor = 'crosshair';
    });


    canvas.addEventListener('mousedown', (e) => {
        if (!cropping) return;
        const rect = canvas.getBoundingClientRect();
        startX = e.clientX - rect.left;
        startY = e.clientY - rect.top;
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 2;
    });

    canvas.addEventListener('mousemove', (e) => {
        if (!cropping) return;
        if (e.buttons !== 1) return;

        const rect = canvas.getBoundingClientRect();
        endX = e.clientX - rect.left;
        endY = e.clientY - rect.top;
        ctx.putImageData(imgData, 0, 0);
        ctx.strokeRect(startX, startY, endX - startX, endY - startY);
    });

    canvas.addEventListener('mouseup', () => {
        if (!cropping) return;
        cropping = false;
        canvas.style.cursor = 'default';
        const x = Math.min(startX, endX);
        const y = Math.min(startY, endY);
        const width = Math.abs(endX - startX);
        const height = Math.abs(endY - startY);

        ctx.putImageData(imgData, 0, 0);

        croppedImgData = ctx.getImageData(x, y, width, height);
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        canvas.width = width;
        canvas.height = height;

        ctx.putImageData(croppedImgData, 0, 0);

        imgData = ctx.getImageData(0, 0, width, height);
    });


    blurSlider.addEventListener('input', () => {
        sliderValue.textContent = blurSlider.value;
    });

    blurButton.addEventListener('click', async () => {
        if (!imgData) return;
        const { data, width, height } = imgData;
        const blurAmount = parseFloat(blurSlider.value);

        try {
            const bluredData = await blur_image(new Uint8Array(data), width, height, blurAmount);

            const outputBlob = new Blob([bluredData], { type: 'image/png' });
            const imgUrl = URL.createObjectURL(outputBlob);
            const img = new Image();
            img.onload = () => {
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);
                URL.revokeObjectURL(imgUrl);
            };
            img.src = imgUrl;
        } catch (err) {
            console.error("Error blurring image:", err);
        }
    });

    resize_button.addEventListener('click', async () => {
        if (!imgData) return;
        const { data, width, height } = imgData;
        const newWidth = parseInt(width_input.value);
        const newHeight = parseInt(height_input.value);

        try {
            const resizedData = await resize_img(new Uint8Array(data), width, height, newWidth, newHeight);

            const outputBlob = new Blob([resizedData], { type: 'image/png' });
            const imgUrl = URL.createObjectURL(outputBlob);
            const img = new Image();
            img.onload = () => {
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);
                URL.revokeObjectURL(imgUrl);
                imgData = ctx.getImageData(0, 0, img.width, img.height);
            };
            img.src = imgUrl;
        } catch (err) {
            console.error("Error resizing image:", err);
        }
    });

    grayscale_button.addEventListener('click', async () => {
        if (!imgData) return;
        const {data, width, height} = imgData;
        try {
            const grayData = await grayscale_img(new Uint8Array(data), width, height);
            const outputBlob = new Blob([grayData], { type: 'image/png' });
            const imgUrl = URL.createObjectURL(outputBlob);
            const img = new Image();
            img.onload = () => {
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);
                URL.revokeObjectURL(imgUrl);
                imgData = ctx.getImageData(0, 0, img.width, img.height);
            };
            img.src = imgUrl;
        } catch (err) {
            console.error("Error grayscaling image:", err);
        }
    });

    sliderValue.textContent = blurSlider.value;
}

main();
