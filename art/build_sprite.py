# Build the skating sprite: crop recovered grid, add legs + sneakers, recolor, add sticker outline.
from PIL import Image
import numpy as np, sys
g = np.load('art/grid.npy')
ys, xs = np.where(g != -1)
body = g[ys.min():, xs.min():xs.max() + 1]          # rows 11..78, 33 cols
H, W = body.shape
T = {'.': -1, '#': 0, 'D': 70, 'm': 130, 'l': 190, 'W': 255}

# legs + sneakers, 33 cols wide, drawn by hand (knees slightly bent, feet apart)
EXT = """
....#DmmDmmD##D#W##DDmmmmD#D#....
....#DmmmmDD#####DDDmmmmDD#D#....
....#DDmmmmD#.....#DmmmmDDD##....
....#DmmmmDD#.....#DDmmmmDD#.....
...#DDmmmmD#.......#DmmmmDD#.....
...#DmmmmDD#.......#DDmmmmD#.....
...#DDmmmDD#.......#DmmmmDD#.....
...#DmmmmD#.........#DmmmDD#.....
..#DDmmmDD#.........#DDmmmD#.....
..#DmmmmD##.........##DmmmDD#....
..#########.........#########....
.#WWWWWWWW#.........#WWWWWWWW#...
#WWWllWWWWW#.......#WWWWWllWWW#..
#WWWWWWWWWW#.......#WWWWWWWWWW#..
#llllllllll#.......#llllllllll#..
.##########.........##########...
"""
ext = np.array([[T[ch] for ch in line] for line in EXT.strip().splitlines()])
assert ext.shape[1] == W, ext.shape
spr = np.vstack([body, ext])

variant = sys.argv[1] if len(sys.argv) > 1 else 'navy'
PAL = {
  'navy': {0: (14, 30, 91), 70: (40, 60, 132), 130: (96, 116, 181), 190: (169, 184, 220), 255: (255, 255, 255)},
  'gray': {0: (17, 17, 24), 70: (64, 66, 78), 130: (122, 125, 138), 190: (190, 193, 202), 255: (255, 255, 255)},
}[variant]

pad = 2
h, w = spr.shape
img = Image.new('RGBA', (w + pad * 2, h + pad * 2), (0, 0, 0, 0))
px = img.load()
solid = np.pad(spr != -1, pad)
# white sticker outline, 1px, 8-neighbour
for y in range(solid.shape[0]):
    for x in range(solid.shape[1]):
        if not solid[y, x] and solid[max(0, y - 1):y + 2, max(0, x - 1):x + 2].any():
            px[x, y] = (255, 255, 255, 255)
for y in range(h):
    for x in range(w):
        v = int(spr[y, x])
        if v != -1:
            px[x + pad, y + pad] = PAL[v] + (255,)
out = sys.argv[2] if len(sys.argv) > 2 else 'public/kyosan.png'
img.save(out)
img.resize((img.width * 8, img.height * 8), Image.NEAREST).save(out.replace('.png', '@8.png'))
print(img.size)
