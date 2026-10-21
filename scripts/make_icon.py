from PIL import Image, ImageDraw, ImageFilter

SS = 4  # supersampling factor
SIZE = 1024
W = SIZE * SS

GOLD_TOP = (233, 199, 95)
GOLD_MID = (201, 162, 39)
GOLD_BOTTOM = (150, 120, 28)
GOLD_DARK = (138, 110, 26)
BG_TOP = (35, 40, 51)
BG_BOTTOM = (14, 16, 20)


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


def shape(mask_draw, fn):
    fn(mask_draw)


def build():
    bg = gradient_img(W, W, BG_TOP, BG_BOTTOM).convert("RGBA")
    gold = gradient_img(W, W, GOLD_TOP, GOLD_BOTTOM).convert("RGBA")

    mask = Image.new("L", (W, W), 0)
    md = ImageDraw.Draw(mask)

    def hand(md):
        s = SS
        # wrist
        md.rounded_rectangle((400 * s, 690 * s, 624 * s, W), radius=40 * s, fill=255)
        # fist
        md.rounded_rectangle((240 * s, 555 * s, 784 * s, 790 * s), radius=64 * s, fill=255)
        # index finger
        md.rounded_rectangle((370 * s, 185 * s, 474 * s, 560 * s), radius=52 * s, fill=255)
        # middle finger
        md.rounded_rectangle((494 * s, 155 * s, 598 * s, 560 * s), radius=52 * s, fill=255)

    shape(mask_draw=md, fn=hand)
    bg.paste(gold, (0, 0), mask)

    d = ImageDraw.Draw(bg)

    # thumb folded over the right side of the fist
    thumb = Image.new("L", (W, W), 0)
    td = ImageDraw.Draw(thumb)
    s = SS
    td.rounded_rectangle((600 * s, 540 * s, 800 * s, 790 * s), radius=70 * s, fill=255)
    thumb = thumb.filter(ImageFilter.GaussianBlur(0.4 * s))
    gold_dark = gradient_img(W, W, GOLD_MID, GOLD_DARK).convert("RGBA")
    bg.paste(gold_dark, (0, 0), thumb)

    # crease between the two fingers
    d = ImageDraw.Draw(bg)
    d.line((484 * s, 240 * s, 484 * s, 540 * s), fill=GOLD_DARK, width=9 * s)

    # knuckle lines on the fist
    for x0 in (300, 410, 520):
        d.line((x0 * s, 640 * s, (x0 + 90) * s, 640 * s), fill=GOLD_DARK, width=8 * s)

    # subtle highlight on the left edge of the fingers
    hl = Image.new("L", (W, W), 0)
    hd = ImageDraw.Draw(hl)
    hd.rounded_rectangle((374 * s, 200 * s, 392 * s, 550 * s), radius=9 * s, fill=90)
    hd.rounded_rectangle((498 * s, 170 * s, 516 * s, 550 * s), radius=9 * s, fill=90)
    bg.paste(Image.new("RGBA", (W, W), (255, 240, 180, 255)), (0, 0), hl)

    icon = bg.resize((SIZE, SIZE), Image.LANCZOS)
    return icon.convert("RGB")


icon = build()
icon.save("app/icon.png")
icon.save("public/icon-512.png")
icon.resize((192, 192), Image.LANCZOS).save("public/icon-192.png")
icon.resize((180, 180), Image.LANCZOS).save("app/apple-icon.png")
icon.resize((32, 32), Image.LANCZOS).save("app/favicon.ico", sizes=[(16, 16), (32, 32)])

maskable = icon.copy()
small = icon.resize((700, 700), Image.LANCZOS)
maskable.paste(small, (162, 162))
maskable.save("public/icon-maskable-512.png")
maskable.resize((192, 192), Image.LANCZOS).save("public/icon-maskable-192.png")
print("done")
