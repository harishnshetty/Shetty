const SHEET_ID = '13CoG6Ljz3TYsn0JImXPcoJqCAgxZnco0Ldnr2lA0Ick'; // Google Sheets ID
const API_KEY = 'AIzaSyBwnJTt3tZV61gebywzYb8MIDk4CTcleHQ'; // Your API Key
const range = 'Sheet1!A2:J'; // Updated range for rearranged columns

// Fetch data from Google Sheets
async function fetchData() {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${range}?key=${API_KEY}`;
    const response = await fetch(url);
    if (!response.ok) {
        alert("Error fetching data from Google Sheets.");
        return [];
    }
    const data = await response.json();
    return data.values;
}

// Format timestamp to "dd-mm-yyyy"
function formatDate(timestamp) {
    const dateObj = new Date(timestamp);
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = dateObj.getFullYear();
    return `${day}-${month}-${year}`;
}

// Function to open map in Google Maps using the URL from the sheet
function openMap(mapAddress) {
    window.open(mapAddress, '_blank'); // Open the map URL in a new tab
}

// Extract image ID from Google Drive URL and convert to display format
function getImageId(url) {
    const regex = /(?:id=)([\w-]+)/;
    const match = url.match(regex);
    if (match) {
        const imageId = match[1];
        return imageId;
    }
    return '';
}

// Display property data in a structured format
function displayProperties(data) {
    const container = document.getElementById('container');
    
    // Clear the container before appending new content
    container.innerHTML = "";

    // Filter rows by "50 L to 1 Crore" price range and sort by latest timestamp
    const filteredData = data
        .filter(row => row[6] && row[6].includes('50 L to  1 Crore'))
        .sort((a, b) => new Date(b[0]) - new Date(a[0])); // Sort by timestamp (latest first)

    // Create boxes for each row
    filteredData.forEach(row => {
        const imageUrls = row[9] ? row[9].split(',').map(url => `https://lh3.googleusercontent.com/d/${getImageId(url)}`) : [];
        const propertyDetails = {
            timestamp: formatDate(row[0]),
            propertyName: row[1],
            brokerName: row[2],
            brokerPhone: row[3],
            address: row[4],
            mapAddress: row[5],
            priceOfSite: row[7],
            siteDetails: row[8],
        };

        // Create property box
        const propertyBox = document.createElement('div');
        propertyBox.classList.add('property-box');

        // Left side (slideshow for images)
        const leftSide = document.createElement('div');
        leftSide.classList.add('left-side');
        const img = document.createElement('img');
        if (imageUrls.length > 0) img.src = imageUrls[0];
        leftSide.appendChild(img);

        // Set up slideshow for images
        let currentImageIndex = 0;
        if (imageUrls.length > 0) {
            setInterval(() => {
                currentImageIndex = (currentImageIndex + 1) % imageUrls.length;
                img.src = imageUrls[currentImageIndex];
            }, 3000); // Change image every 3 seconds
        }

        // Right side (details with left column titles and right column values)
        const rightSide = document.createElement('div');
        rightSide.classList.add('right-side');
        rightSide.innerHTML = `
            <div class="detail-row"><span class="title">Property Name:</span> <span class="value">${propertyDetails.propertyName}</span></div>
            <div class="detail-row"><span class="title">Price of Site:</span> <span class="value">${propertyDetails.priceOfSite}</span></div>
            <div class="detail-row"><span class="title">Address:</span> <span class="value">${propertyDetails.address}</span></div>
            <div class="detail-row"><span class="title">Site Details:</span> <span class="value">${propertyDetails.siteDetails}</span></div>
            <div class="detail-row"><span class="title">Broker Name:</span> <span class="value">${propertyDetails.brokerName}</span></div>
            <div class="detail-row"><span class="title">Broker Phone:</span> <span class="value">${propertyDetails.brokerPhone}</span></div>
            <div class="detail-row">
                <span class="title">Map Address:</span>
                <span class="value">
                    <button class="btn btn-primary glow-button" onclick="openMap('${propertyDetails.mapAddress}')">Open in Google Maps</button>
                </span>
            </div>
        `;

        // Append left and right sides to property box
        propertyBox.appendChild(leftSide);
        propertyBox.appendChild(rightSide);

        // Append property box to container
        container.appendChild(propertyBox);
    });
}

// Initialize the fetching and rendering process
fetchData().then(data => {
    displayProperties(data);
});
