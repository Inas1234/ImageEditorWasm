import init, {
  blur_image,
  grayscale_img,
  resize_img,
  edge_detection,
} from "./pkg/rustact.js";

async function main() {
  await init();

  const fileInput = document.getElementById("fileInput");
  const blurButton = document.getElementById("blurButton");
  const blurSlider = document.getElementById("blurSlider");
  const sliderValue = document.getElementById("sliderValue");
  const width_input = document.getElementById("widthInput");
  const height_input = document.getElementById("heightInput");
  const resize_button = document.getElementById("resizeButton");
  const crop_button = document.getElementById("cropButton");
  const grayscale_button = document.getElementById("grayButton");
  const download_button = document.getElementById("downloadButton");
  const file_name_input = document.getElementById("fileNameInput");
  const reset_button = document.getElementById("resetButton");
  const edge_button = document.getElementById("edgeButton");

  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");

  let cropping = false;
  let startX, startY, endX, endY;
  let croppedImgData = null;
  let imgData = null;
  let oldData = null;

  fileInput.addEventListener("change", (e) => {
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

        oldData = ctx.getImageData(0, 0, img.width, img.height);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });

  download_button.addEventListener("click", () => {
    if (!imgData) return;

    const dataURL = canvas.toDataURL("image/png");

    const a = document.createElement("a");
    a.href = dataURL;

    a.download = file_name_input.value || "edited-image.png";

    a.click();
  });

  crop_button.addEventListener("click", () => {
    cropping = true;
    canvas.style.cursor = "crosshair";
  });

  canvas.addEventListener("mousedown", (e) => {
    if (!cropping) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    startX = (e.clientX - rect.left) * scaleX;
    startY = (e.clientY - rect.top) * scaleY;
    ctx.strokeStyle = "red";
    ctx.lineWidth = 2;
  });

  canvas.addEventListener("mousemove", (e) => {
    if (!cropping) return;
    if (e.buttons !== 1) return;

    const rect = canvas.getBoundingClientRect();

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    endX = (e.clientX - rect.left) * scaleX;
    endY = (e.clientY - rect.top) * scaleY;
    ctx.putImageData(imgData, 0, 0);
    ctx.strokeRect(startX, startY, endX - startX, endY - startY);
  });

  canvas.addEventListener("mouseup", () => {
    if (!cropping) return;
    cropping = false;
    canvas.style.cursor = "default";

    const rect = canvas.getBoundingClientRect();

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

  blurSlider.addEventListener("input", () => {
    sliderValue.textContent = blurSlider.value;
  });

  blurButton.addEventListener("click", async () => {
    if (!imgData) return;
    const { data, width, height } = imgData;
    const blurAmount = parseFloat(blurSlider.value);

    try {
      const bluredData = await blur_image(
        new Uint8Array(data),
        width,
        height,
        blurAmount
      );

      const outputBlob = new Blob([bluredData], { type: "image/png" });
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

  resize_button.addEventListener("click", async () => {
    if (!imgData) return;
    const { data, width, height } = imgData;
    const newWidth = parseInt(width_input.value);
    const newHeight = parseInt(height_input.value);

    try {
      const resizedData = await resize_img(
        new Uint8Array(data),
        width,
        height,
        newWidth,
        newHeight
      );

      const outputBlob = new Blob([resizedData], { type: "image/png" });
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

  grayscale_button.addEventListener("click", async () => {
    if (!imgData) return;
    const { data, width, height } = imgData;
    try {
      const grayData = await grayscale_img(new Uint8Array(data), width, height);
      const outputBlob = new Blob([grayData], { type: "image/png" });
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

  reset_button.addEventListener("click", () => {
    if (!oldData) return;
    canvas.width = oldData.width;
    canvas.height = oldData.height;
    ctx.putImageData(oldData, 0, 0);
    imgData = ctx.getImageData(0, 0, oldData.width, oldData.height);
  });

  edge_button.addEventListener("click", async () => {
    if (!imgData) return;
    const { data, width, height } = imgData;
    try {
      const edgeData = await edge_detection(
        new Uint8Array(data),
        width,
        height,
        50
      );
      const outputBlob = new Blob([edgeData], { type: "image/png" });
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
      console.error("Error edge detection image:", err);
    }
  });

  sliderValue.textContent = blurSlider.value;
}

main();
