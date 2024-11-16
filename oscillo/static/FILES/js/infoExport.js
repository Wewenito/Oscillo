/*
╔══════════════════════════════════════════════════════╗
║                  INFORMATION EXPORT                  ║
╚══════════════════════════════════════════════════════╝
*/

function downloadCanvasAsImage(imageType) {
    try{
        let imageUrl
        let exportCanvas = document.createElement('canvas');
        exportCanvas.width = CANVAS.width;
        exportCanvas.height = CANVAS.height;
    
        let exportCtx = exportCanvas.getContext('2d');
    
        exportCtx.fillStyle = '#000000';
        exportCtx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
        
        exportCtx.drawImage(CANVAS, 0, 0);
    
        if (imageType === "png") {
            imageUrl = exportCanvas.toDataURL("image/png");
        }else if (imageType === "jpeg") {
            imageUrl = exportCanvas.toDataURL("image/jpeg");
        }
        
    
        // Create temporary link element
        let downloadLink = document.createElement('a');
        downloadLink.href = imageUrl;
    
        // set the download filename
        if (imageType === "png") {
            downloadLink.download = "oscilloscope_snapshot.png";
        }else if (imageType === "jpeg") {
            downloadLink.download = "oscilloscope_snapshot.jpeg";
        }
        
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        showToast("Image downloaded successfully !", "toast-success");
    } catch (error) {
        console.error('Failed to download canvas as image', error);
        showToast("Error while downloading the image..", "toast-error");
        return;
    }
};

function copyCanvasToClipboard() {
    // first we check in case this browser does not have the clipboard API
    if (!navigator.clipboard || !window.ClipboardItem) {
        //console.error('Clipboard API not available');
        showToast("Your browser does not support this feature", "toast-error");
        return;
    }
  
    CANVAS.toBlob(function(blob) {
      try {
        const item = new ClipboardItem({ "image/png": blob });
        navigator.clipboard.write([item]).then(function() {
          console.log('Canvas image copied to clipboard');
          showToast("Image copied to your clipboard !", "toast-success");
        }).catch(function(error) {
          console.error('Copying to clipboard failed', error);
          showToast("Error while copying to the clipboard..", "toast-error");
        });
      } catch (error) {
        console.error('Failed to copy canvas to clipboard', error);
        showToast("Error while copying to the clipboard..", "toast-error");
      }
    }, 'image/png');
};

function downloadDataToCsv() {
    try {
        const channelNames = Object.keys(channelData).sort();//get channel names and sort them
        const csvHeader = channelNames.join(',') + '\n';//set csv header
        const maxPointsLength = Math.max(...channelNames.map(name => channelData[name].points.length));//get each channel max length
      
        let csvRows = [];//create csv rows
        for (let i = 0; i < maxPointsLength; i++) {
          let row = channelNames.map(name => {
            //we leave the row space blank if there are no samples at that index
            return channelData[name].points[i] || '';
          }).join(',');
          csvRows.push(row);
        }
      
        // combine headers w/ rows and create blob for the download
        const csvString = csvHeader + csvRows.join('\n');
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
      
        //create the link for the download, then trigger it
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', 'channels_data.csv');
        document.body.appendChild(link); // needed with firefox
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        showToast("Data downloaded successfully !", "toast-success");
    } catch (error) {
        console.error('Failed to download data to CSV', error);
        showToast("Error while downloading the data..", "toast-error");
    }
};