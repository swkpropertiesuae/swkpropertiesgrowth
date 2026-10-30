"""Named camera poses (web coordinates: x right, y up, z toward street) — same as the site's director."""
from swk_scene import levelY, LEVELS
eye = lambda k: levelY(k) + (1.9 if k == 0 else 2.1)
yRoof = levelY(LEVELS)
CAMS = {
  'hero':      ((-38, 2.6, 46), (6, 70, -6), 66),
  'plaza':     ((-12, 2.1, 37), (0, 12, 0), 62),
  'lobbyDoor': ((2, 2.0, 21), (0, 2.9, -9), 58),
  'lobby':     ((5.5, 1.85, 12), (-1, 2.4, -10), 64),
  'f1': ((-4, eye(1), 26), (1, eye(1) - .3, -7), 56),
  'f2': ((4, eye(2), 26), (-1, eye(2) - .3, -6), 56),
  'f3': ((-4, eye(3), 26), (1, eye(3) - .4, -7), 56),
  'f4': ((3, eye(4), 26), (-1, eye(4) - .4, -6), 56),
  'f5': ((-3, eye(5), 26), (1, eye(5) - .4, -6), 56),
  'f6': ((0, eye(6) + .1, 25), (0, eye(6) - .2, -5), 54),
  'ascent1': ((26, levelY(14), 56), (0, levelY(20), 0), 62),
  'ascent2': ((-28, levelY(32), 50), (0, levelY(40), 0), 62),
  'roofIn': ((30, yRoof + 9, 40), (0, yRoof + 3, 0), 58),
  'roofPool': ((21, yRoof + 3.4, 19), (-2, yRoof + 1.2, -6), 64),
  'roofHeli': ((13, yRoof + 11, 17), (0, yRoof + 9.2, 0), 60),
  'lift': ((60, yRoof + 260, 210), (900, yRoof - 60, -120), 56),
  'cruise': ((3300, 1600, 800), (5000, 0, 0), 50),
}
