import * as THREE from 'three';
export default function perlin(width, height, scale = 10) {
    function fade(t) { return t * t * t * (t * (t * 6 - 15) + 10); }
    function lerp(a, b, t) { return a + t * (b - a); }
    function grad(hash, x, y) { return ((hash & 1) ? x : -x) + ((hash & 2) ? y : -y); }
    let perm = Array.from({length: 256}, (_, i) => i);
    for (let i = 255; i > 0; i--) { let j = Math.floor(Math.random() * (i + 1)); [perm[i], perm[j]] = [perm[j], perm[i]]; }
    function noise(x, y) {
        let X = Math.floor(x) & 255, Y = Math.floor(y) & 255;
        x -= Math.floor(x); y -= Math.floor(y);
        let u = fade(x), v = fade(y);
        let aa = perm[X + perm[Y]] & 3, ab = perm[X + perm[Y + 1]] & 3;
        let ba = perm[X + 1 + perm[Y]] & 3, bb = perm[X + 1 + perm[Y + 1]] & 3;
        return lerp(
            lerp(grad(aa, x, y), grad(ba, x - 1, y), u),
            lerp(grad(ab, x, y - 1), grad(bb, x - 1, y - 1), u),
            v
        );
    }
    const geometry = new THREE.PlaneGeometry(width, height, width - 1, height - 1);
    geometry.rotateX(-Math.PI / 2);
    const pos = geometry.attributes.position;
    for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i) / scale;
        const z = pos.getZ(i) / scale;
        // Minecraft-like terrain: combine multiple octaves and clamp
        let h = 0;
        h += noise(x, z) * 10;
        h += noise(x * 2, z * 2) * 5;
        h += noise(x * 4, z * 4) * 2.5;
        h = Math.max(0, h); // Clamp to ground level
        pos.setY(i, h);
    }
    geometry.computeVertexNormals();
    return geometry;
}
