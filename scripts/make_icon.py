import os

from PIL import Image, ImageDraw, ImageFilter

SIZE = 1024
SS = 2

WHITE = (250, 250, 250)
GOLD = (201, 162, 39)
HAND_BOX = (0.410, 0.110, 0.650, 0.789)
HAND_COLOR = os.environ.get("HAND_COLOR", "white")

W_TOTAL = SIZE * SS


def extract_hand():
    src = Image.open("public/shalom3.jpg").convert("L")
    w, h = src.size
    box = tuple(int(c * (w if i % 2 == 0 else h)) for i, c in enumerate(HAND_BOX))
    hand = src.crop(box)
    hand = hand.resize((hand.width * 6, hand.height * 6), Image.LANCZOS)

    # binarize: strokes are bright, background and debris are dim
    solid = hand.point(lambda p: 255 if p > 130 else 0).convert("L")

    # remove small debris: keep only the largest connected component
    visited = set()
    best_size = 0
    best_mask = None
    width, height = solid.size
    sp = solid.load()
    for y in range(0, height, 2):
        for x in range(0, width, 2):
            if sp[x, y] == 255 and (x, y) not in visited:
                # BFS flood fill of this component
                component = []
                stack = [(x, y)]
                seen = set()
                while stack:
                    cx, cy = stack.pop()
                    if (cx, cy) in seen or sp[min(cx, width - 1), min(cy, height - 1)] != 255:
                        continue
                    seen.add((cx, cy))
                    component.append((cx, cy))
                    for nx, ny in ((cx+2, cy), (cx-2, cy), (cx, cy+2), (cx, cy-2)):
                        if 0 <= nx < width and 0 <= ny < height and (nx, ny) not in seen:
                            stack.append((nx, ny))
                visited |= seen
                if len(component) > best_size:
                    best_size = len(component)
                    best_mask = seen

    keep = Image.new("L", solid.size, 0)
    kp = keep.load()
    for (cx, cy) in best_mask:
        kp[cx, cy] = 255
        # fill the 2px sampling gaps
        for dx in range(2):
            for dy in range(2):
                if cx + dx < width and cy + dy < height:
                    kp[cx + dx, cy + dy] = 255

    # smooth the mask so strokes stay continuous
    keep = keep.filter(ImageFilter.MaxFilter(5)).filter(ImageFilter.GaussianBlur(1.5))
    # re-binarize softly for clean edges
    keep = keep.point(lambda p: 255 if p > 40 else 0)

    color = GOLD if HAND_COLOR == "gold" else WHITE
    art = Image.new("RGBA", solid.size, color + (0,))
    art.putalpha(keep)
    bbox = keep.getbbox()
    return art.crop(bbox)


def build():
    bg = Image.new("RGBA", (W_TOTAL, W_TOTAL), (5, 5, 8, 255))
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


def emit(icon, suffix=""):
    icon.save(f"app/icon{suffix}.png")
    icon.save(f"public/icon-512{suffix}.png")
    icon.resize((192, 192), Image.LANCZOS).save(f"public/icon-192{suffix}.png")
    icon.resize((180, 180), Image.LANCZOS).save(f"public/apple-touch-icon{suffix}.png")
    icon.resize((48, 48), Image.LANCZOS).save(f"public/favicon{suffix}.ico", sizes=[(16, 16), (32, 32), (48, 48)])
    icon.resize((32, 32), Image.LANCZOS).save(f"public/favicon-32{suffix}.png")
    maskable = icon.copy()
    small = icon.resize((640, 640), Image.LANCZOS)
    maskable.paste(small, (192, 192))
    maskable.save(f"public/icon-maskable-512{suffix}.png")
    maskable.resize((192, 192), Image.LANCZOS).save(f"public/icon-maskable-192{suffix}.png")


icon = build().resize((SIZE, SIZE), Image.LANCZOS)
emit(icon)
# gold variant saved alongside for comparison
gold = build()
print("done")
