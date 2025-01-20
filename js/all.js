// Google Sheets ID and API key
const SHEET_ID = '13CoG6Ljz3TYsn0JImXPcoJqCAgxZnco0Ldnr2lA0Ick';
const API_KEY = 'AIzaSyBwnJTt3tZV61gebywzYb8MIDk4CTcleHQ';
const range = 'Sheet1!A2:J';

// Fetch data from Google Sheets with sorting based on timestamp in column 0
async function fetchData() {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${range}?key=${API_KEY}`;
    const response = await fetch(url);
    if (!response.ok) {
        console.log("Error fetching data from Google Sheets.");
        alert("Error fetching data from Google Sheets.");
        return [];
    }
    const data = await response.json();
    const rows = data.values || [];

    // Sort data based on the timestamp in the first column (index 0)
    rows.sort((a, b) => {
        const timestampA = new Date(a[0]);
        const timestampB = new Date(b[0]);
        return timestampB - timestampA;  // Sort in descending order (latest first)
    });

    console.log("Fetched and sorted data:", rows); // Log sorted data
    return rows;
}

// Format timestamp to "dd-mm-yyyy"
function formatDate(timestamp) {
    const dateObj = new Date(timestamp);
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = dateObj.getFullYear();
    return `${day}-${month}-${year}`;
}

// Extract file ID from Google Drive URL and convert to embed preview format
function getPreviewUrl(url) {
    const regex = /(?:id=|\/d\/)([\w-]+)/;
    const match = url.match(regex);
    if (match) {
        return `https://drive.google.com/file/d/${match[1]}/preview`;
    }
    return '';
}

// Extract image ID from Google Drive URL and convert to display format
function getImageId(url) {
    const regex = /(?:id=|\/d\/)([\w-]+)/;
    const match = url.match(regex);
    if (match) {
        return match[1];
    }
    return '';
}

// Open a new page to display all images
function openImagePage(images) {
    console.log("Opening image page with images:", images);
    const newWindow = window.open();
    newWindow.document.write('<html><head><title>Property Images</title></head><body style="font-family: Arial, sans-serif;">');
    newWindow.document.write('<h1 style="text-align: center; margin-bottom: 20px;">Property Images</h1>');
    images.forEach((url, index) => {
        const media = `<img style="width: 100%; margin-bottom: 20px;" src="${url}" alt="Image ${index + 1}">`;
        newWindow.document.write(`<div>${media}</div>`);
    });
    newWindow.document.write('</body></html>');
    newWindow.document.close();
}

// Open a new page to display all files (Images and Videos in row 9)
function openAllFilesPage(files) {
    console.log("Opening all files page with files:", files);
    const newWindow = window.open();
    newWindow.document.write('<html><head><title>All Files</title><style>');
    newWindow.document.write('body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f7f7f7; }');
    newWindow.document.write('.grid-container { display: grid; gap: 20px; }');
    newWindow.document.write('@media (min-width: 768px) { .grid-container { grid-template-columns: repeat(2, 1fr); } }');
    newWindow.document.write('@media (max-width: 768px) { .grid-container { grid-template-columns: repeat(1, 1fr); } }');
    newWindow.document.write('iframe { width: 100%; height: 300px; border: none; }');
    newWindow.document.write('</style></head><body>');
    newWindow.document.write('<h1 style="text-align: center; margin-bottom: 20px;">All Files</h1>');
    newWindow.document.write('<div class="grid-container">');

    files.forEach((url) => {
        const previewUrl = getPreviewUrl(url);
        if (previewUrl) {
            newWindow.document.write(`<iframe src="${previewUrl}"></iframe>`);
        }
    });

    newWindow.document.write('</div></body></html>');
    newWindow.document.close();
}

