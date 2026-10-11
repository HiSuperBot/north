"""Build NORTH's reusable Pyongyang miniature-diorama assets in Blender 5.x.

Run in an open Blender instance through Blender MCP, or:
  blender --background --python site/art/pyongyang/build_diorama.py

The user's existing scene and objects are preserved. Only this script's separately
named NORTH_Pyongyang_Diorama scene is rebuilt on subsequent runs.
All geometry is original procedural modelling. No photographic pixels are embedded.
"""
import bpy
import math
import json
import random
from pathlib import Path
from mathutils import Vector, Matrix

ROOT = Path(__file__).resolve().parents[2]
OUTPUT = ROOT / 'public/models/pyongyang/v1'
THUMBNAILS = ROOT / 'public/thumbnails/pyongyang'
RENDERS = ROOT / 'art/pyongyang/renders'
SOURCE = ROOT / 'art/pyongyang/north-pyongyang-diorama.blend'
SCENE_NAME = 'NORTH_Pyongyang_Diorama'
for directory in [OUTPUT, THUMBNAILS, RENDERS, SOURCE.parent]:
    directory.mkdir(parents=True, exist_ok=True)

existing = bpy.data.scenes.get(SCENE_NAME)
if existing:
    # This scene is owned exclusively by this production script.
    for obj in list(existing.objects):
        bpy.data.objects.remove(obj, do_unlink=True)
    bpy.data.scenes.remove(existing)
scene = bpy.data.scenes.new(SCENE_NAME)
bpy.context.window.scene = scene
scene.unit_settings.system = 'METRIC'
scene.unit_settings.scale_length = 1.0
scene.render.engine = 'BLENDER_EEVEE'
scene.render.resolution_x = 768
scene.render.resolution_y = 768
scene.render.resolution_percentage = 100
scene.render.image_settings.file_format = 'PNG'
scene.render.film_transparent = False
scene.view_settings.view_transform = 'AgX'
scene.world = bpy.data.worlds.new('NORTH_soft_daylight')
scene.world.use_nodes = True
scene.world.node_tree.nodes['Background'].inputs['Color'].default_value = (0.63, 0.70, 0.77, 1)
scene.world.node_tree.nodes['Background'].inputs['Strength'].default_value = 0.55

def linear_hex(value):
    rgb = [int(value[i:i+2], 16) / 255 for i in (0, 2, 4)]
    return tuple(v / 12.92 if v < .04045 else ((v + .055) / 1.055) ** 2.4 for v in rgb)

PALETTE = {
    'plaster': ('ded3b9', .86), 'cream': ('efe6d1', .82),
    'coral': ('b78370', .88), 'brick': ('956957', .90),
    'roof': ('b9b6a8', .92), 'concrete': ('b5b3a6', .92),
    'glass': ('354f57', .28), 'glass-light': ('6d8587', .35),
    'glass-warm': ('687260', .42), 'frame': ('d6d9cd', .62),
    'teal': ('577e89', .76), 'blue': ('557888', .66),
    'navy': ('334955', .90), 'sage': ('66735e', .92),
    'cloth-coral': ('936d60', .92), 'cloth-cream': ('bebca6', .94),
    'skin': ('b99779', .85), 'hair': ('35352f', .92),
    'rubber': ('303333', .96), 'metal': ('72796f', .55),
    'wood': ('a18459', .9), 'leaf': ('697c49', .98),
    'leaf-light': ('88925c', .98), 'bark': ('6b5a42', 1.0),
    'produce': ('bc8159', .95), 'produce-green': ('79915e', .95),
    'lamp': ('eee6b7', .58), 'red': ('a05246', .65),
}
materials = {}
for name, (color, roughness) in PALETTE.items():
    mat = bpy.data.materials.new('NORTH_' + name)
    mat.diffuse_color = (*linear_hex(color), 1)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get('Principled BSDF')
    bsdf.inputs['Base Color'].default_value = mat.diffuse_color
    bsdf.inputs['Roughness'].default_value = roughness
    bsdf.inputs['Metallic'].default_value = .15 if name == 'metal' else 0
    materials[name] = mat

