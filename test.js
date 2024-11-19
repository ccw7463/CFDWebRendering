// console.log('20');

// let actualWidth = 910;
// let actualHeight = 300;
// obstacles = [
//     { position: [actualWidth / 10, actualHeight / 2], radius: 20, moving: false },
//     { position: [actualWidth / 2, actualHeight / 2], radius: 15, moving: false } // 새로운 장애물 추가
// ];

// // console.log(obstacles);

// console.log(obstacles[1]['position']);
// obstacles.forEach((obstacle, _) => {
//     console.log(obstacle['radius'])
// });

const boundary_obstaclePositions = [];
boundary_obstaclePositions.push([10, 2]);
boundary_obstaclePositions.push([4, 3]);
let u_obstacleCount = boundary_obstaclePositions.length;
console.log(boundary_obstaclePositions);
console.log(u_obstacleCount);

for (let i = 0; i < 2; i++) { // 최대 10개의 장애물 처리 가능
    console.log(boundary_obstaclePositions[i]);
    console.log("?")
}