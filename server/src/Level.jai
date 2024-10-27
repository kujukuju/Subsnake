
Level :: struct {
    pixels: [] bool;
    width: int;
    height: int;
}

load_level :: () {
    using context.level;

    w: s32;
    h: s32;
    channels: s32;
    loaded_pixels := stbi_load("assets/physics.png", *w, *h, *channels, 4);

    width = w;
    height = h;

    pixels = NewArray(width * height, bool);
    
    for y: 0..h - 1 {
        for x: 0..w - 1 {
            index := y * width + x;

            pixels[index] = loaded_pixels[index * 4 + 3] > 0;
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
