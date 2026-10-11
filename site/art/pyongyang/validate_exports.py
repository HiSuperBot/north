"""Validate the web asset contract without Blender or third-party packages."""
from pathlib import Path
import gzip
import hashlib
import json
import struct

ROOT=Path(__file__).resolve().parents[2]
report=json.loads((ROOT/'art/pyongyang/export-report.json').read_text())
validated=[]
for asset in report['assets']:
    path=ROOT/asset['file']
    data=path.read_bytes()
    magic,version,total=struct.unpack_from('<III',data)
    assert (magic,version,total)==(0x46546c67,2,len(data)), path
    json_length,json_type=struct.unpack_from('<II',data,12)
    assert json_type==0x4e4f534a, path
    gltf=json.loads(data[20:20+json_length])
    assert not gltf.get('textures') and not gltf.get('images'), path
    assert all('uri' not in buffer for buffer in gltf.get('buffers',[])), path
    draws=sum(len(mesh['primitives']) for mesh in gltf['meshes'])
    assert draws<=20 and len(data)<2_000_000, path
    assert asset['gltfBounds']['min'][1]>-0.000001, path
    if asset['id'] in ['resident','commuter','porter','vendor','cyclist']:
        rig=[node.get('extras',{}).get('motionPart') for node in gltf['nodes']]
        assert all(part in rig for part in ['arm-left','arm-right','leg-left','leg-right']), path
    for accessor in gltf.get('accessors',[]):
        assert accessor['count']>0, path
    validated.append({'id':asset['id'],'bytes':len(data),
        'gzipBytes':len(gzip.compress(data)),'sha256':hashlib.sha256(data).hexdigest(),
        'meshParts':len(gltf['meshes']),'materialDraws':draws})
assert len(validated)==13 and sum(asset['bytes'] for asset in validated)<8_000_000
(ROOT/'art/pyongyang/export-validation.json').write_text(json.dumps(validated,indent=2)+'\n')
print('Validated 13 self-contained GLBs:',sum(asset['bytes'] for asset in validated),'bytes;',
      'maximum',max(asset['materialDraws'] for asset in validated),'material draws per model.')
