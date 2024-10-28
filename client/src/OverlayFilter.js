
class OverlayShader extends PIXI.Filter {
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
            
            vec4 vertexPosition = filterVertexPosition();
            gl_Position = vertexPosition;
        }
    `.split('\n').reduce((c, a) => c + a.trim() + '\n');

    // players at layer 0 should be 0
    // players at layer 1 should be 0.1
    // walls that are supposed to clip layer 0 should be 0.05
    // walls that are supposed to clip layer 1 should be 0.15
    static FRAG_SRC = `
        varying vec2 vTextureCoord;
        
        // sampler is the black character
        uniform sampler2D uSampler;
        // clip sampler is the white clippable scene
        uniform sampler2D uClipSampler;
        
        void main(void) {
            vec4 samplerColor = texture2D(uSampler, vTextureCoord);
            vec4 clipColor = texture2D(uClipSampler, vTextureCoord);
            
            vec4 outColor = vec4(0.19215686274, 0.2, 0.31764705882, 1.0) * samplerColor.a * clipColor.a;
            
            gl_FragColor = outColor;
        }
    `.split('\n').reduce((c, a) => c + a.trim() + '\n');

    constructor(clipTexture) {
        super(OverlayShader.VERT_SRC, OverlayShader.FRAG_SRC, {
            uClipSampler: clipTexture,
        });

        this.autoFit = false;
    }
}
