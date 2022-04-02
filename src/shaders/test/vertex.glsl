attribute float sizes;
attribute float opacity;
varying vec2 vUv;
varying float vOpacity;

void main() {
    vec4 modelPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = 12000.0 * (1.0 / -modelPosition.z);
    gl_Position = projectionMatrix * modelPosition;

    vUv = uv;
    vOpacity = opacity;
}