class Geometry:
    """One mesh per articulated part: a few draws, with material groups."""
    def __init__(self):
        self.vertices, self.faces, self.mats, self.smooth = [], [], [], []
        self.slots = []

    def append(self, verts, faces, material, matrix=None, smooth=False):
        if material not in self.slots:
            self.slots.append(material)
        index = self.slots.index(material)
        start = len(self.vertices)
        self.vertices.extend([tuple(matrix @ Vector(v)) if matrix is not None else tuple(v) for v in verts])
        self.faces.extend([tuple(start + i for i in f) for f in faces])
        self.mats.extend([index] * len(faces))
        self.smooth.extend([smooth] * len(faces))

    def box(self, center, dimensions, material, angle=0):
        x, y, z = [v / 2 for v in dimensions]
        verts = [(-x,-y,-z), (x,-y,-z), (x,y,-z), (-x,y,-z),
                 (-x,-y,z), (x,-y,z), (x,y,z), (-x,y,z)]
        faces = [(0,3,2,1),(4,5,6,7),(0,1,5,4),(1,2,6,5),(2,3,7,6),(3,0,4,7)]
        matrix = Matrix.Translation(Vector(center)) @ Matrix.Rotation(angle, 4, 'Z')
        self.append(verts, faces, material, matrix)

    def rounded_box(self, center, dimensions, material, bevel=.05):
        x,y,z = [v/2 for v in dimensions]
        b = min(bevel, x*.4, y*.4, z*.4)
        outline = [(-x+b,-y),(x-b,-y),(x,-y+b),(x,y-b),
                   (x-b,y),(-x+b,y),(-x,y-b),(-x,-y+b)]
        verts = []
        for height, inset in [(-z,b),(-z+b,0),(z-b,0),(z,b)]:
            verts.extend([(px*(x-inset)/x, py*(y-inset)/y, height) for px,py in outline])
        faces = [tuple(range(7,-1,-1)),tuple(range(24,32))]
        for level in range(3):
            for i in range(8):
                j = (i+1)%8
                faces.append((level*8+i,level*8+j,(level+1)*8+j,(level+1)*8+i))
        self.append(verts, faces, material, Matrix.Translation(Vector(center)))

    def cylinder(self, center, radius, height, material, segments=24, rotation=None, radius_top=None):
        top = radius if radius_top is None else radius_top
        verts = [(radius*math.cos(2*math.pi*i/segments),radius*math.sin(2*math.pi*i/segments),-height/2) for i in range(segments)]
        verts += [(top*math.cos(2*math.pi*i/segments),top*math.sin(2*math.pi*i/segments),height/2) for i in range(segments)]
        faces = [tuple(range(segments-1,-1,-1)),tuple(range(segments,2*segments))]
        faces += [(i,(i+1)%segments,(i+1)%segments+segments,i+segments) for i in range(segments)]
        matrix = Matrix.Translation(Vector(center))
        if rotation is not None: matrix @= rotation
        self.append(verts, faces, material, matrix, True)

    def ring(self, center, outer, inner, height, material, segments=64):
        verts = []
        for z in [-height/2,height/2]:
            for radius in [outer,inner]:
                verts += [(radius*math.cos(2*math.pi*i/segments),radius*math.sin(2*math.pi*i/segments),z) for i in range(segments)]
        faces = []
        for i in range(segments):
            j = (i+1)%segments
            faces.extend([(i,j,j+segments,i+segments),(i+2*segments,i+3*segments,j+3*segments,j+2*segments),
                          (i,j,j+2*segments,i+2*segments),(i+segments,i+3*segments,j+3*segments,j+segments)])
        self.append(verts, faces, material, Matrix.Translation(Vector(center)), True)

    def ellipsoid(self, center, radii, material, segments=12, rings=8, top_only=False):
        verts, faces = [], []
        for j in range(rings+1):
            phi = math.pi*(j/rings)*(0.52 if top_only else 1)
            verts.extend([(radii[0]*math.sin(phi)*math.cos(2*math.pi*i/segments),
                           radii[1]*math.sin(phi)*math.sin(2*math.pi*i/segments),
                           radii[2]*math.cos(phi)) for i in range(segments)])
        for j in range(rings):
            for i in range(segments):
                n = (i+1)%segments
                faces.append((j*segments+i,j*segments+n,(j+1)*segments+n,(j+1)*segments+i))
        self.append(verts, faces, material, Matrix.Translation(Vector(center)), True)

    def rod(self, a, b, radius, material, segments=10):
        a,b = Vector(a),Vector(b)
        rotation = (b-a).to_track_quat('Z','Y').to_matrix().to_4x4()
        self.cylinder((a+b)/2,radius,(b-a).length,material,segments,rotation)

    def garment(self, levels, material, segments=16):
        """Tapered soft rectangular cross-sections, preserving a tailored silhouette."""
        verts=[]
        for height,width,depth in levels:
            for i in range(segments):
                angle=2*math.pi*i/segments
                cosine,sine=math.cos(angle),math.sin(angle)
                verts.append((width*math.copysign(abs(cosine)**.64,cosine),
                              depth*math.copysign(abs(sine)**.64,sine),height))
        faces=[tuple(range(segments-1,-1,-1)),tuple(range((len(levels)-1)*segments,len(levels)*segments))]
        for level in range(len(levels)-1):
            for i in range(segments):
                j=(i+1)%segments
                faces.append((level*segments+i,level*segments+j,(level+1)*segments+j,(level+1)*segments+i))
        self.append(verts,faces,material,smooth=True)

    def object(self, name, collection, parent=None, location=(0,0,0)):
        mesh = bpy.data.meshes.new('NORTH_mesh_' + name)
        mesh.from_pydata(self.vertices, [], self.faces)
        mesh.update()
        for slot in self.slots: mesh.materials.append(materials[slot])
        for polygon, mat, smooth in zip(mesh.polygons,self.mats,self.smooth):
            polygon.material_index = mat
            polygon.use_smooth = smooth
        obj = bpy.data.objects.new(name, mesh)
        collection.objects.link(obj)
        obj.parent = parent
        obj.location = location
        if name.startswith(('arm-', 'leg-')):
            obj['motionPart'] = name
        return obj

