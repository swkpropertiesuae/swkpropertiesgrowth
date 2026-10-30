"""SWK Property — Blender (Cycles) scene.

Coordinates are authored in the same space as the web prototype (x right, y up, z toward the
street, tower faces +z) and converted to Blender (Z-up) by `P()`. Units are metres.
"""
import bpy, bmesh, math, os, random
from mathutils import Vector, Matrix, Euler

HERE = os.path.dirname(os.path.abspath(__file__))
TEX = os.path.join(HERE, 'tex')
FH, H0, LEVELS, W, D = 4.4, 7.0, 50, 38.0, 30.0
HW, HD = W / 2, D / 2
OPEN = 6
ROAD = dict(aZ0=49.5, aZ1=67.5, bZ0=74.5, bZ1=92.5, mid=71.0)
R = random.Random(11)


def levelY(k): return 0.0 if k <= 0 else H0 + (k - 1) * FH
def levelH(k): return H0 if k == 0 else FH
def P(x, y, z): return Vector((x, -z, y))


# ------------------------------------------------------------------ materials
_img = {}
def image(name, srgb=True):
    if name not in _img:
        im = bpy.data.images.load(os.path.join(TEX, name), check_existing=True)
        im.colorspace_settings.name = 'sRGB' if srgb else 'Non-Color'
        _img[name] = im
    return _img[name]


def new_mat(name):
    m = bpy.data.materials.new(name); m.use_nodes = True
    n = m.node_tree.nodes; n.clear()
    out = n.new('ShaderNodeOutputMaterial'); bsdf = n.new('ShaderNodeBsdfPrincipled')
    m.node_tree.links.new(bsdf.outputs[0], out.inputs[0])
    return m, bsdf


def setin(bsdf, **kw):
    for k, v in kw.items():
        key = k.replace('_', ' ')
        if key in bsdf.inputs: bsdf.inputs[key].default_value = v


_mats = {}
def pbr(name, color=(.8, .8, .8), rough=.5, metal=0.0, **kw):
    if name in _mats: return _mats[name]
    m, b = new_mat(name); setin(b, Base_Color=(*color, 1), Roughness=rough, Metallic=metal, **kw); _mats[name] = m; return m


def emit(name, color=(1, .85, .6), strength=5.0):
    if name in _mats: return _mats[name]
    m = bpy.data.materials.new(name); m.use_nodes = True; n = m.node_tree.nodes; n.clear()
    e = n.new('ShaderNodeEmission'); e.inputs[0].default_value = (*color, 1); e.inputs[1].default_value = strength
    o = n.new('ShaderNodeOutputMaterial'); m.node_tree.links.new(e.outputs[0], o.inputs[0]); _mats[name] = m; return m


def tex_mat(name, img, rough=.4, metal=0.0, tile=(4, 4), clearcoat=0.0):
    """UV-mapped image material; `tile` = metres per repeat on U,V."""
    if name in _mats: return _mats[name]
    m, b = new_mat(name); t = m.node_tree; n = t.nodes
    tc = n.new('ShaderNodeTexCoord'); mp = n.new('ShaderNodeMapping'); mp.inputs['Scale'].default_value = (1 / tile[0], 1 / tile[1], 1)
    it = n.new('ShaderNodeTexImage'); it.image = image(img); it.interpolation = 'Smart'
    t.links.new(tc.outputs['Object'], mp.inputs[0]); t.links.new(mp.outputs[0], it.inputs[0]); it.projection = 'BOX'; it.projection_blend = 0.0
    t.links.new(it.outputs[0], b.inputs['Base Color']); setin(b, Roughness=rough, Metallic=metal, Coat_Weight=clearcoat)
    _mats[name] = m; return m


