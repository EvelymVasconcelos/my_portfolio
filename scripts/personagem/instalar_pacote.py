"""Instala no MPFB o pacote de modelos de sistema do MakeHuman (CC0), sem abrir a interface do Blender.

Uso (o caminho do .zip vem depois de "--"):

    flatpak run org.blender.Blender -b --python scripts/personagem/instalar_pacote.py -- \
        ~/Downloads/makehuman-pacotes/makehuman_system_assets_cc0.zip

O Blender do Flatpak tem um /tmp próprio: o .zip precisa estar numa pasta da home. A origem, a versão e o hash do pacote
estão em scripts/personagem/ORIGEM.md.
"""

import hashlib
import sys

import bpy

SHA256 = "b542127a8e25547c7c29c19f2d1d2adb9a664c80396ecd694095dbc8028a0107"


def main():
    zip_path = sys.argv[sys.argv.index("--") + 1]
    with open(zip_path, "rb") as f:
        digest = hashlib.sha256(f.read()).hexdigest()
    if digest != SHA256:
        raise SystemExit(f"Pacote diferente do registrado em ORIGEM.md: {digest}")

    bpy.ops.mpfb.load_pack(filepath=zip_path)

    from bl_ext.blender_org.mpfb.services import AssetService, LocationService

    print("Pacote instalado em", LocationService.get_user_data())
    for subdir, name in [("hair", "bob02"), ("eyes", "high-poly"), ("eyebrows", "eyebrow001"), ("clothes", "female_sportsuit01")]:
        found = AssetService.find_asset_absolute_path(f"{name}/{name}.mhclo", asset_subdir=subdir)
        print(f"  {subdir}/{name}:", "ok" if found else "NÃO ENCONTRADO")


main()