assets = {}
def asset(name):
    collection = bpy.data.collections.new('NORTH_asset_' + name)
    scene.collection.children.link(collection)
    root = bpy.data.objects.new(name,None)
    collection.objects.link(root)
    root['reconstruction'] = 'Illustrative original miniature; not an exact surveyed replica.'
    assets[name] = (collection,root)
    return collection,root

def window(g, center, width, height, angle=0, light=False):
    x,y,z = center
    g.box(center,(width+.18,.12,height+.18),'frame',angle)
    outward = Vector((math.sin(angle),-math.cos(angle),0))*.075
    front = Vector(center)+outward
    g.box(front,(width,.055,height),'glass-light' if light else 'glass',angle)
    g.box(front+outward*.3,(.065,.075,height),'frame',angle)

# Cylindrical silhouette and balcony rings are photo-informed; dimensions and
# simplified floor count are illustrative. Glazing/door layouts are inferred.
collection,root = asset('apartment-cylinder')
g = Geometry()
g.cylinder((0,0,17.4),12.45,34.8,'plaster',64)
g.cylinder((0,0,.28),13.1,.56,'concrete',64)
for floor in range(10):
    base = .55 + floor*3.42
    g.ring((0,0,base+.06),14,12.2,.20,'cream',64)
    g.ring((0,0,base+.55),14,13.76,.72,'coral' if floor%3==0 else 'cream',64)
    g.ring((0,0,base+.98),14.035,13.72,.075,'frame',64)
    for i in range(20):
        theta = 2*math.pi*i/20
        rotation = theta + math.pi/2
        center = (12.51*math.cos(theta),12.51*math.sin(theta),base+1.74)
        window(g,center,2.5,1.8,rotation,(i+floor)%5==0)
        # Balcony divider gives the model readable vertical depth.
        r = 13.15
        g.box((r*math.cos(theta+.155),r*math.sin(theta+.155),base+1.63),(.085,1.50,2.5),'plaster',rotation)