def facade_mat(name, base, em, tile=(16, 29), rough=.12, metal=.55, emit_strength=3.0, random_off=True):
    """Curtain wall: dark glass + lit windows (emission), box-projected in object space."""
    if name in _mats: return _mats[name]
    m, b = new_mat(name); t = m.node_tree; n = t.nodes
    tc = n.new('ShaderNodeTexCoord'); oi = n.new('ShaderNodeObjectInfo')
    add = n.new('ShaderNodeVectorMath'); add.operation = 'ADD'
    mul = n.new('ShaderNodeVectorMath'); mul.operation = 'SCALE'; mul.inputs['Scale'].default_value = 23.0 if random_off else 0.0
    t.links.new(oi.outputs['Random'], mul.inputs[0]) if False else None
    comb = n.new('ShaderNodeCombineXYZ'); t.links.new(oi.outputs['Random'], comb.inputs[0]); t.links.new(oi.outputs['Random'], comb.inputs[2])
    t.links.new(comb.outputs[0], mul.inputs[0])
    t.links.new(tc.outputs['Object'], add.inputs[0]); t.links.new(mul.outputs[0], add.inputs[1])
    mp = n.new('ShaderNodeMapping'); mp.inputs['Scale'].default_value = (1 / tile[0], 1 / tile[0], 1 / tile[1])
    t.links.new(add.outputs[0], mp.inputs[0])
    ic = n.new('ShaderNodeTexImage'); ic.image = image(base); ie = n.new('ShaderNodeTexImage'); ie.image = image(em)
    for i in (ic, ie): i.projection = 'BOX'; i.projection_blend = 0.0; t.links.new(mp.outputs[0], i.inputs[0])
    t.links.new(ic.outputs[0], b.inputs['Base Color']); t.links.new(ie.outputs[0], b.inputs['Emission Color'])
    setin(b, Roughness=rough, Metallic=metal, Emission_Strength=emit_strength, Coat_Weight=.6, Coat_Roughness=.03)
    _mats[name] = m; return m


def glass_thin(name='glass_thin', tint=(.85, .93, 1.0)):
    """Thin-walled architectural glass: mix(transparent, glossy) by Fresnel — cheap and low-noise."""
    if name in _mats: return _mats[name]
    m = bpy.data.materials.new(name); m.use_nodes = True; t = m.node_tree; n = t.nodes; n.clear()
    tr = n.new('ShaderNodeBsdfTransparent'); tr.inputs[0].default_value = (*tint, 1)
    gl = n.new('ShaderNodeBsdfGlossy'); gl.inputs['Roughness'].default_value = .02
    fr = n.new('ShaderNodeFresnel'); fr.inputs[0].default_value = 1.45
    mx = n.new('ShaderNodeMixShader'); o = n.new('ShaderNodeOutputMaterial')
    t.links.new(fr.outputs[0], mx.inputs[0]); t.links.new(tr.outputs[0], mx.inputs[1]); t.links.new(gl.outputs[0], mx.inputs[2]); t.links.new(mx.outputs[0], o.inputs[0])
    _mats[name] = m; return m


# ------------------------------------------------------------------ geometry helpers
def _obj(name, bm, mat, loc=(0, 0, 0), bevel=0.0, smooth=False, collection=None):
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free()
    o = bpy.data.objects.new(name, me); o.location = loc
    (collection or bpy.context.scene.collection).objects.link(o)
    if mat: o.data.materials.append(mat)
    if smooth: [setattr(p, 'use_smooth', True) for p in me.polygons]
    if bevel:
        md = o.modifiers.new('bevel', 'BEVEL'); md.width = bevel; md.segments = 2; md.limit_method = 'ANGLE'
    return o


def box(name, w, h, d, cx, y, cz, mat, bevel=0.0, rotz=0.0):
    """Box with dimensions in web axes (w:x, h:up, d:z) whose bottom sits at y."""
    bm = bmesh.new(); bmesh.ops.create_cube(bm, size=1.0)
    for v in bm.verts: v.co.x *= w; v.co.y *= d; v.co.z *= h
    o = _obj(name, bm, mat, P(cx, y + h / 2, cz), bevel)
    if rotz: o.rotation_euler.z = rotz
    return o


def cyl(name, r, h, cx, y, cz, mat, seg=32, r2=None, bevel=0.0):
    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=True, segments=seg, radius1=r, radius2=r if r2 is None else r2, depth=h)
    return _obj(name, bm, mat, P(cx, y + h / 2, cz), bevel, smooth=seg > 8)


