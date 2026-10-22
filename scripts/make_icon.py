from PIL import Image, ImageDraw

SIZE = 1024
SS = 2

GOLD_TOP = (233, 199, 95)
GOLD_MID = (201, 162, 39)
BG_TOP = (35, 40, 51)
BG_BOTTOM = (14, 16, 20)
WHITE = (250, 250, 250)

# bounding box of the hand in public/shalom3.jpg (fractions of width/height)
HAND_BOX = (0.4294, 0.2693, 0.6399, 0.7300)


def gradient_img(w, h, top, bottom):
    img = Image.new("RGB", (w, h))
    dr = ImageDraw.Draw(img)
    for y in range(h):
        t = y / max(1, h - 1)
        dr.line(
            [(0, y), (w, y)],
            fill=(
                int(top[0] + (bottom[0] - top[0]) * t),
                int(top[1] + (bottom[1] - top[1]) * t),
                int(top[2] + (bottom[2] - top[2]) * t),
            ),
        )
    return img


def extract_hand():
    src = Image.open("public/shalom3.jpg").convert("L")
    w, h = src.size
    box = tuple(int(c * (w if i % 2 == 0 else h)) for i, c in enumerate(HAND_BOX))
    hand = src.crop(box)
    # upscale for smooth compositing
    hand = hand.resize((hand.width * 6, hand.height * 6), Image.LANCZOS)
    # white line art on black -> RGBA with white strokes, transparent bg
    alpha = hand.point(lambda p: 0 if p < 60 else (255 if p > 160 else int((p - 60) * 255 / 100)))
    art = Image.new("RGBA", hand.size, WHITE + (0,))
    art.putalpha(alpha)
    # trim to content
    bbox = alpha.getbbox()
    return art.crop(bbox)


def draw_shalom(d, s, y0_units, scale, color, width):
    GLYPHS = {
        'S': [((30,0),(70,0)), ((30,0),(30,60)), ((30,60),(70,60)), ((70,60),(70,120)), ((70,120),(30,120))],
        'H': [((30,0),(30,120)), ((70,0),(70,120)), ((30,60),(70,60))],
        'A': [((50,0),(10,120)), ((50,0),(90,120)), ((28,80),(72,80))],
        'L': [((30,0),(30,120)), ((30,120),(80,120))],
        'O': [((50,0),(20,20)), ((20,20),(20,100)), ((20,100),(50,120)), ((50,120),(80,100)), ((80,100),(80,20)), ((80,20),(50,0))],
        'M': [((20,120),(20,0)), ((20,0),(50,50)), ((50,50),(80,0)), ((80,0),(80,120))],
    }
    text = "SHALOM"
    total_units = 100 * len(text) + 30 * (len(text) - 1)
    x0 = (W_TOTAL - total_units * scale) // 2
    for i, ch in enumerate(text):
        gx = x0 + i * 130 * scale
        for (px1, py1), (px2, py2) in GLYPHS[ch]:
            d.line(
                (gx + px1 * scale, y0_units + py1 * scale, gx + px2 * scale, y0_units + py2 * scale),
                fill=color,
                width=width,
            )


W_TOTAL = SIZE * SS


def build():
    bg = gradient_img(W_TOTAL, W_TOTAL, BG_TOP, BG_BOTTOM).convert("RGBA")

    hand = extract_hand()
    # hand fills the icon almost entirely, centered with even margins
    target_w = int(0.86 * W_TOTAL)
    ratio = hand.height / hand.width
    target_h = int(target_w * ratio)
    if target_h > int(0.86 * W_TOTAL):
        target_h = int(0.86 * W_TOTAL)
        target_w = int(target_h / ratio)
    hand = hand.resize((target_w, target_h), Image.LANCZOS)
    hx = (W_TOTAL - target_w) // 2
    hy = (W_TOTAL - target_h) // 2
    bg.alpha_composite(hand, (hx, hy))

    d = ImageDraw.Draw(bg)

    return bg.resize((SIZE, SIZE), Image.LANCZOS).convert("RGB")


icon = build()
icon.save("app/icon.png")
icon.save("public/icon-512.png")
icon.resize((192, 192), Image.LANCZOS).save("public/icon-192.png")
icon.resize((180, 180), Image.LANCZOS).save("public/apple-touch-icon.png")
icon.resize((48, 48), Image.LANCZOS).save("public/favicon.ico", sizes=[(16, 16), (32, 32), (48, 48)])
icon.resize((32, 32), Image.LANCZOS).save("public/favicon-32.png")

maskable = icon.copy()
small = icon.resize((640, 640), Image.LANCZOS)
maskable.paste(small, (192, 192))
maskable.save("public/icon-maskable-512.png")
maskable.resize((192, 192), Image.LANCZOS).save("public/icon-maskable-192.png")
print("done")