g.ring((0,0,35.10),14.15,12.0,.26,'cream',64)
g.ring((0,0,35.65),14,13.65,.7,'cream',64)
g.cylinder((0,0,35.17),13.65,.2,'roof',64)
g.rounded_box((0,0,35.54),(4.5,3.0,.75),'plaster',.12)
for x in [-1.3,0,1.3]: g.box((x,0,35.95),(.65,.65,.10),'roof')
g.box((0,-13.5,1.55),(4.5,2.5,3.1),'plaster')
window(g,(0,-14.78,1.6),3.0,2.7)
g.box((0,-14.1,3.18),(5.2,3.6,.22),'cream')
for i in range(3): g.box((0,-14.85-i*.32,.08+i*.08),(4.4-i*.35,.65,.16+i*.16),'concrete')
g.object('cylinder-shell',collection,root)

collection,root = asset('apartment-block')
g=Geometry()
g.rounded_box((0,0,8.65),(24,12,17.3),'plaster',.10)
g.box((0,0,.22),(24.25,12.25,.44),'concrete')
for floor in range(5):
    z=2.45+floor*3.15
    for side in [-1,1]:
        angle=0 if side==-1 else math.pi
        for i in range(8):
            x=-10.35+i*2.95
            window(g,(x,side*6.06,z),1.63,1.86,angle,(i+floor)%4==0)
            if i%3==1:
                g.box((x,side*6.70,z-.82),(2.22,1.6,.12),'cream')
                g.box((x,side*7.40,z-.32),(2.18,.12,.90),'coral')
                for dx in [-1.05,1.05]: g.box((x+dx,side*6.8,z-.30),(.1,1.1,.9),'frame')
        g.box((0,side*6.03,z+1.4),(24.05,.12,.14),'cream')
    for side in [-1,1]:
        for i in [-2.9,0,2.9]: window(g,(side*12.06,i,z),1.5,1.7,side*math.pi/2)
g.box((0,0,17.55),(24.25,12.25,.28),'roof')
for x in [-12,12]: g.box((x,0,17.77),(.18,12.2,.45),'cream')
for y in [-6,6]: g.box((0,y,17.77),(24.1,.18,.45),'cream')
g.rounded_box((0,1,17.78),(3.8,3.0,.44),'plaster',.05)
window(g,(0,-6.12,1.5),2.5,2.7)
g.box((0,-6.8,3.04),(3.2,2,.16),'cream')
g.object('block-shell',collection,root)

collection,root=asset('storefront')
g=Geometry()
g.rounded_box((0,0,2.85),(20,12,5.70),'plaster',.09)
g.box((0,0,.18),(20.15,12.15,.36),'concrete')
for side in [-1,1]:
    angle=0 if side==-1 else math.pi
    for x in [-7.9,-4.8,-1.65,1.65,4.8,7.9]:
        window(g,(x,side*6.075,2.45),2.9,3.36,angle,x in [-4.8,4.8])
    g.box((0,side*6.16,4.42),(20.18,.35,.59),'teal')
    g.box((0,side*6.15,.67),(20.05,.24,.48),'cream')
g.box((0,0,5.75),(20.3,12.3,.24),'roof')
for x in [-10,10]:g.box((x,0,5.95),(.22,12.3,.25),'cream')
for y in [-6,6]:g.box((0,y,5.95),(20.3,.22,.25),'cream')
for x in [-8.5,8.5]:
    for y in [-4.5,4.5]:g.rounded_box((x,y,6.04),(.7,.7,.10),'metal',.02)
g.object('store-shell',collection,root)

