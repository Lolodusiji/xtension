console.log("Hi, I have been injected whoopie!!!");

document.addEventListener("DOMContentLoaded", function () {
    const startRecordingButton = document.getElementById("start_video");
    // const stopRecordingButton = document.getElementById("stopRecording");

    let isRecording = false;

    // Function to send a message to your Chrome extension background script
    function sendMessageToExtension(action) {
        chrome.runtime.sendMessage({ action }, (response) => {
            console.log(response);
        });
    }

    let recorder = null;

    function onAccessApproved(stream) {
        recorder = new MediaRecorder(stream);

        recorder.start();

        recorder.onstop = function () {
            stream.getTracks().forEach(function (track) {
                if (track.readyState === "live") {
                    track.stop();
                }
            });
        };

        recorder.ondataavailable = function (event) {
            let recordedBlob = event.data;
            let url = URL.createObjectURL(recordedBlob);

            let a = document.createElement("a");

            a.style.display = "none";
            a.href = url;
            a.download = "screen-recording.webm";

            document.body.appendChild(a);
            a.click();

            document.body.removeChild(a);

            URL.revokeObjectURL(url);
        };
    }

    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.action === "request_recording") {
            console.log("Requesting recording");

            sendResponse(`Processed: ${message.action}`);

            navigator.mediaDevices.getDisplayMedia({
                audio: true,
                video: {
                    width: 9999999999,
                    height: 9999999999
                }
            }).then((stream) => {
                onAccessApproved(stream);
            });
        }

        if (message.action === "stopvideo") {
            console.log("Stopping video");
            sendResponse(`Processed: ${message.action}`);
            if (!recorder) {
                return console.log("No recorder");
            }

            recorder.stop();
        }
    });
});
