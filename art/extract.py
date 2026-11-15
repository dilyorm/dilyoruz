# Recover the pixel-art grid from the upscaled character image.
from PIL import Image
import numpy as np, collections
src = np.asarray(Image.open('art/kyosan-source.png').convert('L')).astype(float)
P, OX, OY = 8.08, 6.0, 1.0
cols = int((640 - OX) // P); rows = int((640 - OY) // P)
g = np.zeros((rows, cols))
for r in range(rows):
    for c in range(cols):
        y0 = int(OY + r * P + 2); x0 = int(OX + c * P + 2)
        g[r, c] = np.median(src[y0:y0 + 4, x0:x0 + 4])
# quantize to 5 tones
levels = np.array([0, 70, 130, 190, 255])
q = levels[np.abs(g[..., None] - levels).argmin(-1)]
# background = white cells connected to the border
bg = np.zeros_like(q, bool); stack = [(r, c) for r in range(rows) for c in (0, cols - 1)] + [(r, c) for c in range(cols) for r in (0,)]
while stack:
    r, c = stack.pop()
    if 0 <= r < rows and 0 <= c < cols and not bg[r, c] and q[r, c] == 255:
        bg[r, c] = True; stack += [(r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)]
print(rows, cols)
np.save('art/grid.npy', np.where(bg, -1, q))
ys, xs = np.where(~bg); print('bbox rows', ys.min(), ys.max(), 'cols', xs.min(), xs.max())
chars = {-1: '.', 0: '#', 70: 'D', 130: 'm', 190: 'l', 255: 'W'}
out = np.where(bg, -1, q)
for r in range(ys.min(), rows):
    print(f'{r:02d} ' + ''.join(chars[int(v)] for v in out[r, xs.min():xs.max() + 1]))
