
Level :: struct {
    pixels: [] bool;
    width: int;
    height: int;
}

load_level :: () {
    using context.level;

    width = physics_image.width;
    height = physics_image.height;
    pixels = NewArray(width * height, bool);
    
    for y: 0..height - 1 {
        for x: 0..width - 1 {
            pixel := get_pixel(physics_image, x, y);

            index := y * width + x;
            pixels[index] = pixel[3] > 127;
        }
    }
}

is_ground :: (x: int, y: int) -> bool {
    using context.level;

    if x < 0 || x >= width || y < 0 || y >= height {
        return true;
    }

    return pixels[y * width + x];
}
