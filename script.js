const video = document.getElementById("video");

Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
    faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
    faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
    faceapi.nets.faceExpressionNet.loadFromUri('/models'),
    faceapi.nets.ageGenderNet.loadFromUri('/models')
]).then(startWebcam);

function startWebcam() {
    navigator.mediaDevices.getUserMedia(
        {
            video: true,
            audio: false,
        })
        .then((stream) => {
            video.srcObject = stream;
        }).catch((error) => {
            console.error(error)
        });
}

startWebcam();

video.addEventListener("play", () => {
    const canvas = faceapi.createCanvasFromMedia(video);
    document.body.append(canvas);
    faceapi.matchDimensions(canvas, { height: video.height, width: video.width });

    setInterval(async () => {
        const detections = await faceapi
            .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks().withFaceExpressions().withAgeAndGender();

        const resizedDetections = faceapi.resizeResults(detections, {
            height: video.height,
            width: video.width,
        });
        canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
        faceapi.draw.drawDetections(canvas, resizedDetections);
        faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
        faceapi.draw.drawFaceExpressions(canvas, resizedDetections);

        detections.forEach(face => {
            const { age, gender, genderProbability } = face
            const genderText = `${gender} - ${genderProbability.toFixed(2)}`
            const ageText = `${Math.round(age)} years`
            const textField = new faceapi.draw.DrawTextField([genderText, ageText], face.detection.box)
            textField.draw(canvas, resizedDetections)
        })



        console.log(detections);
    }, 100);
});