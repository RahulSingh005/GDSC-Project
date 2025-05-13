if ('webkitSpeechRecognition' in window) {
    const recognition = new webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    const micBtn = document.getElementById('mic-btn');
    const speechOutput = document.getElementById('speech-output');
    let isRecording = false;

    micBtn.addEventListener('click', () => {
        if (isRecording) {
            recognition.stop();
            micBtn.textContent = '🎤';
        } else {
            recognition.start();
            micBtn.textContent = '🛑';
        }
        isRecording = !isRecording;
    });

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript.trim().toUpperCase();
        speechOutput.textContent = transcript;

        // Extract move in the format "E2 E4", "E2 TO E4", or "MOVE E2 TO E4"
        // We'll use regex to find two squares in the transcript
        const moveMatch = transcript.match(/([A-H][1-8]).*([A-H][1-8])/);
        if (moveMatch) {
            const from = moveMatch[1];
            const to = moveMatch[2];

            // Optional: highlight or animate the move for feedback

            // Trigger your move logic
            // Example: call a function movePiece(from, to)
            if (typeof movePiece === "function") {
                movePiece(from, to);
            } else {
                // Or, if you use drag-and-drop, simulate the move
                const fromBox = document.getElementById(from);
                const toBox = document.getElementById(to);
                if (fromBox && toBox) {
                    // You may need to adapt this to your move logic
                    // For example, trigger a custom event or call your move handler
                    simulateMove(fromBox, toBox);
                }
            }
        } else {
            speechOutput.textContent += " (Could not understand move)";
        }
    };

    recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        isRecording = false;
        micBtn.textContent = '🎤';
        speechOutput.textContent = 'Speech recognition error: ' + event.error;
    };

    recognition.onend = () => {
        isRecording = false;
        micBtn.textContent = '🎤';
    };

} else {
    console.error('Web Speech API is not supported in this browser.');
    const speechOutput = document.getElementById('speech-output');
    speechOutput.textContent = 'Web Speech API is not supported in this browser.';
}

// Helper function: Simulate a move (customize this for your logic)
function simulateMove(fromBox, toBox) {
    // Example: Move piece text from fromBox to toBox
    if (fromBox.textContent && !toBox.textContent) {
        toBox.textContent = fromBox.textContent;
        fromBox.textContent = '';
        // Optionally: Call your move validation/game logic here!
    }
}

// If you have a proper movePiece(from, to) function, use that instead!
