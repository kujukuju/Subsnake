
class HueShiftFilter extends PIXI.Filter {
    static VERT_SRC = `
        attribute vec2 aVertexPosition;
        
        uniform mat3 projectionMatrix;
        
        varying vec2 vTextureCoord;
        
        uniform vec4 inputSize;
        uniform vec4 outputFrame;
        
        vec4 filterVertexPosition(void) {
            vec2 position = aVertexPosition * max(outputFrame.zw, vec2(0.)) + outputFrame.xy;
            
            return vec4((projectionMatrix * vec3(position, 1.0)).xy, 0.0, 1.0);
        }
        
        vec2 filterTextureCoord(void) {
            return aVertexPosition * (outputFrame.zw * inputSize.zw);
        }
        
        void main(void) {
            vTextureCoord = filterTextureCoord();
            
            gl_Position = filterVertexPosition();
        }
    `.split('\n').reduce((c, a) => c + a.trim() + '\n');

    // players at layer 0 should be 0
    // players at layer 1 should be 0.1
    // walls that are supposed to clip layer 0 should be 0.05
    // walls that are supposed to clip layer 1 should be 0.15
    static FRAG_SRC = `
        varying vec2 vTextureCoord;
        
        uniform sampler2D uSampler;
        uniform float uHue;

        vec3 rgb2hsv(const vec3 c) {
            vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
            vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
            vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));

            float d = q.x - min(q.w, q.y);
            float e = 1.0e-10;
            return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
        }

        vec3 hsv2rgb(const vec3 c) {
            vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
            vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
            return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
        }
        
        void main(void) {
            vec4 samplerColor = texture2D(uSampler, vTextureCoord);

            vec3 hsv = rgb2hsv(samplerColor.rgb);
            hsv.r = uHue;

            vec3 rgb = hsv2rgb(hsv);
            
            gl_FragColor = vec4(rgb, samplerColor.a);
        }
    `.split('\n').reduce((c, a) => c + a.trim() + '\n');

    constructor(hue) {
        super(HueShiftFilter.VERT_SRC, HueShiftFilter.FRAG_SRC, {
            uHue: hue,
        });
    }
}
