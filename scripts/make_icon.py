import math
from PIL import Image, ImageDraw

GOLD = (201, 162, 39)
GOLD_DARK = (168, 134, 31)
BG_TOP = (30, 34, 43)
BG_BOTTOM = (14, 16, 20)
SIZE = 1024


def gradient(size):
    img = Image.new("RGB", (size, size))
    for y in range(size):
        t = y / (size - 1)
        r = int(BG_TOP[0] + (BG_BOTTOM[0] - BG_TOP[0]) * t)
        g = int(BG_TOP[1] + (BG_BOTTOM[1] - BG_TOP[1]) * t)
        b = int(BG_TOP[2] + (BG_BOTTOM[2] - BG_TOP[2]) * t)
        for x in range(0, size, 256):
            img.paste(Image.new("RGB", (min(256, size - x), 1), (r, g, b)), (x, y))
    return img


def rotate_rect(draw_img, box, radius, angle, fill):
    w = box[2] - box[0]
    h = box[3] - box[1]
    tmp = Image.new("RGBA", (w + radius * 2, h + radius * 2), (0, 0, 0, 0))
    ImageDraw.Draw(tmp).rounded_rectangle(
        (radius, radius, radius + w, radius + h), radius, fill=fill
    )
    tmp = tmp.rotate(angle, resample=Image.BICUBIC, expand=True)
    draw_img.paste(tmp, (int(box[0]) - radius, int(box[1]) - radius), tmp)


def build():
    img = gradient(SIZE).convert("RGBA")
    d = ImageDraw.Draw(img)

    # two extended fingers (index + middle, touching)
    d.rounded_rectangle((416, 170, 608, 560), radius=96, fill=GOLD)
    # crease between the two fingers, subtle, only near the tips
    d.line((512, 196, 512, 350), fill=GOLD_DARK, width=14)
    # fist (closed hand)
    d.rounded_rectangle((306, 500, 718, 790), radius=80, fill=GOLD)
    # thumb folded on the side of the fist
    rotate_rect(img, (600, 520, 718, 700), 50, -12, GOLD_DARK)
    # wrist going off the bottom edge
    d.rectangle((396, 760, 628, SIZE), fill=GOLD)
    d.rounded_rectangle((396, 700, 628, 860), radius=40, fill=GOLD)
    # thin shadow under the fist
    d.ellipse((326, 770, 698, 830), fill=(0, 0, 0, 90))

    return img.convert("RGB")


icon = build()
icon.save("app/icon.png")
icon.save("public/icon-512.png")
icon.resize((192, 192), Image.LANCZOS).save("public/icon-192.png")
icon.resize((180, 180), Image.LANCZOS).save("app/apple-icon.png")
icon.resize((32, 32), Image.LANCZOS).save("app/favicon.ico", sizes=[(16, 16), (32, 32)])

# maskable variant: artwork shrunk into the safe zone so Android can crop
# it into any shape without cutting the fingers
maskable = icon.copy()
small = icon.resize((716, 716), Image.LANCZOS)
maskable.paste(small, (154, 154))
maskable.save("public/icon-maskable-512.png")
maskable.resize((192, 192), Image.LANCZOS).save("public/icon-maskable-192.png")
print("done")
