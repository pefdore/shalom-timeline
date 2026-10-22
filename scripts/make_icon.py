import os

from PIL import Image, ImageFilter

SIZE = 1024
SS = 2

WHITE = (250, 250, 250)
GOLD = (201, 162, 39)
HAND_BOX = (0.410, 0.110, 0.650, 0.789)
HAND_COLOR = os.environ.get("HAND_COLOR", "white")

W_TOTAL = SIZE * SS
MIN_COMPONENT = 900  # px at extraction scale; debris is far smaller


def extract_hand():
    src = Image.open("public/shalom3.jpg").convert("L")
    w, h = src.size
    box = tuple(int(c * (w if i % 2 == 0 else h)) for i, c in enumerate(HAND_BOX))
    hand = src.crop(box)
    hand = hand.resize((hand.width * 3, hand.height * 3), Image.LANCZOS)

    # original alpha extraction: keeps the drawing's shading and anti-aliasing
    alpha = hand.point(lambda p: 0 if p < 60 else (255 if p > 160 else int((p - 60) * 255 / 100)))

    # binary map to find debris components
    width, height = alpha.size
    binary = alpha.point(lambda p: 255 if p > 90 else 0)
    bp = binary.load()
    visited = bytearray(width * height)
    keep = Image.new("L", alpha.size, 0)
    kp = keep.load()
    for y in range(height):
        base = y * width
        for x in range(width):
            if not visited[base + x] and bp[x, y] == 255:
                # flood fill this component
                stack = [x + base]
                comp = []
                while stack:
                    idx = stack.pop()
                    if visited[idx]:
                        continue
                    visited[idx] = 1
                    if bp[idx % width, idx // width] != 255:
                        continue
                    comp.append(idx)
                    ix = idx % width
                    iy = idx // width
                    if ix > 0:
                        stack.append(idx - 1)
                    if ix < width - 1:
                        stack.append(idx + 1)
                    if iy > 0:
                        stack.append(idx - width)
                    if iy < height - 1:
                        stack.append(idx + width)
                if len(comp) >= MIN_COMPONENT:
                    for idx in comp:
                        kp[idx % width, idx // width] = 255

    # grow the kept zones slightly so stroke edges stay full
    keep = keep.filter(ImageFilter.MaxFilter(3))
    alpha = Image.composite(alpha, Image.new("L", alpha.size, 0), keep)

    color = GOLD if HAND_COLOR == "gold" else WHITE
    art = Image.new("RGBA", alpha.size, color + (0,))
    art.putalpha(alpha)
    bbox = alpha.getbbox()
    return art.crop(bbox)


def build():
    bg = Image.new("RGBA", (W_TOTAL, W_TOTAL), (0, 0, 0, 255))
    hand = extract_hand()
    target_w = int(0.80 * W_TOTAL)
    ratio = hand.height / hand.width
    target_h = int(target_w * ratio)
    if target_h > int(0.86 * W_TOTAL):
        target_h = int(0.86 * W_TOTAL)
        target_w = int(target_h / ratio)
    hand = hand.resize((target_w, target_h), Image.LANCZOS)
    hx = (W_TOTAL - target_w) // 2
    hy = (W_TOTAL - target_h) // 2
    bg.alpha_composite(hand, (hx, hy))
    return bg.convert("RGB")


def emit(icon):
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


icon = build().resize((SIZE, SIZE), Image.LANCZOS)
emit(icon)
print("done")