def human(name, shirt, pants='navy', bag=False, load=False, seated=False):
    collection,root=asset(name)
    body=Geometry()
    body.garment([(.80,.17,.12),(.88,.18,.125),(1.20,.192,.131),
                  (1.30,.196,.12),(1.385,.095,.089)],shirt)
    body.rounded_box((0,0,.80),(.34,.24,.20),pants,.03)
    body.cylinder((0,-.005,1.405),.068,.12,'skin',12)
    body.ellipsoid((0,-.005,1.596),(.125,.118,.154),'skin',20,12)
    body.ellipsoid((0,.012,1.629),(.13,.12,.122),'hair',20,10,True)
    for x in [-.119,.119]:body.ellipsoid((x,-.003,1.594),(.027,.023,.043),'skin',10,7)
    body.ellipsoid((0,-.124,1.595),(.027,.028,.037),'skin',8,6)
    # The collar and simple jacket seam survive a miniature display size.
    body.box((0,-.131,1.27),(.025,.014,.30),'cream')
    for x in [-.075,.075]:body.box((x,-.133,1.365),(.07,.02,.04),'cloth-cream')
    body.object('body',collection,root)
    for side, sign in [('left',-1),('right',1)]:
        leg=Geometry()
        if seated:
            leg.rod((0,0,0),(0,-.31,-.19),.069,pants,12)
            leg.rod((0,-.31,-.19),(0,-.08,-.49),.058,pants,12)
            leg.rounded_box((0,-.11,-.53),(.145,.26,.095),'rubber',.018)
        else:
            leg.garment([(-.648,.060,.068),(-.368,.071,.077),
                         (-.338,.073,.082),(-.012,.080,.086)],pants,12)
            leg.rounded_box((0,-.042,-.699),(.15,.285,.105),'rubber',.018)
        leg.object('leg-'+side,collection,root,(sign*.099,0,.754))
        arm=Geometry()
        if seated:
            elbow=(sign*.015,-.24,-.18)
            hand=(sign*.005,-.49,-.32)
        elif load:
            elbow=(sign*.035,-.20,-.31)
            hand=(sign*.018,-.43,-.38)
        else:
            elbow=(sign*.025,-.005,-.30)
            hand=(sign*.026,-.04,-.54)
        arm.rod((0,0,0),elbow,.065,shirt,12)
        arm.rod(elbow,hand,.053,shirt,12)
        arm.ellipsoid((hand[0],hand[1],hand[2]-.027),(.054,.046,.065),'skin',12,7)
        if bag and side=='right':
            arm.rounded_box((.035,-.02,-.79),(.29,.17,.28),'wood',.025)
            arm.ring((.035,-.02,-.61),.058,.043,.05,'wood',12)
        arm.object('arm-'+side,collection,root,(sign*.23,0,1.34))
    if load:
        luggage=Geometry()
        luggage.rounded_box((0,-.43,.93),(.50,.36,.37),'wood',.035)
        luggage.box((0,-.617,.94),(.025,.013,.36),'cream')
        luggage.box((0,-.43,1.125),(.50,.035,.013),'cream')
        luggage.object('carried-parcel',collection,root)
    return collection,root

human('resident','cloth-cream',bag=True)
human('commuter','navy')
human('porter','sage',load=True)

collection,root=human('vendor','cloth-coral')
g=Geometry()
g.rounded_box((0,-.96,.76),(1.75,.66,.14),'wood',.045)
for x in [-.71,.71]:
    for y in [-1.19,-.73]:g.box((x,y,.35),(.10,.10,.7),'wood')
for x in [-.56,0,.56]:
    g.box((x,-.96,.865),(.48,.52,.13),'cream')
    for i in range(3):
        for j in range(2):
            g.ellipsoid((x-.15+i*.15,-1.10+j*.23,.965),(.065,.072,.054),'produce-green' if x==0 else 'produce',8,6)
g.rounded_box((-.76,-.94,.2),(.40,.45,.36),'wood',.02)
g.object('vendor-table',collection,root)

