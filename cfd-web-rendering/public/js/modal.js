document.addEventListener('DOMContentLoaded', function() {
    const settingsModal = document.getElementById('settingsModal');
    const speedSlider = document.getElementById('speedSlider');
    const densitySlider = document.getElementById('densitySlider');
    const viscositySlider = document.getElementById('viscositySlider');
    const obstacleRadiusSlider = document.getElementById('obstacleRadiusSlider');

    // 옵션 버튼 이벤트
    document.getElementById('openSettings').addEventListener('click', function () {
        settingsModal.style.display = 'block';
    });

    // 닫기 버튼 이벤트
    document.getElementById('closeSettings').addEventListener('click', function () {
        settingsModal.style.display = 'none';
    });

    // default 버튼 이벤트
    document.getElementById('defaultSettings').addEventListener('click', function () {
        updateSliderValues({
            speed: 1,
            density: 1,
            viscosity: 1,
            obstacleRadius: 30
        });
    });

    // 슬라이더 값 변경 이벤트
    speedSlider.addEventListener('input', function () {
        console.log('Speed:', speedSlider.value);
        // 속도 값 업데이트 로직 추가
    });

    densitySlider.addEventListener('input', function () {
        console.log('Density:', densitySlider.value);
        // 밀도 값 업데이트 로직 추가
    });

    viscositySlider.addEventListener('input', function () {
        console.log('Viscosity:', viscositySlider.value);
        // 점도 값 업데이트 로직 추가
    });

    obstacleRadiusSlider.addEventListener('input', function () {
        console.log('Obstacle Radius:', obstacleRadiusSlider.value);
        updateSliderValues({obstacleRadius: this.value});
    });

    // 업데이트 함수
    const updateSliderValues = (values) => {
        console.log(`values.speed : ${values.speed}`);
        if (values.speed !== undefined) {
            speedSlider.value = values.speed;
            console.log('Speed:', values.speed);
        }
        if (values.density !== undefined) {
            densitySlider.value = values.density;
            console.log('Density:', values.density);
        }
        if (values.viscosity !== undefined) {
            viscositySlider.value = values.viscosity;
            console.log('Viscosity:', values.viscosity);
        }
        if (values.obstacleRadius !== undefined) {
            obstacleRadiusSlider.value = values.obstacleRadius;
            console.log('Obstacle Radius:', values.obstacleRadius);
            window.updateObstacleRadius(values.obstacleRadius);
        }
    };
});