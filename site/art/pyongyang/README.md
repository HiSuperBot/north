# Pyongyang miniature-diorama asset production

This source package builds genuine reusable mesh assets for NORTH's Pyongyang
street view. The render contact sheet shows the exported geometry, rather than
the earlier image-generation style concept. Assets use warm plaster, muted
coral, desaturated blue, opaque recessed glazing, and matte materials.

## Reproduce

Open Blender 5.2 with Blender MCP connected, then run `build_diorama.py` through
the add-on's Python execution tool. The script creates its own
`NORTH_Pyongyang_Diorama` scene and preserves the existing scene. Its named
production scene is rebuilt on subsequent runs. It can also run in Blender's
background mode:

```sh
blender --background --python site/art/pyongyang/build_diorama.py
python3 site/art/pyongyang/prepare_thumbnails.py
python3 site/art/pyongyang/validate_exports.py
```

The thumbnail preparation script requires Pillow; use the desktop workspace's
bundled Python runtime when working inside Codex. No Python dependency is added
to the web application. Blender renders are written to the ignored `renders/`
directory. Only compact WebP previews are served from `public/`.

The saved `.blend` contains all model collections, a shared orthographic review
camera and a daylight rig. `export-report.json` records the final GLB dimensions
and sizes. See `../../content/diorama-production.json` for source dates,
attribution, limits, asset review, and rights.

## Runtime contract

- Units are meters. glTF is Y-up, ground is local Y=0, and front/travel direction
  is local +Z. Blender source equivalents are Z-up and forward -Y.
- Fixed models contain one mesh with 2–10 material groups. Buildings have real
  window recesses, balcony geometry and roof ledges; they do not use image planes.
- Humans have five articulated mesh parts, with an additional mesh for a parcel,
  vendor table or bicycle where needed. The stable `motionPart` glTF extras
  identify `arm-left`, `arm-right`, `leg-left`, and `leg-right`; Blender may suffix
  object names when several assets share a scene.
- GLBs embed geometry and materials, with no textures or external URLs. The
  complete 13-model set is approximately 2 MB uncompressed. The `.blend` source,
  rendering proofs and scripts are excluded from published application assets.
- Ground contact bounds include a small positive tolerance on shoes/tires and
  floating-point tolerances below one micrometer on the bicycle mesh.

## Interpretation

The 2018 photograph supports the cylindrical balcony silhouette. It does not
measure the modeled 36-meter height, 28-meter width, simplified floor count,
windows, entrance or roof. The runtime composes three cylinder modules at centers
derived from the mapped clover-shaped footprint; the module is not stretched into
one cylinder covering the entire three-tower building. The runtime's 36/48/36-meter
tower heights remain illustrative. The generic apartment block and low storefront are
reusable visual modules, not verified copies of individual buildings. The
storefront does not reproduce the photographed Kwangbok Department Store.

The blue-and-cream bus is an illustrative composite, with no model, operator,
route or timetable identification. People, clothing details, possessions,
produce, vegetation and street furniture are fictional visual elements. No
recognizable real person or documentary deployment is recreated.
