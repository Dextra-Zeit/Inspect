function scanAndDisplayMedia() {
    console.log("Scanning for media...");

    // Supported media file extensions
    const mediaExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.mp4', '.webm', '.ogg', '.wav', '.mp3'];

    // Helper function to check if a URL is a media file
    function isMediaURL(url) {
        return mediaExtensions.some(ext => url.includes(ext));
    }

    // Collect all media URLs and filenames
    function collectMediaUrls() {
        const mediaUrls = [];
        
        // Scan <img> tags
        document.querySelectorAll('img').forEach(img => {
            if (img.src) mediaUrls.push({ url: img.src, filename: img.src.split('/').pop() });
        });

        // Scan <div> style attributes for background images
        document.querySelectorAll('div').forEach(div => {
            const style = window.getComputedStyle(div);
            const backgroundImage = style.getPropertyValue('background-image');
            const match = backgroundImage.match(/url\(["']?(.*?)["']?\)/);
            if (match) mediaUrls.push({ url: match[1], filename: match[1].split('/').pop() });
        });

        // Scan CSS for background-image URLs
        Array.from(document.styleSheets).forEach(sheet => {
            try {
                Array.from(sheet.cssRules || []).forEach(rule => {
                    if (rule.style && rule.style.backgroundImage) {
                        const match = rule.style.backgroundImage.match(/url\(["']?(.*?)["']?\)/);
                        if (match) mediaUrls.push({ url: match[1], filename: match[1].split('/').pop() });
                    }
                });
            } catch (e) {
                console.warn('Unable to read CSS rules:', e);
            }
        });

        // Scan <video> and <audio> tags
        document.querySelectorAll('video, audio').forEach(media => {
            if (media.src) mediaUrls.push({ url: media.src, filename: media.src.split('/').pop() });
            // Check for <source> elements inside <video> tags
            media.querySelectorAll('source').forEach(source => {
                if (source.src) {
                    mediaUrls.push({ url: source.src, filename: source.src.split('/').pop() });
                }
            });
        });

        return mediaUrls;
    }

    // Create an overlay container
    const overlay = document.createElement('div');
    overlay.id = 'media-overlay';
    overlay.style = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(0, 0, 0, 0.9);
        color: white;
        z-index: 9999;
        overflow-y: auto;
        padding: 20px;
        display: flex;
        flex-direction: column;
    `;

    // Create a grid container for media items
    const mediaGrid = document.createElement('div');
    mediaGrid.id = 'media-grid';
    mediaGrid.style = `
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
        gap: 15px;
        width: 100%;
        max-height: 80vh;
        overflow-y: auto;
        padding-right: 10px;
    `;
    overlay.appendChild(mediaGrid);

    // Create a search bar
    const searchBar = document.createElement('input');
    searchBar.type = 'text';
    searchBar.placeholder = 'Search media...';
    searchBar.style = `
        margin-bottom: 20px;
        padding: 10px;
        font-size: 16px;
        width: 100%;
        max-width: 400px;
        border: none;
        border-radius: 5px;
    `;
    overlay.insertBefore(searchBar, mediaGrid);

    // Function to render media
    function renderMedia(filter = '') {
        mediaGrid.innerHTML = ''; // Clear existing content

        const mediaUrls = collectMediaUrls();
        const filteredMedia = mediaUrls.filter(item => 
            item.filename.toLowerCase().includes(filter.toLowerCase())
        );

        filteredMedia.forEach(({ url, filename }) => {
            const mediaContainer = document.createElement('div');
            mediaContainer.style = `
                background: white;
                color: black;
                border-radius: 8px;
                padding: 10px;
                display: inline-block;
                text-align: center;
                overflow: hidden;
                width: auto;
                min-width: 150px;
                max-width: 300px;
            `;

            let mediaElement;
            if (url.match(/\.(mp4|webm|ogg)$/)) {
                mediaElement = document.createElement('video');
                mediaElement.src = url;
                mediaElement.controls = true;
                mediaElement.style = 'width: 100%; max-height: 150px;';
            } else if (url.match(/\.(mp3|wav)$/)) {
                mediaElement = document.createElement('audio');
                mediaElement.src = url;
                mediaElement.controls = true;
                mediaElement.style = 'width: 100%;';
            } else {
                mediaElement = document.createElement('img');
                mediaElement.src = url;
                mediaElement.style = 'max-width: 100%; max-height: 150px;';
            }

            // Error handling for media loading
            mediaElement.onerror = function () {
                console.error(`Failed to load media: ${url}`);
            };

            // Add filename with truncation to 15 characters
            const filenameText = document.createElement('div');
            filenameText.innerText = filename.length > 15 ? filename.substring(0, 15) + '...' : filename;
            filenameText.style = `
                margin-top: 10px;
                font-size: 14px;
                word-break: break-word;
            `;

            // Add download button
            const downloadButton = document.createElement('button');
            downloadButton.innerText = 'Download';
            downloadButton.style = `
                margin-top: 10px;
                padding: 5px 10px;
                background: #007bff;
                color: white;
                border: none;
                border-radius: 5px;
                cursor: pointer;
            `;
            downloadButton.onclick = () => {
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                a.click();
            };

            mediaContainer.appendChild(mediaElement);
            mediaContainer.appendChild(filenameText);
            mediaContainer.appendChild(downloadButton);

            // Match container size with media
            mediaContainer.style.height = `${mediaElement.offsetHeight + 240}px`;

            mediaGrid.appendChild(mediaContainer);
        });
    }

    // Initial render
    renderMedia();

    // Add floating buttons
    const buttonContainer = document.createElement('div');
    buttonContainer.style = `
        position: fixed;
        top: 10px;
        right: 10px;
        display: flex;
        gap: 10px;
        z-index: 10000;
    `;

    // Close (Collapse) Button
    const closeButton = document.createElement('button');
    closeButton.innerText = 'X';
    closeButton.style = `
        padding: 5px 10px;
        background: #dc3545;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
    `;
    closeButton.onclick = () => {
        overlay.style.display = overlay.style.display === 'none' ? 'flex' : 'none';
    };
    buttonContainer.appendChild(closeButton);

    // Reload Button
    const reloadButton = document.createElement('button');
    reloadButton.innerText = 'Reload';
    reloadButton.style = `
        padding: 5px 10px;
        background: #28a745;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
    `;
    reloadButton.onclick = () => {
        renderMedia(searchBar.value);
    };
    buttonContainer.appendChild(reloadButton);

    // Download All Button
    const downloadAllButton = document.createElement('button');
    downloadAllButton.innerText = 'Download All';
    downloadAllButton.style = `
        padding: 5px 10px;
        background: #ffc107;
        color: black;
        border: none;
        border-radius: 5px;
        cursor: pointer;
    `;
    downloadAllButton.onclick = () => {
        const mediaUrls = collectMediaUrls();
        mediaUrls.forEach(({ url, filename }) => {
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            a.click();
        });
    };
    buttonContainer.appendChild(downloadAllButton);

    // Add search functionality
    searchBar.oninput = () => {
        renderMedia(searchBar.value);
    };

    // Add overlay and buttons to the document
    document.body.appendChild(overlay);
    document.body.appendChild(buttonContainer);

    console.log("Media overlay initialized.");
}