collection,root=human('cyclist','sage',seated=True)
g=Geometry()
rotation=Matrix.Rotation(math.pi/2,4,'Y')
for y in [-.72,.72]:
    g.cylinder((0,y,.355),.355,.045,'rubber',24,rotation)
    g.cylinder((0,y,.355),.315,.047,'metal',24,rotation)
    g.cylinder((0,y,.355),.295,.05,'glass',24,rotation)
    for i in range(12):
        a=2*math.pi*i/12
        g.rod((.031,y,.355),(.031,y+.29*math.cos(a),.355+.29*math.sin(a)),.008,'frame',6)
g.rod((0,.72,.355),(0,.13,.69),.028,'brick')
g.rod((0,.13,.69),(0,0,.30),.028,'brick')
g.rod((0,0,.30),(0,.72,.355),.028,'brick')
g.rod((0,0,.30),(0,-.44,.77),.028,'brick')
g.rod((0,-.44,.77),(0,.13,.69),.028,'brick')
g.rod((0,-.72,.355),(0,-.44,.77),.028,'metal')
g.rod((0,-.44,.77),(0,-.52,1.0),.02,'metal')
g.rod((-.24,-.52,1.0),(.24,-.52,1.0),.021,'rubber')
g.rounded_box((0,.13,.80),(.18,.25,.055),'rubber',.015)
g.box((0,.69,.77),(.28,.34,.035),'metal')
g.object('bicycle',collection,root)

collection,root=asset('bus')
g=Geometry()
g.rounded_box((0,0,1.80),(2.48,10,2.76),'cream',.15)
g.rounded_box((0,0,1.18),(2.51,9.97,1.19),'blue',.09)
for side in [-1,1]:
    for i in range(8):
        y=-3.8+i*1.10
        g.rounded_box((side*1.256,y,2.28),(.035,.96,1.30),'glass',.01)
        g.box((side*1.277,y,2.70),(.018,.84,.07),'glass-light')
    g.box((side*1.273,0,1.79),(.035,9.56,.14),'cream')
    g.box((side*1.26,0,.70),(.035,9.56,.12),'cream')
    for y in [-3.14,3.09]:
        wheelrotation=Matrix.Rotation(math.pi/2,4,'Y')
        g.cylinder((side*1.255,y,.565),.555,.26,'rubber',24,wheelrotation)
        g.cylinder((side*1.403,y,.565),.30,.045,'metal',16,wheelrotation)
        g.cylinder((side*1.43,y,.565),.115,.05,'rubber',12,wheelrotation)
        for i in range(6):
            angle=2*math.pi*i/6
            g.cylinder((side*1.46,y+.19*math.cos(angle),.565+.19*math.sin(angle)),.025,.026,'cream',6,wheelrotation)
g.rounded_box((0,-5.023,2.29),(2.18,.028,1.27),'glass',.025)
g.box((0,-5.052,2.29),(.055,.028,1.27),'frame')
g.rounded_box((0,5.023,2.29),(2.18,.025,1.20),'glass',.025)
for x in [-.84,.84]:
    g.rounded_box((x,-5.054,1.1),(.27,.045,.17),'lamp',.018)
    g.rounded_box((x,5.044,1.13),(.13,.042,.29),'red',.015)
g.box((0,-5.07,.83),(2.2,.13,.12),'metal')
g.box((0,-5.058,1.13),(.83,.035,.22),'glass')
for z in [1.07,1.14,1.21]:g.box((0,-5.083,z),(.78,.016,.023),'metal')
for y in [-3.8,-1.9,0,1.9,3.8]:g.box((0,y,3.19),(1.9,.045,.025),'roof')
g.rounded_box((0,0,3.22),(1.25,1.1,.11),'cream',.04)
# Doors are a generic composite, not an identified bus model or service.
g.box((1.28,-3.87,1.7),(.025,.96,1.97),'glass')
for y in [-4.35,-3.87,-3.39]:g.box((1.298,y,1.7),(.025,.038,1.97),'frame')
for side in [-1,1]:
    g.rod((side*1.1,-4.90,2.57),(side*1.61,-5.15,2.57),.032,'metal')
    g.rounded_box((side*1.62,-5.16,2.42),(.16,.10,.34),'glass',.025)