def sphere(name, r, cx, cy, cz, mat, sc=(1, 1, 1), seg=24):
    bm = bmesh.new(); bmesh.ops.create_uvsphere(bm, u_segments=seg, v_segments=seg // 2, radius=r)
    o = _obj(name, bm, mat, P(cx, cy, cz), smooth=True); o.scale = (sc[0], sc[2], sc[1]); return o


def merged(name, parts, mat, smooth=False):
    """parts: list of (bm_builder_fn) already transformed bmeshes -> one object."""
    bm = bmesh.new()
    for p in parts:
        me = bpy.data.meshes.new('t'); p.to_mesh(me); bm.from_mesh(me); bpy.data.meshes.remove(me); p.free()
    return _obj(name, bm, mat, (0, 0, 0), smooth=smooth)


def cube_bm(sx, sy, sz, M):
    bm = bmesh.new(); bmesh.ops.create_cube(bm, size=1.0)
    for v in bm.verts: v.co.x *= sx; v.co.y *= sy; v.co.z *= sz
    bmesh.ops.transform(bm, matrix=M, verts=bm.verts); return bm


def emit_plane(name, w, h, loc, rot, mat):
    bm = bmesh.new(); bmesh.ops.create_grid(bm, x_segments=1, y_segments=1, size=.5)
    for v in bm.verts: v.co.x *= 2 * w; v.co.y *= 2 * h
    uv = bm.loops.layers.uv.verify()
    for f in bm.faces:
        for l in f.loops: l[uv].uv = (l.vert.co.x / w + .5, l.vert.co.y / h + .5)
    o = _obj(name, bm, mat, loc); o.rotation_euler = rot; return o


def area_light(name, loc, size, watts, color=(1, .8, .6), rot=(0, 0, 0), shape='RECTANGLE', sy=None):
    ld = bpy.data.lights.new(name, 'AREA'); ld.energy = watts; ld.color = color; ld.shape = shape; ld.size = size
    if sy: ld.size_y = sy
    ld.use_shadow = True
    o = bpy.data.objects.new(name, ld); o.location = loc; o.rotation_euler = rot; bpy.context.scene.collection.objects.link(o); return o


def point_light(name, loc, watts, color=(1, .8, .6), radius=.2):
    ld = bpy.data.lights.new(name, 'POINT'); ld.energy = watts; ld.color = color; ld.shadow_soft_size = radius
    o = bpy.data.objects.new(name, ld); o.location = loc; bpy.context.scene.collection.objects.link(o); return o


# ------------------------------------------------------------------ world / render settings
def setup_render(w=960, h=540, samples=48):
    sc = bpy.context.scene
    sc.render.engine = 'CYCLES'
    cy = sc.cycles; cy.device = 'CPU'; cy.samples = samples; cy.use_adaptive_sampling = True; cy.adaptive_threshold = 0.03
    cy.use_denoising = True; cy.denoiser = 'OPENIMAGEDENOISE'; cy.denoising_input_passes = 'RGB_ALBEDO_NORMAL'
    cy.max_bounces = 7; cy.diffuse_bounces = 3; cy.glossy_bounces = 4; cy.transmission_bounces = 6; cy.transparent_max_bounces = 16
    cy.sample_clamp_indirect = 8; cy.caustics_reflective = False; cy.caustics_refractive = False
    cy.film_exposure = 1.0
    sc.render.resolution_x, sc.render.resolution_y, sc.render.resolution_percentage = w, h, 100
    sc.render.image_settings.file_format = 'PNG'; sc.render.image_settings.color_depth = '8'
    sc.view_settings.view_transform = 'AgX'; sc.view_settings.exposure = 0.0
    sc.render.film_transparent = False


def setup_world(sun_elev=3.0, sun_rot=218.5, strength=1.0):
    wd = bpy.data.worlds.new('dusk'); wd.use_nodes = True; bpy.context.scene.world = wd
    n = wd.node_tree.nodes; n.clear()
    sky = n.new('ShaderNodeTexSky'); sky.sky_type = 'MULTIPLE_SCATTERING'
    sky.sun_elevation = math.radians(sun_elev); sky.sun_rotation = math.radians(sun_rot)
    sky.air_density = 1.6; sky.aerosol_density = 2.2; sky.ozone_density = 1.2; sky.sun_size = math.radians(0.55); sky.sun_intensity = 0.9
    bg = n.new('ShaderNodeBackground'); bg.inputs[1].default_value = strength
    o = n.new('ShaderNodeOutputWorld')
    wd.node_tree.links.new(sky.outputs[0], bg.inputs[0]); wd.node_tree.links.new(bg.outputs[0], o.inputs[0])
    # distance haze: thin scattering volume gives aerial perspective
    return wd


def setup_camera(name='cam'):
    cd = bpy.data.cameras.new(name); cd.sensor_fit = 'VERTICAL'; cd.sensor_height = 24.0; cd.clip_start = 0.1; cd.clip_end = 30000
    co = bpy.data.objects.new(name, cd); bpy.context.scene.collection.objects.link(co); bpy.context.scene.camera = co
    return co


def aim(cam, pos, look, fov_deg):
    cam.location = P(*pos); d = P(*look) - cam.location
    cam.rotation_euler = d.to_track_quat('-Z', 'Y').to_euler()
    cam.data.lens = 12.0 / math.tan(math.radians(fov_deg) / 2)


# ------------------------------------------------------------------ city
def build_city():
    M = {}
    M['asphalt'] = tex_mat('asphalt', 'asphalt.png', rough=.42, tile=(8, 8), clearcoat=.3)
    M['conc'] = tex_mat('conc', 'concrete.png', rough=.8, tile=(6, 6))
    M['plaza'] = tex_mat('plaza', 'marble_dark.png', rough=.18, tile=(5, 5), clearcoat=.5)
    M['steel'] = pbr('steel', (.55, .57, .62), .25, 1.0)
    M['darksteel'] = pbr('darksteel', (.05, .055, .065), .35, .9)
    M['led'] = emit('led', (1, .78, .5), 6.0)
    M['ledw'] = emit('ledw', (.85, .92, 1), 9.0)
    M['kerb'] = emit('kerb', (1, .9, .75), 3.0)

    # ground
    box('ground', 7000, .4, 7000, 0, -.4, 0, pbr('ground', (.07, .062, .052), .95))
    box('plaza', 560, .3, 34, 0, -.02, 32, M['plaza'])
    for i in range(-5, 6): box('ledline', .16, .02, 30, i * 7, .26, 32, M['led'])
    # road
    for z0, z1 in ((ROAD['aZ0'], ROAD['aZ1']), (ROAD['bZ0'], ROAD['bZ1'])):
        box('road', 1600, .22, z1 - z0, 0, -.02, (z0 + z1) / 2, M['asphalt'])
        for k in range(1, 5):   # dashed lane lines
            zz = z0 + k * (z1 - z0) / 5
            bm = bmesh.new()
            for i in range(-100, 100):
                bmesh.ops.transform(bm, matrix=Matrix.Identity(4), verts=[])
                b = cube_bm(3.0, .16, .02, Matrix.Translation(P(i * 12, .21, zz)))
                me = bpy.data.meshes.new('t'); b.to_mesh(me); bm.from_mesh(me); bpy.data.meshes.remove(me); b.free()
            _obj('lane', bm, pbr('lane', (.9, .9, .9), .6, emission_strength=0))
        for zz in (z0, z1): box('kerbline', 1600, .03, .2, 0, .22, zz, M['kerb'])
    box('median', 1600, .5, ROAD['bZ0'] - ROAD['aZ1'], 0, 0, ROAD['mid'], M['conc'])
    box('farwalk', 1600, .3, 40, 0, 0, 112, pbr('farwalk', (.14, .14, .16), .7))

    # traffic (vertex-coloured bodies + emissive lamps)
    bodies = bmesh.new(); col = bodies.loops.layers.color.new('Col')
    lampsF, lampsR = [], []
    pal = [(.55, .55, .58), (.03, .03, .035), (.22, .24, .27), (.28, .02, .02), (.7, .66, .58), (.04, .07, .15), (.08, .08, .09)]
    for lane_dir, (z0, z1) in ((1, (ROAD['aZ0'], ROAD['aZ1'])), (-1, (ROAD['bZ0'], ROAD['bZ1']))):
        for i in range(70):
            lane = R.randrange(5); x = R.uniform(-420, 420); z = z0 + 1.8 + lane * 3.6
            c = R.choice(pal)
            for (sx, sy, sz, ox, oy) in ((4.4, 1.8, .85, 0, .5), (2.5, 1.65, .55, -.2, 1.15)):
                b = cube_bm(sx, sy, sz, Matrix.Translation(P(x + ox * lane_dir, oy + sz / 2, z)))
                cl = b.loops.layers.color.active or b.loops.layers.color.new('Col')
                for f in b.faces:
                    for l in f.loops: l[cl] = (*c, 1)
                me = bpy.data.meshes.new('t'); b.to_mesh(me); bodies.from_mesh(me); bpy.data.meshes.remove(me); b.free()
            lampsF.append(cube_bm(.3, 1.5, .2, Matrix.Translation(P(x + 2.2 * lane_dir, .85, z))))
            lampsR.append(cube_bm(.2, 1.5, .25, Matrix.Translation(P(x - 2.2 * lane_dir, .95, z))))
    m, b = new_mat('carpaint'); vc = m.node_tree.nodes.new('ShaderNodeVertexColor'); vc.layer_name = 'Col'
    m.node_tree.links.new(vc.outputs[0], b.inputs['Base Color']); setin(b, Roughness=.2, Metallic=.6, Coat_Weight=1.0)
    _obj('cars', bodies, m)
    merged('headlamps', lampsF, emit('headlamp', (1, .95, .8), 40)); merged('taillamps', lampsR, emit('taillamp', (1, .05, .02), 18))

    # street lamps along median
    parts, lamps = [], []
    for i in range(-18, 19):
        x = i * 40 + 12
        parts.append(cube_bm(.35, .35, 13, Matrix.Translation(P(x, 6.5, ROAD['mid']))))
        parts.append(cube_bm(.2, 3.4, .2, Matrix.Translation(P(x, 13, ROAD['mid']))))
        lamps.append(cube_bm(1.2, .4, .3, Matrix.Translation(P(x, 12.8, ROAD['mid'] - 1.6)))); lamps.append(cube_bm(1.2, .4, .3, Matrix.Translation(P(x, 12.8, ROAD['mid'] + 1.6))))
    merged('poles', parts, M['darksteel']); merged('lamps', lamps, emit('streetlamp', (1, .72, .4), 30))

    # metro viaduct + station
    box('viaduct', 1600, 1.4, 8.4, 0, 9.5, ROAD['mid'], tex_mat('via', 'concrete.png', rough=.7, tile=(8, 8)))
    parts = [cube_bm(2.6, 2.8, 9.6, Matrix.Translation(P(i * 24 + 12, 4.8, ROAD['mid']))) for i in range(-20, 20)]
    merged('pillars', parts, tex_mat('via', 'concrete.png'))
    for dz in (-1.6, 1.6): box('rail', 1600, .14, .14, 0, 10.9, ROAD['mid'] + dz, M['steel'])
    build_station(M)
    build_train(M)
    build_emirates_towers(M)
    build_skyline()
    build_palms()


def build_station(M):
    x0, y0, z0, L, rx, ry = -60, 10.9, ROAD['mid'], 78, 7.4, 5.2
    # arched glass shell
    bm = bmesh.new(); N = 24
    for i in range(N):
        a0, a1 = math.pi * i / N, math.pi * (i + 1) / N
        for xa, xb in ((x0 - L / 2, x0 + L / 2),):
            v = [bm.verts.new(P(xa, y0 + ry * math.sin(a0), z0 + rx * math.cos(a0))), bm.verts.new(P(xb, y0 + ry * math.sin(a0), z0 + rx * math.cos(a0))),
                 bm.verts.new(P(xb, y0 + ry * math.sin(a1), z0 + rx * math.cos(a1))), bm.verts.new(P(xa, y0 + ry * math.sin(a1), z0 + rx * math.cos(a1)))]
            bm.faces.new(v)
    _obj('station_glass', bm, glass_thin('glass_station', (.8, .92, 1)), smooth=True)
    ribs = []
    for i in range(-6, 7):
        for j in range(N):
            a0, a1 = math.pi * j / N, math.pi * (j + 1) / N
            p0 = P(x0 + i * 6.2, y0 + ry * math.sin(a0), z0 + rx * math.cos(a0)); p1 = P(x0 + i * 6.2, y0 + ry * math.sin(a1), z0 + rx * math.cos(a1))
            mid = (p0 + p1) / 2; dirv = (p1 - p0); Lg = dirv.length
            rot = dirv.to_track_quat('X', 'Z').to_matrix().to_4x4()
            ribs.append(cube_bm(Lg * 1.05, .4, .4, Matrix.Translation(mid) @ rot))
    merged('station_ribs', ribs, pbr('ribmat', (.82, .84, .88), .22, 1.0))
    box('platform', L, .4, 13, x0, y0 - .4, z0, pbr('platform', (.72, .7, .66), .35))
    box('platlight', L - 2, .05, 11, x0, y0 + .02, z0, emit('platlight', (1, .88, .7), 3.0))
    box('roofled', 70, .25, .7, x0, y0 + 5.0, z0, emit('roofled', (1, .95, .85), 14))
    # sign
    bpy.ops.object.text_add(location=P(x0, y0 + 7.8, z0 + 7.7)); t = bpy.context.object; t.data.body = 'EMIRATES TOWERS'; t.data.size = 1.5; t.data.align_x = 'CENTER'
    t.data.extrude = .05; t.rotation_euler = (math.pi / 2, 0, 0); t.data.materials.append(emit('stationtxt', (1, 1, 1), 10))
    box('signback', 15, 2.4, .3, x0, y0 + 7.0, z0 + 7.6, pbr('signred', (.55, .02, .06), .4))
    # footbridge down to the SWK plaza (rises from plaza to station)
    zA, zB = ROAD['mid'] - 5, 40.0; Ln = math.hypot(zA - zB, 10.4); ang = math.atan2(10.4, zA - zB)
    o = box('bridge', 4.6, .35, Ln, -42, 5.6, (zA + zB) / 2, pbr('bridge', (.78, .75, .7), .45)); o.rotation_euler.x = ang
    r2 = box('bridgeroof', 5.4, .12, Ln, -42, 8.8, (zA + zB) / 2, glass_thin('glass_bridge')); r2.rotation_euler.x = ang


def build_train(M):
    parts = []
    for i in range(4):
        parts.append(cube_bm(17.6, 3.1, 3.5, Matrix.Translation(P(-62 + i * 18.2 + 24, 12.9, ROAD['mid'] - 1.6))))
    merged('train', parts, pbr('train', (.9, .91, .93), .22, .8))
    wins = [cube_bm(15.6, 3.2, .9, Matrix.Translation(P(-62 + i * 18.2 + 24, 13.4, ROAD['mid'] - 1.6))) for i in range(4)]
    merged('trainwin', wins, emit('trainwin', (1, .9, .7), 4))
    box('trainstripe', 73, .3, 3.16, -26, 11.9, ROAD['mid'] - 1.6, emit('redstripe', (.9, .02, .06), 2))


def facade_box(name, w, h, d, cx, y, cz, mat, rotz=0):
    return box(name, w, h, d, cx, y, cz, mat, rotz=rotz)


def tri_prism(name, R_, h, cx, y, cz, mat, rot=0, top_r=None, seg=3):
    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=True, segments=seg, radius1=R_, radius2=R_ if top_r is None else top_r, depth=h)
    o = _obj(name, bm, mat, P(cx, y + h / 2, cz)); o.rotation_euler.z = rot; return o


