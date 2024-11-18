let width, height; // 시뮬레이션 너비와 높이
let actualWidth, actualHeight; // 실제 화면 너비와 높이
const scale = 3.5; // 스케일값

let obstaclePosition = [0,0]; // 장애물 위치
const obstacleRad = 20; // 장애물 반지름
let movingObstacle = false; // 장애물 움직이는지 여부

let lastMouseCoordinates =  [0,0]; // 마지막 마우스 좌표
let mouseCoordinates =  [0,0]; // 현재 마우스 좌표
let mouseEnable = false; // 마우스 입력 활성화 여부 

let paused = false; // 창 크기 조정 중 일시 정지 상태

const dt = 1; // 시간 간격
const dx = 1; // 공간 간격
const nu = 1; // 점성 계수
const rho = 1; // 밀도

var GPU;

window.onload = initGL; // 페이지 로드 시 initGL 함수 호출

function initGL() {
    canvas = document.getElementById("glcanvas"); // 캔버스 요소 가져오기

    // canvas에 마우스 및 터치 이벤트 핸들러 설정
    canvas.onmousemove = onMouseMove;
    canvas.ontouchmove = onTouchMove;
    canvas.onmousedown = onMouseDown;
    canvas.onmouseup = onMouseUp;

    // 창 크기 조정 시 onResize 함수 호출
    window.onresize = onResize;

    // GPU 연산 초기화
    GPU = initGPUMath();

    // OpenGL Shading Language programs 셋업
    // advectVel : 프로그램 이름 설정
    // 2d-vertex-shader : vertex shader의 소스코드/ID
    // advectShaderVel : 프래그먼트 셰이더의 소스코드/ID
    GPU.createProgram("advectVel", "2d-vertex-shader", "advectShaderVel");
    GPU.setUniformForProgram("advectVel", "u_dt", dt, "1f"); // u_dt(변수), dt(값), 1f(타입,단일 부동소수점)
    GPU.setUniformForProgram("advectVel", "u_velocity", 0, "1i"); // u_velocity(변수), 0(값), 1i(타입,단일 정수)
    GPU.setUniformForProgram("advectVel", "u_material", 1, "1i"); // u_material(변수), 1(값), 1i(타입,단일 정수)

    // advectMat
    GPU.createProgram("advectMat", "2d-vertex-shader", "advectShaderMat");
    GPU.setUniformForProgram("advectMat", "u_dt", dt, "1f");
    GPU.setUniformForProgram("advectMat", "u_velocity", 0, "1i");
    GPU.setUniformForProgram("advectMat", "u_material", 1, "1i");

    // gradientSubtraction
    GPU.createProgram("gradientSubtraction", "2d-vertex-shader", "gradientSubtractionShader");
    GPU.setUniformForProgram("gradientSubtraction", "u_const", 0.5/dx, "1f");//dt/(2*rho*dx)
    GPU.setUniformForProgram("gradientSubtraction", "u_velocity", 0, "1i");
    GPU.setUniformForProgram("gradientSubtraction", "u_pressure", 1, "1i");

    // diverge
    GPU.createProgram("diverge", "2d-vertex-shader", "divergenceShader");
    GPU.setUniformForProgram("diverge", "u_const", 0.5/dx, "1f");//-2*dx*rho/dt
    GPU.setUniformForProgram("diverge", "u_velocity", 0, "1i");

    // force
    GPU.createProgram("force", "2d-vertex-shader", "forceShader");
    GPU.setUniformForProgram("force", "u_dt", dt, "1f");
    GPU.setUniformForProgram("force", "u_velocity", 0, "1i");

    // jacobi
    GPU.createProgram("jacobi", "2d-vertex-shader", "jacobiShader");
    GPU.setUniformForProgram("jacobi", "u_b", 0, "1i");
    GPU.setUniformForProgram("jacobi", "u_x", 1, "1i");

    // render
    GPU.createProgram("render", "2d-vertex-shader", "2d-render-shader");
    GPU.setUniformForProgram("render", "u_material", 0, "1i");

    // boundary
    GPU.createProgram("boundary", "2d-vertex-shader", "boundaryConditionsShader");
    GPU.setUniformForProgram("boundary", "u_texture", 0, "1i");

    // resetVelocity
    GPU.createProgram("resetVelocity", "2d-vertex-shader", "resetVelocityShader");

    // 초기화
    resetWindow();

    // 렌더링 수행
    render();
}

// 창 화면 조절시 paused 값 true 로 지정
// render 함수에서 resetWindow 함수로 넘어감.
function onResize(){
    paused = true;
}