g.object('bus-body',collection,root)

collection,root=asset('shelter')
g=Geometry()
for x in [-1.75,1.75]:
    for y in [-.50,.50]:g.box((x,y,1.12),(.095,.095,2.24),'metal')
g.rounded_box((0,0,2.27),(3.8,1.45,.15),'roof',.06)
g.box((0,.54,1.23),(3.5,.045,1.7),'glass-light')
g.box((0,.60,1.23),(.055,.03,1.7),'frame')
g.box((0,.47,.65),(3.20,.10,.08),'metal')
for y in [.13,.26,.39]:g.box((0,y,.50),(2.95,.10,.06),'wood')
for x in [-1.3,1.3]:g.box((x,.25,.25),(.065,.40,.50),'metal')
g.object('bus-shelter',collection,root)

collection,root=asset('streetlamp')
g=Geometry()
g.cylinder((0,0,.08),.22,.16,'concrete',16)
g.cylinder((0,0,2.65),.055,5.15,'metal',12,radius_top=.04)
g.rod((0,0,4.90),(0,-.35,5.35),.045,'metal')
g.rod((0,-.35,5.35),(0,-.90,5.42),.045,'metal')
g.ellipsoid((0,-.91,5.42),(.17,.30,.095),'frame',12,8)
g.ellipsoid((0,-.91,5.38),(.14,.25,.025),'lamp',12,6)
g.object('lamp',collection,root)

collection,root=asset('tree')
g=Geometry()
g.cylinder((0,0,1.65),.115,3.3,'bark',12,radius_top=.07)
for a,b in [((0,0,2.1),(.72,.12,3.45)),((0,0,2.4),(-.73,-.32,3.7)),((0,0,2.8),(.12,-.67,4.2))]:g.rod(a,b,.07,'bark')
rng=random.Random(17)
for i in range(28):
    # Interlocking small clusters give a varied canopy rather than a single blob.
    angle=i*2.399963
    level=i%4
    radius=.94 if level<3 else .49
    x=radius*math.cos(angle)+rng.uniform(-.14,.14)
    y=radius*math.sin(angle)+rng.uniform(-.14,.14)
    z=3.30+level*.47+rng.uniform(-.1,.1)
    scale=.57+rng.uniform(-.08,.09)
    g.ellipsoid((x,y,z),(scale,scale*.88,scale*1.04),'leaf-light' if i%4==0 else 'leaf',10,7)
g.ellipsoid((0,0,3.94),(.91,.81,1.04),'leaf',12,8)
g.object('tree-canopy',collection,root)

collection,root=asset('bench')
g=Geometry()
for x in [-.72,.72]:
    for y in [-.21,.21]:g.box((x,y,.24),(.07,.07,.48),'metal')
for y in [-.19,-.065,.065,.19]:g.rounded_box((0,y,.49),(1.9,.105,.075),'wood',.012)
for z in [.71,.85,.99]:g.rounded_box((0,.26,z),(1.9,.055,.11),'wood',.013)
for x in [-.76,.76]:g.box((x,.26,.75),(.045,.055,.59),'metal')
g.object('bench',collection,root)

# Export one asset at a time. Selection includes the root and all children.
exported=[]
for name,(collection,root) in assets.items():
    bpy.ops.object.select_all(action='DESELECT')
    for obj in collection.objects: obj.select_set(True)
    bpy.context.view_layer.objects.active=root
    path=OUTPUT/(name+'.glb')
    bpy.ops.export_scene.gltf(filepath=str(path),export_format='GLB',use_selection=True,
        export_yup=True,export_animations=False,export_cameras=False,export_lights=False,
        export_texcoords=False,export_extras=True,export_shared_accessors=True,
        export_copyright='NORTH original procedural illustrative assets; photo-informed buildings under CC BY-SA 4.0. See diorama-production.json.')
    scene.view_layers[0].update()
    points=[obj.matrix_world @ Vector(corner) for obj in collection.objects if obj.type=='MESH' for corner in obj.bound_box]
    mins=[min(p[i] for p in points) for i in range(3)]
    maxs=[max(p[i] for p in points) for i in range(3)]
    exported.append({'id':name,'file':str(path.relative_to(ROOT)),
        'bytes':path.stat().st_size,'blenderBounds':{'min':mins,'max':maxs},
        'gltfBounds':{'min':[mins[0],mins[2],-maxs[1]],'max':[maxs[0],maxs[2],-mins[1]]},
        'meshParts':sum(o.type=='MESH' for o in collection.objects)})