def build_emirates_towers(M):
    mat = facade_mat('fac_steel', 'facade_steel_c.png', 'facade_steel_e.png', tile=(18, 29), metal=.7, rough=.1, emit_strength=2.5)
    for (h, x, z, rot, R_) in ((355, -158, -6, math.pi / 6, 25), (305, -104, -52, math.pi / 2.2, 22)):
        tri_prism('et_body', R_, h - 50, x, 0, z, mat, rot)
        tri_prism('et_top', R_, 50, x, h - 50, z, pbr('et_top', (.62, .68, .76), .15, 1.0), rot, top_r=R_ * .08)
        cyl('et_spire', .4, 40, x, h, z, pbr('spire', (.8, .83, .88), .2, 1), seg=8, r2=.2)
        sphere('et_beacon', 1.0, x, h + 40, z, emit('beacon', (1, .05, .02), 60))
        for i in range(3):
            a = rot + i * math.tau / 3 + math.pi / 2
            box('et_edge', .5, h - 50, .5, x + math.cos(a) * R_, 0, z - math.sin(a) * R_, emit('etedge', (.75, .85, 1), 3.5))


def build_skyline():
    mats = [facade_mat(f'fac{i}', f'facade{i}_c.png', f'facade{i}_e.png', tile=(16, 29)) for i in range(3)]
    def free(x, z): return not ((abs(x) < 55 and -40 < z < 56) or (-215 < x < -60 and -95 < z < 30) or (45 < z < 100))
    n = 0
    while n < 300:
        s = R.random()
        if s < .45: x, z = R.uniform(-900, 900), R.uniform(112, 450)
        elif s < .85: x, z = R.uniform(-900, 900), -R.uniform(80, 580)
        else: x, z = R.choice((-1, 1)) * R.uniform(240, 840), R.uniform(-50, 50)
        if not free(x, z): continue
        w, d = R.uniform(22, 56), R.uniform(22, 56); far = math.hypot(x, z)
        h = 45 + R.random() ** 2.2 * (330 if far > 500 else 220)
        box('sk', w, h, d, x, 0, z, mats[R.randrange(3)]); n += 1
    # Burj Khalifa lookalike (stepped tapering tiers)
    mat = facade_mat('fac_burj', 'facade_steel_c.png', 'facade_steel_e.png', tile=(14, 24), metal=.8)
    y = 0
    for rad, hh in ((34, 150), (29, 130), (24, 120), (20, 110), (16, 100), (12, 90), (8, 70), (4.5, 40)):
        tri_prism('burj', rad, hh, -760, y, -560, mat, y * .01, top_r=rad * .86); y += hh
    cyl('burj_spire', 1.0, 140, -760, y, -560, pbr('burjsp', (.85, .87, .9), .2, 1), seg=8, r2=.3)