function resetWindow(){

    // 시뮬레이션 영역 너비 & 높이 
    actualWidth = canvas.clientWidth;
    actualHeight = canvas.clientHeight;
    console.log(`${'-'.repeat(20)} resetWindow() 호출 ${'-'.repeat(20)}`)
    console.log(`시뮬레이션 영역 너비 [actualWidth] : ${actualWidth}`);
    console.log(`시뮬레이션 영역 높이 [actualHeight] : ${actualHeight}`);

    // 스케일값 지정 (시뮬레이션의 해상도를 조절하는 역할)
    // -> 값이 클수록 작은 영역에 대해 유체 해석함. GPU, CPU 사용량 감소
    var maxDim = Math.max(actualHeight, actualWidth);
    var scale = maxDim/200;
    console.log(`시뮬레이션 스케일값 [scale] : ${scale}`);

    width = Math.floor(actualWidth/scale);
    height = Math.floor(actualHeight/scale);
    console.log(`시뮬레이션 계산 너비 [width] : ${width}`);
    console.log(`시뮬레이션 계산 높이 [height] : ${height}`);

    // 장애물 초기 위치 (너비의 1/10, 높이의 1/2)
    obstaclePosition = [actualWidth/10, actualHeight/2];
    console.log(`obstaclePosition : ${obstaclePosition}`);

    // 드로잉 버퍼 사이즈를 실제 값과 맞춤
    canvas.width = actualWidth;
    canvas.height = actualHeight;

    GPU.setSize(width, height);
    GPU.setProgram("advectVel");
    GPU.setUniformForProgram("advectVel" ,"u_textureSize", [width, height], "2f");
    GPU.setUniformForProgram("advectVel" ,"u_scale", 1, "1f");
    GPU.setProgram("advectMat");
    GPU.setUniformForProgram("advectMat" ,"u_textureSize", [actualWidth, actualHeight], "2f");
    GPU.setUniformForProgram("advectMat" ,"u_scale", width/actualWidth, "1f");
    GPU.setProgram("gradientSubtraction");
    GPU.setUniformForProgram("gradientSubtraction" ,"u_textureSize", [width, height], "2f");
    GPU.setProgram("diverge");
    GPU.setUniformForProgram("diverge" ,"u_textureSize", [width, height], "2f");
    GPU.setProgram("force");
    GPU.setUniformForProgram("force", "u_reciprocalRadius", 0.1*scale, "1f");
    GPU.setUniformForProgram("force" ,"u_textureSize", [width, height], "2f");
    GPU.setProgram("jacobi");
    GPU.setUniformForProgram("jacobi" ,"u_textureSize", [width, height], "2f");
    GPU.setProgram("render");
    GPU.setUniformForProgram("render" ,"u_obstaclePosition", [obstaclePosition[0], obstaclePosition[1]], "2f");
    GPU.setUniformForProgram("render" ,"u_textureSize", [actualWidth, actualHeight], "2f");
    GPU.setUniformForProgram("render" ,"u_obstacleRad", obstacleRad, "1f");
    GPU.setProgram("boundary");
    GPU.setUniformForProgram("boundary" ,"u_textureSize", [width, height], "2f");
    GPU.setUniformForProgram("boundary" ,"u_obstaclePosition", [obstaclePosition[0]*width/actualWidth, obstaclePosition[1]*height/actualHeight], "2f");
    GPU.setUniformForProgram("boundary" ,"u_obstacleRad", obstacleRad*width/actualWidth, "1f");

    GPU.initTextureFromData("velocity", width, height, "HALF_FLOAT", null, true);//velocity
    GPU.initFrameBufferForTexture("velocity", true);
    GPU.initTextureFromData("nextVelocity", width, height, "HALF_FLOAT", null, true);//velocity
    GPU.initFrameBufferForTexture("nextVelocity", true);

    GPU.step("resetVelocity", [], "velocity");
    GPU.step("resetVelocity", [], "nextVelocity");

    GPU.initTextureFromData("velocityDivergence", width, height, "HALF_FLOAT", new Uint16Array(width*height*4), true);
    GPU.initFrameBufferForTexture("velocityDivergence", true);
    GPU.initTextureFromData("pressure", width, height, "HALF_FLOAT", new Uint16Array(width*height*4), true);
    GPU.initFrameBufferForTexture("pressure", true);
    GPU.initTextureFromData("nextPressure", width, height, "HALF_FLOAT", new Uint16Array(width*height*4), true);
    GPU.initFrameBufferForTexture("nextPressure", true);
    GPU.initTextureFromData("material", actualWidth, actualHeight, "HALF_FLOAT", null, true);//material
    GPU.initFrameBufferForTexture("material", true);
    GPU.initTextureFromData("nextMaterial", actualWidth, actualHeight, "HALF_FLOAT", null, true);//material
    GPU.initFrameBufferForTexture("nextMaterial", true);

    paused = false;
    console.log(`${'-'.repeat(20)} resetWindow() 종료 ${'-'.repeat(20)}`)
}

