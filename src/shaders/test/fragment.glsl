varying vec2 vUv;
varying float vOpacity;

void main() {
    vec2 uv = vec2(gl_PointCoord.x, 1.0 - gl_PointCoord.y);
    vec2 centerUv = 2.0 * uv - 1.0;
    vec3 originalColor = vec3(4.0/255.0, 10.0/255.0, 20.0/255.0);
    vec4 color = vec4(0.08/length(centerUv));
    color.rgb = min(vec3(10.0), color.rgb);
    color.rgb *= originalColor*420.0;
    color *= vOpacity;
    color.a = min(1.0, color.a)*10.0;
//    float disc = 1.0 - length(centerUv);

//    float alpha = 1.0 - step(0.5, length(gl_PointCoord - vec2(0.5)));
    gl_FragColor = vec4(color.rgb, color.a);

}