def build_palms():
    leaf = pbr('leaf', (.05, .16, .05), .55)
    leaf.node_tree.nodes['Principled BSDF'].inputs['Subsurface Weight'].default_value = .15
    trunks, leaves = [], []
    for i in range(-9, 10):
        if abs(i) < 2: continue
        x, z = i * 22 + R.uniform(-1.5, 1.5), R.uniform(22, 32); hs = R.uniform(.85, 1.35)
        trunks.append(cube_bm(.5 * hs, .5 * hs, 9 * hs, Matrix.Translation(P(x, 4.5 * hs, z))))
        for k in range(11):
            a = k / 11 * math.tau + R.random() * .3
            lbm = bmesh.new()
            segs = 6
            vs = []
            for s in range(segs + 1):
                t = s / segs; ln = 5.4 * hs; rr = t * ln; drop = -.09 * rr * rr * 1.0
                wd = .55 * hs * (1 - t * .85)
                vs.append((lbm.verts.new((rr, -wd, drop)), lbm.verts.new((rr, wd, drop))))
            for s in range(segs): lbm.faces.new((vs[s][0], vs[s + 1][0], vs[s + 1][1], vs[s][1]))
            bmesh.ops.transform(lbm, matrix=Matrix.Translation(P(x, 9 * hs, z)) @ Matrix.Rotation(a, 4, 'Z'), verts=lbm.verts)
            leaves.append(lbm)
    merged('palm_trunk', trunks, pbr('trunk', (.3, .24, .18), .9))
    m = merged('palm_leaves', leaves, leaf, smooth=True); m.data.materials[0].use_backface_culling = False