// Display property data
function displayProperties(data) {
    const container = document.getElementById("container");
    container.innerHTML = "";

    // Use the entire dataset
    const filteredData = data; // No filtering, just show all properties
    console.log("Fetched all properties:", filteredData);

    if (filteredData.length === 0) {
        container.innerHTML = '<div class="text-center">No properties available or end of the page.</div>';
        return;
    }

    filteredData.forEach(row => {
        const imageUrls = row[9] ? row[9].split(",").map(url => `https://lh3.googleusercontent.com/d/${getImageId(url)}`) : [];
        const fileUrls = row[9] ? row[9].split(",").map(url => url.trim()) : [];

        const propertyDetails = {
            propertyName: row[1],
            price: row[7],
            brokername: row[2],
            brokercontact: row[3],  
            address: row[4],
            mapAddress: row[5],
            siteDetails: row[8],
            images: imageUrls,
            files: fileUrls
        };

        console.log("Rendering property:", propertyDetails);

        const propertyBox = document.createElement("div");
        propertyBox.classList.add("property-box", "col-12");

        if (imageUrls.length > 0) {
            let currentImageIndex = 0;
            const imageElement = document.createElement("img");
            imageElement.src = imageUrls[0];
            imageElement.style.pointerEvents = "none"; // Prevent pointer interactions
            if (imageUrls.length > 1) {
                setInterval(() => {
                    currentImageIndex = (currentImageIndex + 1) % imageUrls.length;
                    imageElement.src = imageUrls[currentImageIndex];
                }, 3000); // Auto-slide every 3 seconds
            }

            propertyBox.innerHTML = `
                <div class="left-side"></div>
                <div class="right-side">
                    <h1 style="font-weight: bold; font-size: 35px;">${propertyDetails.propertyName}</h1>                
                    <div class="detail-row"><span class="title" style="font-weight: bold; font-size: 20px;">Price :</span><span class="value" style="font-weight: bold; font-size: 30px;">${propertyDetails.price}</span></div>
                    <div class="detail-row"><span class="title">Address:</span><span class="value">${propertyDetails.address}</span></div>
                    <div class="detail-row"><span class="title" style="font-weight: bold; font-size: 15px;">Site Details:</span><span class="value" style="font-weight: normal; font-size: 22px;">${propertyDetails.siteDetails}</span></div>
                    <div class="detail-row"><span class="title" style="font-weight: bold; font-size: 15px;">Broker-name:</span><span class="value" style="font-weight: normal; font-size: 22px;">${propertyDetails.brokername}</span></div>
                    <div class="detail-row"><span class="title" style="font-weight: bold; font-size: 15px;">Br-PH no:</span><span class="value" style="font-weight: normal; font-size: 22px;">${propertyDetails.brokercontact}</span></div>

                    <div class="detail-row"><span class="title"><br>Contact:</br></span><span class="value"><br>Nagaraja Shetty </br>63621 87521</span></div>
                    
                     ${propertyDetails.mapAddress ? `<div class="detail-row">
                    <a href="${propertyDetails.mapAddress}" target="_blank" class="btn btn-primary glow-button">View on Map</a>
                </div>` : ""}
                <div class="detail-row">
                        <button class="btn btn-info" onclick='openImagePage(${JSON.stringify(imageUrls)})'>View Photos</button>
                    </div>
                    <div class="detail-row">
                        <button class="btn btn-secondary" onclick='openAllFilesPage(${JSON.stringify(fileUrls)})'>View All Files</button>
                    </div>
                    <div class="detail-row">
                        <button class="btn btn-success" onclick='shareProperty(${JSON.stringify(propertyDetails)})'>Share</button>
                    </div>
                </div>
            `;
            propertyBox.querySelector(".left-side").appendChild(imageElement);
        } else {
            propertyBox.innerHTML = `
                <div class="right-side">
                    <h1 style="font-weight: bold; font-size: 35px;">${propertyDetails.propertyName}</h1>                
                    <div class="detail-row"><span class="title" style="font-weight: bold; font-size: 20px;">Price :</span><span class="value" style="font-weight: bold; font-size: 30px;">${propertyDetails.price}</span></div>
                    <div class="detail-row"><span class="title">Address:</span><span class="value">${propertyDetails.address}</span></div>
                    <div class="detail-row"><span class="title" style="font-weight: bold; font-size: 15px;">Site Details:</span><span class="value" style="font-weight: normal; font-size: 22px;">${propertyDetails.siteDetails}</span></div>
                    <div class="detail-row"><span class="title" style="font-weight: bold; font-size: 15px;">Broker-name:</span><span class="value" style="font-weight: normal; font-size: 22px;">${propertyDetails.brokername}</span></div>
                    <div class="detail-row"><span class="title" style="font-weight: bold; font-size: 15px;">Br-PH no:</span><span class="value" style="font-weight: normal; font-size: 22px;">${propertyDetails.brokercontact}</span></div>

                    <div class="detail-row"><span class="title"><br>Contact:</br></span><span class="value"><br>Nagaraja Shetty </br>63621 87521</span></div>
                    <div class="detail-row"><span class="no-image-message" style="color: red;">No Photos / ಯಾವುದೇ ಫೋಟೋ ಇಲ್ಲ</span></div>
                     ${propertyDetails.mapAddress ? `<div class="detail-row">
                    <a href="${propertyDetails.mapAddress}" target="_blank" class="btn btn-primary glow-button">View on Map</a>
                </div>` : ""}
                    <div class="detail-row">
                        <button class="btn btn-secondary" onclick='openAllFilesPage(${JSON.stringify(fileUrls)})'>View All Files</button>
                    </div>
                    <div class="detail-row">
                        <button class="btn btn-success" onclick='shareProperty(${JSON.stringify(propertyDetails)})'>Share</button>
                    </div>
                </div>
            `;
        }

        container.appendChild(propertyBox);
    });
}

// Share property data details.images.slice(0,2).join("\n\n")   
function shareProperty(details) {
    const shareData = {
        title: "Property Details",
        text: `Property Name:  ${details.propertyName}\nPrice:                     ${details.price}\nAddress:               ${details.address}\nSite Details:          ${details.siteDetails}\nBroker-name:          ${details.brokername}\nBorker-PH:          ${details.brokercontact}\n\nContact: Nagaraja Shetty, 63621 87521\nPhotos: \n${details.images.slice(0,2).join("\n\n")}\n\n${details.mapAddress ? `View Map: ${details.mapAddress}\n` : ""}`, 
        url: window.location.href
    };

    if (navigator.share) {
        navigator.share(shareData).catch(err => console.error("Error sharing", err));
    } else {
        console.log("Sharing is not supported on this browser.");
        alert("Sharing is not supported on this browser.");
    }
}

// Initialize
fetchData().then(data => displayProperties(data));
