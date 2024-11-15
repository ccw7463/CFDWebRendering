function resetWindow(){

    actualWidth = body.clientWidth;
    actualHeight = body.clientHeight;

    var maxDim = Math.max(actualHeight, actualWidth);
    var scale = maxDim/200;

    width = Math.floor(actualWidth/scale);
    height = Math.floor(actualHeight/scale);

    obstaclePosition = [actualWidth/10, actualHeight/2];

    canvas.width = actualWidth;
    canvas.height = actualHeight;
    canvas.clientWidth = body.clientWidth;
    canvas.clientHeight = body.clientHeight;

    // GPU.setSize(width, height);

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

    // var velocity = new Uint16Array(width*height*4);
    // for (var i=0;i<height;i++){
    //     for (var j=0;j<width;j++){
    //         var index = 4*(i*width+j);
    //         velocity[index] = toHalf(1);
    //     }
    // }
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

    // var numCols = Math.floor(actualHeight/10);
    // if (numCols%2 == 1) numCols--;
    // var numPx = actualHeight/numCols;

    // var material = new Uint16Array(actualWidth*actualHeight*4);
    // for (var i=0;i<actualHeight;i++){
    //     for (var j=0;j<actualWidth;j++){
    //         var index = 4*(i*actualWidth+j);
    //         if (j==0 && Math.floor((i-2)/numPx)%2==0) material[index] = toHalf(1.0);
    //     }
    // }
    GPU.initTextureFromData("material", actualWidth, actualHeight, "HALF_FLOAT", null, true);//material
    GPU.initFrameBufferForTexture("material", true);
    GPU.initTextureFromData("nextMaterial", actualWidth, actualHeight, "HALF_FLOAT", null, true);
    GPU.initFrameBufferForTexture("nextMaterial", true);

    paused = false;

    // 알파 블렌딩 활성화
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    // 배경색 설정
    gl.clearColor(0.95, 0.95, 1.0, 1.0); // 연한 하늘색 배경
}