# A shared orthographic camera and identical light rig for review thumbnails.
studio=bpy.data.collections.new('NORTH_review_studio')
scene.collection.children.link(studio)
camera_data=bpy.data.cameras.new('NORTH_orthographic_review')
camera=bpy.data.objects.new('NORTH_orthographic_review',camera_data)
studio.objects.link(camera)
camera_data.type='ORTHO'
camera_data.clip_start=.01
camera_data.clip_end=2000
scene.camera=camera

def area_light(name,location,energy,size):
    data=bpy.data.lights.new(name,'AREA')
    data.energy=energy
    data.shape='DISK'
    data.size=size
    obj=bpy.data.objects.new(name,data)
    studio.objects.link(obj)
    obj.location=location
    obj.rotation_euler=(Vector((0,0,3))-obj.location).to_track_quat('-Z','Y').to_euler()
    return obj
key=area_light('NORTH_soft_key',(-25,-30,55),18000,32)
fill=area_light('NORTH_soft_fill',(30,-5,25),8500,24)
sun_data=bpy.data.lights.new('NORTH_daylight','SUN')
sun_data.energy=2.0
sun_data.angle=.15
sun=bpy.data.objects.new('NORTH_daylight',sun_data)
studio.objects.link(sun)
sun.rotation_euler=(.45,-.55,-.5)
floor=Geometry()
floor.box((0,0,-.07),(220,220,.10),'cream')
floor_obj=floor.object('NORTH_review_floor',studio)

for name,(collection,root) in assets.items():
    for other,(other_collection,_) in assets.items():
        for obj in other_collection.objects:obj.hide_render=other!=name
    record=next(r for r in exported if r['id']==name)
    minimum=record['blenderBounds']['min']; maximum=record['blenderBounds']['max']
    target=Vector(((minimum[0]+maximum[0])/2,(minimum[1]+maximum[1])/2,(minimum[2]+maximum[2])/2))
    size=max(maximum[i]-minimum[i] for i in range(3))
    camera.location=target+Vector((size*1.10,-size*1.75,size*1.10))
    camera.rotation_euler=(target-camera.location).to_track_quat('-Z','Y').to_euler()
    camera_data.ortho_scale=size*1.42
    scene.render.filepath=str(RENDERS/(name+'.png'))
    bpy.ops.render.render(write_still=True)

# Keep an arranged source overview instead of leaving overlapping origin models.
for i,(name,(collection,root)) in enumerate(assets.items()):
    root.location=(i%4*38,i//4*45,0)
    for obj in collection.objects:obj.hide_render=False
floor_obj.hide_render=True
camera.location=(140,-210,200)
camera.rotation_euler=(Vector((48,40,12))-camera.location).to_track_quat('-Z','Y').to_euler()
camera_data.ortho_scale=195
scene.render.filepath=str(RENDERS/'asset-overview.png')
bpy.ops.render.render(write_still=True)
bpy.ops.wm.save_as_mainfile(filepath=str(SOURCE),compress=True)
(SOURCE.parent/'export-report.json').write_text(json.dumps({'assets':exported,'totalBytes':sum(r['bytes'] for r in exported)},indent=2))
result={'scene':SCENE_NAME,'blend':str(SOURCE),'assets':exported,'totalBytes':sum(r['bytes'] for r in exported)}
