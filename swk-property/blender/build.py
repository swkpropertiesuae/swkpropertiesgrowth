"""blender --python-less: run with the bpy venv:  python build.py <pose> <out.png> [w h samples]"""
import sys, bpy
sys.path.insert(0, __import__('os').path.dirname(__import__('os').path.abspath(__file__)))
import swk_scene as S
from cams import CAMS

def build(parts=('city', 'tower', 'interiors')):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    S.setup_render(); S.setup_world()
    if 'city' in parts: S.build_city()
    if 'tower' in parts: S.build_tower_exterior()
    if 'interiors' in parts:
        import interiors; interiors.build_interiors()
    return S.setup_camera()

if __name__ == '__main__':
    pose, out = sys.argv[1], sys.argv[2]
    w, h, spp = (int(a) for a in (sys.argv[3:6] if len(sys.argv) > 5 else (480, 270, 16)))
    parts = sys.argv[6].split(',') if len(sys.argv) > 6 else ('city', 'tower')
    cam = build(parts); S.setup_render(w, h, spp)
    p, l, f = CAMS[pose]; S.aim(cam, p, l, f)
    bpy.context.scene.render.filepath = out
    import time; t = time.time(); bpy.ops.render.render(write_still=True); print('render s', round(time.time() - t, 1))