# ------------------------------------------------------------------ tower exterior
def build_tower_exterior():
    top = levelY(OPEN + 1); roof = levelY(LEVELS)
    fac = facade_mat('fac_tower', 'facade_tower_c.png', 'facade_tower_e.png', tile=(19.2, 35.2), emit_strength=3.5, random_off=False)
    box('tower_upper', W, roof - top, D, 0, top, 0, fac)
    # lower walls (cut-away front)
    plaster = pbr('plaster', (.82, .8, .76), .85)
    box('wall_back', W, top, .5, 0, 0, -HD + .25, plaster); box('wall_back_out', W, top, .05, 0, 0, -HD - .02, fac)
    for sx in (-1, 1):
        box('wall_side', .5, top, D, sx * (HW - .25), 0, 0, plaster); box('wall_side_out', .05, top, D, sx * (HW + .02), 0, 0, fac)
    # exoskeleton: dark beams + emissive core
    dark, glow = [], []
    y0 = top + .2; y1 = levelY(46); rowH = FH * 4; rows = int((y1 - y0) // rowH)
    faces = [(W, 0, HD + .45), (W, math.pi, HD + .45), (D, math.pi / 2, HW + .45), (D, -math.pi / 2, HW + .45)]
    for length, rotY, off in faces:
        bays = round(length / 9.5); bw = length / bays
        for j in range(rows):
            for i in range(bays):
                cx = -length / 2 + (i + .5) * bw; cy = y0 + (j + .5) * rowH
                Lb = math.hypot(bw, rowH); ang = math.atan2(rowH, bw)
                for sg in (1, -1):
                    # local (face) coords: x along face, y up, z outward; then rotate about up axis
                    loc = Vector((cx, cy, off)); rotm = Matrix.Rotation(rotY, 4, 'Y')
                    p = rotm @ Matrix.Translation(loc) @ Matrix.Rotation(sg * ang, 4, 'Z')
                    pw = Matrix.Translation((0, 0, 0))
                    # convert web-space matrix to Blender (swap y/z, flip z)
                    C = Matrix(((1, 0, 0, 0), (0, 0, -1, 0), (0, 1, 0, 0), (0, 0, 0, 1)))
                    Mw = C @ p @ C.inverted()
                    dark.append(cube_bm(Lb, .9, .9, Mw)); glow.append(cube_bm(Lb, .16, .16, Mw @ Matrix.Translation((0, 0, .5)) if False else Mw @ Matrix.Translation((0, -.5, 0))))
    merged('exo_dark', dark, pbr('exo', (.04, .045, .055), .3, .9)); merged('exo_glow', glow, emit('exoled', (.8, .9, 1), 22))
    for sx in (-1, 1):
        for sz in (-1, 1): box('corner_led', .5, roof - top, .5, sx * (HW + .2), top, sz * (HD + .2), emit('cornerled', (.8, .9, 1), 14))
    # facade logo
    lg = emit_plane('logo', 7.8, 6.35, P(0, levelY(40), HD + 1.1), (math.pi / 2, 0, 0), logo_mat())
    box('logoback', 17, 14, .5, 0, levelY(40) - 7, HD + .6, pbr('logoback', (.02, .03, .06), .3, .6))
    build_canopy()


def logo_mat():
    if 'logo' in _mats: return _mats['logo']
    m = bpy.data.materials.new('logo'); m.use_nodes = True; t = m.node_tree; n = t.nodes; n.clear()
    im = n.new('ShaderNodeTexImage'); im.image = image('swk-logo-white.png')
    em = n.new('ShaderNodeEmission'); em.inputs[1].default_value = 7
    tr = n.new('ShaderNodeBsdfTransparent'); mx = n.new('ShaderNodeMixShader'); o = n.new('ShaderNodeOutputMaterial')
    t.links.new(im.outputs[0], em.inputs[0]); t.links.new(im.outputs[1], mx.inputs[0]); t.links.new(tr.outputs[0], mx.inputs[1]); t.links.new(em.outputs[0], mx.inputs[2]); t.links.new(mx.outputs[0], o.inputs[0])
    _mats['logo'] = m; return m


def build_canopy():
    dk = pbr('canopy', (.05, .055, .065), .4, .6)
    bm = bmesh.new(); N = 28; pts = []
    for i in range(N + 1):
        x = -48 + 96 * i / N; u = x / 48; pts.append((x, 24 + 16 * (1 - u * u)))
    pts = [(-48, 12)] + pts + [(48, 12)]
    vs = [bm.verts.new(P(x, H0 - .1, z)) for x, z in pts]; f = bm.faces.new(vs)
    r = bmesh.ops.extrude_face_region(bm, geom=[f]); mv = [v for v in r['geom'] if isinstance(v, bmesh.types.BMVert)]
    bmesh.ops.translate(bm, vec=(0, 0, -.7), verts=mv); bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    _obj('canopy', bm, dk)
    # warm underside glow strips + LED edge
    for z in (16, 22, 28, 34): box('cano_led', 70 if z < 30 else 50, .04, .3, 0, H0 - .83, z, emit('canoled', (1, .8, .55), 9))
    for x in (-40, -27, -14, 14, 27, 40):
        u = x / 48; z = 24 + 16 * (1 - u * u) - 1.2
        cyl('col', .32, H0 - .1, x, 0, z, pbr('colmat', (.78, .76, .72), .25, .5), seg=24); box('colled', .08, H0 - 1, .06, x, .4, z + .34, emit('colled', (1, .82, .55), 8))
    # name sign
    bpy.ops.object.text_add(location=P(0, H0 + 1.1, 40.6)); t = bpy.context.object; t.data.body = 'SWK  PROPERTY'; t.data.size = 2.0; t.data.align_x = 'CENTER'; t.data.align_y = 'CENTER'
    t.data.extrude = .08; t.rotation_euler = (math.pi / 2, 0, 0); t.data.materials.append(emit('signtxt', (1, 1, 1), 14))
    box('signback', 24, 3.2, .5, 0, H0 - .5, 40.1, pbr('signback', (.02, .03, .06), .3, .6))
    box('forecourt', 60, .2, 14, 0, 0, 18, tex_mat('forecourt', 'marble_cream.png', rough=.15, tile=(5, 5), clearcoat=.6))
