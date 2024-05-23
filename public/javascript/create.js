document.addEventListener('DOMContentLoaded', async function() {
    const video = document.getElementById('video');
    const captureButton = document.getElementById('capture');
    const fileInput = document.getElementById('file-input');
    const canvas = document.getElementById('canvas');
    const photo = document.getElementById('photo');
    const form = document.getElementById('post-form'); // Form element

    let stream;

    // Start the camera automatically
    try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = stream;
        captureButton.disabled = false; // Enable capture button once camera starts
    } catch (err) {
        console.error("Error accessing the camera: ", err);
    }

    // Capture a photo
    captureButton.addEventListener('click', async function() {
        const context = canvas.getContext('2d');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageDataUrl = canvas.toDataURL('image/png');
        
        // Set the captured photo to the img element
        photo.setAttribute('src', imageDataUrl);
        photo.classList.remove('hidden');

        // Stop the video stream and hide the video element
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
        video.classList.add('hidden');

        // Hide the capture button
        captureButton.classList.add('hidden');

        // Convert data URL to Blob
        const response = await fetch(imageDataUrl);
        const blob = await response.blob();

        // Create a file from the blob
        const file = new File([blob], "captured.png", { type: "image/png" });
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        fileInput.files = dataTransfer.files;
    });

    // Handle file input
    fileInput.addEventListener('change', function(event) {
        const file = event.target.files[0];
        const reader = new FileReader();
        
        reader.onload = function(e) {
            photo.setAttribute('src', e.target.result);
            photo.classList.remove('hidden');
            video.classList.add('hidden');
            captureButton.classList.add('hidden');
        };
        
        reader.readAsDataURL(file);
    });

    // Handle form submission
    form.addEventListener('submit', function(event) {
        // Prevent default form submission behavior
        event.preventDefault();

        // Perform any desired actions before submitting the form
        // For example, you can validate input fields or perform additional processing
        
        // Submit the form
        form.submit();
    });
});