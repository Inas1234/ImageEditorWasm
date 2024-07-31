use std::io::Cursor;

use imageproc::edges;
use wasm_bindgen::prelude::*;
use image::{ ImageOutputFormat, DynamicImage, Rgba, ImageBuffer};   
use web_sys::console;

#[wasm_bindgen]
pub fn hello()  {
    console::log_1(&"Hello from Rust!".into());
}


#[wasm_bindgen]
pub fn blur_image(image_data: &[u8], width: u32, height: u32, sigma: f32) -> Vec<u8> {
    console::log_1(&"Processing image data...".into());

    let img_buffer: ImageBuffer<Rgba<u8>, Vec<u8>> = ImageBuffer::from_raw(width, height, image_data.to_vec())
        .expect("Failed to create image buffer");
    let img = DynamicImage::ImageRgba8(img_buffer);

    console::log_1(&"Image created from raw data".into());

    let blurred_img = img.blur(sigma);
    console::log_1(&"Image blurred".into());

    let mut buf = Vec::new();
    let mut cursor = Cursor::new(&mut buf);

    let _ = blurred_img.write_to(&mut cursor, ImageOutputFormat::Png);

    buf
}

#[wasm_bindgen]
pub fn resize_img(image_data: &[u8], width: u32, height: u32, new_width: u32, new_height: u32) -> Vec<u8> {
    console::log_1(&"Processing image data...".into());

    let img_buffer: ImageBuffer<Rgba<u8>, Vec<u8>> = ImageBuffer::from_raw(width, height, image_data.to_vec())
        .expect("Failed to create image buffer");
    let img = DynamicImage::ImageRgba8(img_buffer);

    console::log_1(&"Image created from raw data".into());

    let resized_img = img.resize(new_width, new_height, image::imageops::FilterType::Lanczos3);
    console::log_1(&"Image resized".into());

    let mut buf = Vec::new();
    let mut cursor = Cursor::new(&mut buf);

    let _ = resized_img.write_to(&mut cursor, ImageOutputFormat::Png);


    buf
}

#[wasm_bindgen]
pub fn grayscale_img(image_data: &[u8], width: u32, height: u32) -> Vec<u8> {
    console::log_1(&"Processing image data...".into());

    let img_buffer: ImageBuffer<Rgba<u8>, Vec<u8>> = ImageBuffer::from_raw(width, height, image_data.to_vec())
        .expect("Failed to create image buffer");
    let img = DynamicImage::ImageRgba8(img_buffer);

    console::log_1(&"Image created from raw data".into());

    let grayscale_img = img.grayscale();
    console::log_1(&"Image grayscaled".into());

    let mut buf = Vec::new();
    let mut cursor = Cursor::new(&mut buf);

    let _ = grayscale_img.write_to(&mut cursor, ImageOutputFormat::Png);


    buf
}

#[wasm_bindgen]
pub fn edge_detection(image_data: &[u8], width: u32 , height: u32, threshold: f32) -> Vec<u8>{
    console::log_1(&"Processing image data...".into());

    let img_buffer: ImageBuffer<Rgba<u8>, Vec<u8>> = ImageBuffer::from_raw(width, height, image_data.to_vec())
        .expect("Failed to create image buffer");
    let img = DynamicImage::ImageRgba8(img_buffer);

    console::log_1(&"Image created from raw data".into());

    let gray_img = img.to_luma8();
    let edges_img = edges::canny(&gray_img, threshold, threshold * 2.0);

    console::log_1(&"Image edges detected".into());

    let edge_img_rgb = DynamicImage::ImageLuma8(edges_img).to_rgb8();
    let mut buf = Vec::new();
    let mut cursor = Cursor::new(&mut buf);
    let _ = edge_img_rgb.write_to(&mut cursor, ImageOutputFormat::Png);

    buf


}
