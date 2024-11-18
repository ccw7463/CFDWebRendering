function initBoilerPlate() {
  /**
   * 셰이더를 컴파일하는 함수
   * @param {WebGLRenderingContext} gl WebGL 컨텍스트
   * @param {string} shaderSource GLSL 셰이더 소스 코드
   * @param {number} shaderType 셰이더 타입 (VERTEX_SHADER 또는 FRAGMENT_SHADER)
   * @returns {WebGLShader} 컴파일된 셰이더
   * @throws {string} 컴파일 실패시 에러 메시지
   */
  function compileShader(gl, shaderSource, shaderType) {
      const shader = gl.createShader(shaderType);
      gl.shaderSource(shader, shaderSource);
      gl.compileShader(shader);

      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
          throw `셰이더 컴파일 실패: ${gl.getShaderInfoLog(shader)}`;
      }

      return shader;
  }

  /**
   * 버텍스와 프래그먼트 셰이더로부터 WebGL 프로그램을 생성
   * @param {WebGLRenderingContext} gl WebGL 컨텍스트
   * @param {WebGLShader} vertexShader 버텍스 셰이더
   * @param {WebGLShader} fragmentShader 프래그먼트 셰이더
   * @returns {WebGLProgram} 생성된 프로그램
   * @throws {string} 링크 실패시 에러 메시지
   */
  function createProgram(gl, vertexShader, fragmentShader) {
      const program = gl.createProgram();
      
      gl.attachShader(program, vertexShader);
      gl.attachShader(program, fragmentShader);
      gl.linkProgram(program);

      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
          throw `프로그램 링크 실패: ${gl.getProgramInfoLog(program)}`;
      }

      return program;
  }

  /**
   * 셰이더 소스로부터 직접 프로그램 생성
   * @param {WebGLRenderingContext} gl WebGL 컨텍스트
   * @param {string} vertexShaderSource 버텍스 셰이더 소스
   * @param {string} fragmentShaderSource 프래그먼트 셰이더 소스
   * @returns {WebGLProgram} 생성된 프로그램
   */
  function createProgramFromSource(gl, vertexShaderSource, fragmentShaderSource) {
      const vertexShader = createShaderFromSource(gl, vertexShaderSource, gl.VERTEX_SHADER);
      const fragmentShader = createShaderFromSource(gl, fragmentShaderSource, gl.FRAGMENT_SHADER);
      return createProgram(gl, vertexShader, fragmentShader);
  }

  /**
   * 2D 렌더링을 위한 기본 버텍스 데이터 로드
   * @param {WebGLRenderingContext} gl WebGL 컨텍스트
   * @param {WebGLProgram} program WebGL 프로그램
   */
  function loadVertexData(gl, program) {
      // 2D 평면을 위한 4개의 버텍스 (-1,-1), (1,-1), (-1,1), (1,1)
      const vertices = new Float32Array([-1,-1, 1,-1, -1,1, 1,1]);
      
      const buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

      const positionLocation = gl.getAttribLocation(program, "a_position");
      gl.enableVertexAttribArray(positionLocation);
      gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
  }

  /**
   * WebGL 텍스처 생성
   * @param {WebGLRenderingContext} gl WebGL 컨텍스트
   * @param {number} width 텍스처 너비
   * @param {number} height 텍스처 높이
   * @param {number} type 텍스처 데이터 타입
   * @param {TypedArray} data 텍스처 데이터
   * @returns {WebGLTexture} 생성된 텍스처
   */
  function makeTexture(gl, width, height, type, data) {
      const texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture);

      // 텍스처 파라미터 설정
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, type, data);

      return texture;
  }

  // 외부에서 사용할 함수들을 노출
  return {
      createProgramFromSource,
      loadVertexData,
      makeTexture
  };
}