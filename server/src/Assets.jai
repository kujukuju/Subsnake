
Image :: struct {
    pixels: [] u8;
    width: int;
    height: int;
}

load_image :: (path: *u8) -> Image {
    w: s32;
    h: s32;
    channels: s32;
    loaded_pixels := stbi_load(path, *w, *h, *channels, 4);
    defer stbi_image_free(loaded_pixels);
    assert(channels == 4, "Did not load a 4 channel image.\n");

    image: Image;
    image.width = w;
    image.height = h;
    image.pixels = NewArray(w * h * channels, u8);
    memcpy(image.pixels.data, loaded_pixels, image.pixels.count);

    return image;
}

get_pixel :: (image: Image, x: int, y: int) -> [4] u8 {
    if x < 0 || x >= image.width || y < 0 || y >= image.height {
        empty: [4] u8;
        return empty;
    }

    pixels: [] [4] u8;
    pixels.data = xx image.pixels.data;
    pixels.count = image.pixels.count / 4;

    index := y * image.width + x;
    return pixels[index];
}

snake_image: Image;
physics_image: Image;
food_image: Image;

load_assets :: () {
    snake_image = load_image("assets/wormthing.png");
    physics_image = load_image("assets/physics.png");
    food_image = load_image("assets/food.png");
}