function render(){

    // paused 가 아니면 (paused 인 경우는 화면 리사이즈만 해당됨.)
    if (!paused) {

        // 속도 설정
        GPU.setSize(width, height);
        GPU.step("advectVel", ["velocity", "velocity"], "nextVelocity");
        GPU.setProgram("boundary");
        if (movingObstacle) GPU.setUniformForProgram("boundary" ,"u_obstaclePosition", [obstaclePosition[0]*width/actualWidth, obstaclePosition[1]*height/actualHeight], "2f");
        GPU.setUniformForProgram("boundary", "u_scale", -1, "1f");
        GPU.step("boundary", ["nextVelocity"], "velocity");

        //apply force
        if (mouseEnable){
            GPU.setProgram("force");
            GPU.setUniformForProgram("force", "u_mouseCoord", [mouseCoordinates[0]*width/actualWidth, mouseCoordinates[1]*height/actualHeight], "2f");
            GPU.setUniformForProgram("force", "u_mouseDir", [2*(mouseCoordinates[0]-lastMouseCoordinates[0])/scale,
                2*(mouseCoordinates[1]-lastMouseCoordinates[1])/scale], "2f");
            GPU.step("force", ["velocity"], "nextVelocity");
             GPU.setProgram("boundary");
            GPU.setUniformForProgram("boundary", "u_scale", -1, "1f");
            GPU.step("boundary", ["nextVelocity"], "velocity");
        }

        // compute pressure
        GPU.step("diverge", ["velocity"], "velocityDivergence");//calc velocity divergence
        GPU.setProgram("jacobi");
        GPU.setUniformForProgram("jacobi", "u_alpha", -dx*dx, "1f");
        GPU.setUniformForProgram("jacobi", "u_reciprocalBeta", 1/4, "1f");
        for (var i=0;i<20;i++){
            GPU.step("jacobi", ["velocityDivergence", "pressure"], "nextPressure");//diffuse velocity
            GPU.step("jacobi", ["velocityDivergence", "nextPressure"], "pressure");//diffuse velocity
        }
        GPU.setProgram("boundary");
        GPU.setUniformForProgram("boundary", "u_scale", 1, "1f");
        GPU.step("boundary", ["pressure"], "nextPressure");
        GPU.swapTextures("nextPressure", "pressure");

        // subtract pressure gradient
        GPU.step("gradientSubtraction", ["velocity", "pressure"], "nextVelocity");
        GPU.setProgram("boundary");
        GPU.setUniformForProgram("boundary", "u_scale", -1, "1f");
        GPU.step("boundary", ["nextVelocity"], "velocity");

        // move material
        GPU.setSize(actualWidth, actualHeight);
        GPU.step("advectMat", ["velocity", "material"], "nextMaterial");
        if (movingObstacle) {
            GPU.setProgram("boundary");
            GPU.setUniformForProgram("boundary", "u_obstaclePosition", 
                [obstaclePosition[0]*width/actualWidth, 
                 obstaclePosition[1]*height/actualHeight], "2f");
            
            GPU.setProgram("render");
            GPU.setUniformForProgram("render", "u_obstaclePosition", 
                [obstaclePosition[0], obstaclePosition[1]], "2f");
        }
        GPU.step("render", ["nextMaterial"]);
        GPU.swapTextures("nextMaterial", "material");

    } else resetWindow();

    window.requestAnimationFrame(render);
}

// 장애물 위치 업데이트 함수
function updateObstaclePosition(){
    if (movingObstacle) obstaclePosition = mouseCoordinates; // 장애물이 움직이고 있는경우, 장애물의 위치를 현재 마우스 좌표로 업데이트
}

// 마우스 이동 이벤트 핸들러
function onMouseMove(e){
    lastMouseCoordinates = mouseCoordinates; // 마지막 마우스 좌표값 <- 현재 마우스 좌표값
    mouseCoordinates = [e.clientX-63, actualHeight-e.clientY+186]; // 현재 마우스 좌표값 <- 위치값 수정 (container 태그안에 넣었기 때문에 위치변경되었음)
    updateObstaclePosition(); // 장애물 위치 업데이트
}

// 터치 이동 이벤트 핸들러
function onTouchMove(e){
    e.preventDefault(); // 기본 터치 동작 방지 (스크롤 방지등)
    lastMouseCoordinates = mouseCoordinates; // 마지막 마우스 좌표값 <- 현재 마우스 좌표값
    mouseCoordinates = [touch.pageX, actualHeight-touch.pageY]; // 현재 터치 좌표로 업데이트
    updateObstaclePosition();
}

// 마우스 버튼 눌림 이벤트 핸들러
function onMouseDown(){

    // 마우스 좌표와 장애물 좌표 간의 거리 계산
    var distToObstacle = [mouseCoordinates[0]-obstaclePosition[0], mouseCoordinates[1]-obstaclePosition[1]];

    // 장애물 반지름 내에 마우스가 있는지 확인
    if (distToObstacle[0]*distToObstacle[0] + distToObstacle[1]*distToObstacle[1] < obstacleRad*obstacleRad){
        movingObstacle = true; // 장애물 움직임 O
        mouseEnable = false; // 마우스 움직임 O
    } else {
        mouseEnable = true; // 마우스 움직임 O
        movingObstacle = false; // 장애물 움직임 X
    }
}

// 마우스 버튼 뗌 이벤트 핸들러
function onMouseUp(){
    movingObstacle = false; // 장애물 움직임 X
    mouseEnable = false; // 마우스 움직임 X
}