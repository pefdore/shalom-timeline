from PIL import Image, ImageDraw

SS = 4  # supersampling
SIZE = 1024
W = SIZE * SS

BLACK = (8, 8, 10)
WHITE = (245, 245, 245)
GREY = (180, 180, 180)


def build():
    img = Image.new("RGB", (W, W), BLACK)
    d = ImageDraw.Draw(img)
    s = SS

    # circular badge: outer ring + thin inner ring
    cx = cy = W // 2
    R = int(462 * s)
    d.ellipse((cx - R, cy - R, cx + R, cy + R), outline=WHITE, width=int(18 * s))
    R2 = int(400 * s)
    d.ellipse((cx - R2, cy - R2, cx + R2, cy + R2), outline=WHITE, width=int(6 * s))

    # decorative dots around the ring (stars of the original badge)
    import math
    for i in range(24):
        a = 2 * math.pi * i / 24
        x1 = cx + (R - int(40 * s)) * math.cos(a)
        y1 = cy + (R - int(40 * s)) * math.sin(a)
        r = int(7 * s)
        d.ellipse((x1 - r, y1 - r, x1 + r, y1 + r), fill=WHITE)

    lw = int(34 * s)  # main stroke width

    def hand(d):
        # two joined fingers (index + middle), drawn as outline
        # outer contour of fingers + fist, single path style:
        # fingers block
        fx0, fx1 = 400 * s, 624 * s
        fy_top, fy_bot = 250 * s, 560 * s
        d.rounded_rectangle(
            (fx0, fy_top, fx1, fy_bot), radius=int(60 * s), outline=WHITE, width=lw
        )
        # fist block, slightly wider
        bx0, bx1 = 340 * s, 684 * s
        by_top, by_bot = 560 * s, 764 * s
        d.rounded_rectangle(
            (bx0, by_top, bx1, by_bot), radius=int(50 * s), outline=WHITE, width=lw
        )
        # wrist stub
        d.rounded_rectangle(
            (440 * s, 764 * s, 584 * s, 830 * s), radius=int(24 * s), outline=WHITE, width=lw
        )
        # separator line between the two joined fingers
        d.line((512 * s, fy_top + int(70 * s), 512 * s, fy_bot), fill=WHITE, width=int(20 * s))
        # knuckle lines on the fist
        for kx in (420, 530):
            d.line((kx * s, 640 * s, (kx + 60) * s, 640 * s), fill=WHITE, width=int(20 * s))
        # folded thumb hint on the fist
        d.arc((600 * s, 580 * s, 690 * s, 700 * s), start=90, end=200, fill=WHITE, width=int(20 * s))

    hand(d)

    # "SHALOM" wordmark drawn as vector strokes (no font dependency)
    # each glyph on a 100x140 grid, stroke ~26, letterspaced
    GLYPHS = {
        'S': [((30,0),(70,0)), ((30,0),(30,60)), ((30,60),(70,60)), ((70,60),(70,120)), ((70,120),(30,120))],
        'H': [((30,0),(30,120)), ((70,0),(70,120)), ((30,60),(70,60))],
        'A': [((50,0),(10,120)), ((50,0),(90,120)), ((28,80),(72,80))],
        'L': [((30,0),(30,120)), ((30,120),(80,120))],
        'O': [((50,0),(20,20)), ((20,20),(20,100)), ((20,100),(50,120)), ((50,120),(80,100)), ((80,100),(80,20)), ((80,20),(50,0))],
        'M': [((20,120),(20,0)), ((20,0),(50,50)), ((50,50),(80,0)), ((80,0),(80,120))],
    }
    text = "SHALOM"
    gs = int(0.9 * s)  # glyph unit
    stroke = int(26 * gs / 100 * 100)  # ~26 units
    total_w = sum(100 for _ in text) + 30 * (len(text) - 1)
    scale = gs
    x0 = (W - total_w * scale) // 2
    y0 = int(808 * s)
    for i, ch in enumerate(text):
        gx = x0 + i * 130 * scale
        for (px1, py1), (px2, py2) in GLYPHS[ch]:
            d.line(
                (gx + px1 * scale, y0 + py1 * scale, gx + px2 * scale, y0 + py2 * scale),
                fill=WHITE,
                width=int(13 * s),
            )

    return img.resize((SIZE, SIZE), Image.LANCZOS)


icon = build()
icon.save("app/icon.png")
icon.save("public/icon-512.png")
icon.resize((192, 192), Image.LANCZOS).save("public/icon-192.png")
icon.resize((180, 180), Image.LANCZOS).save("public/apple-touch-icon.png")
icon.resize((32, 32), Image.LANCZOS).save("public/favicon.ico", sizes=[(16, 16), (32, 32)])
icon.resize((48, 48), Image.LANCZOS).save("public/favicon-32.png", sizes=[(32, 32), (48, 48)])

maskable = icon.copy()
small = icon.resize((730, 730), Image.LANCZOS)
maskable.paste(small, (147, 147))
maskable.save("public/icon-maskable-512.png")
maskable.resize((192, 192), Image.LANCZOS).save("public/icon-maskable-192.png")
print("done")
