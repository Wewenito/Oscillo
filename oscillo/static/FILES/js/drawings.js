/*
╔══════════════════════════════════════════════════════╗
║              CANVAS DRAWINGS & RELATED               ║
╚══════════════════════════════════════════════════════╝
*/

function clearCanvas(){
    let ctx = CANVAS.getContext('2d');
    ctx.clearRect(0, 0, CANVAS.width, CANVAS.height);
};

function drawCursors(){
    const ctx = CANVAS.getContext('2d');

    const canvasWidth = CANVAS.width;

    if (cursorOptions.isVerticalCursorOn == "true"){
        ctx.setLineDash([12, 8]);/*dashes are 12px and spaces are 8px*/
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.6;
        ctx.font = "bold 18px Arial";
        ctx.fillStyle = 'red';
    
        //draw first line
        ctx.beginPath();
        ctx.moveTo(cursorOptions.verticalAPosition, 0);
        ctx.lineTo(cursorOptions.verticalAPosition, CANVAS.height);
        if (cursorOptions.cursorsValueDisplay != "indisplay"){
            const cursorATime = getTimeForACursor(cursorOptions.verticalAPosition)
            const text = `${cursorATime.value} ${cursorATime.scale}`;
            ctx.fillText(text, cursorOptions.verticalAPosition + 10, 50);
        }else{
            ctx.fillText("A", cursorOptions.verticalAPosition + 10, 50);
        }
        ctx.stroke();
    
        ctx.strokeStyle = 'crimson';
        ctx.fillStyle = 'crimson';

        //draw second line
        ctx.beginPath();
        ctx.moveTo(cursorOptions.verticalBPosition, 0);
        ctx.lineTo(cursorOptions.verticalBPosition, CANVAS.height);
        if (cursorOptions.cursorsValueDisplay != "indisplay"){
            const cursorBTime = getTimeForACursor(cursorOptions.verticalBPosition)
            const text2 = `${cursorBTime.value} ${cursorBTime.scale}`;
            ctx.fillText(text2, cursorOptions.verticalBPosition - 70, 50);
        }else{
            ctx.fillText("B", cursorOptions.verticalBPosition - 20, 50);
        }
        ctx.stroke();
    
        //draw perpendicular line
        ctx.beginPath();
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.5;
        if (config.theme == "dark"){
            ctx.fillStyle = 'white';
            ctx.strokeStyle = 'white';
        }else{
            ctx.fillStyle = 'black';
            ctx.strokeStyle = 'black';
        }
        
    
        if (cursorOptions.cursorsValueDisplay != "indisplay"){
            
            let pixelsBetweenCursors;
            if (cursorOptions.verticalAPosition > cursorOptions.verticalBPosition){
                pixelsBetweenCursors = cursorOptions.verticalAPosition - cursorOptions.verticalBPosition;
            }else{
                pixelsBetweenCursors = cursorOptions.verticalBPosition - cursorOptions.verticalAPosition;
            }

            const timeBetweenCursors = getTimeBetweenCursors(pixelsBetweenCursors);
            const text3 = `Δ ${timeBetweenCursors.value} ${timeBetweenCursors.scale}`;
            const textMetrics = ctx.measureText(text3);
            const textWidth = textMetrics.width;

            let X = ((cursorOptions.verticalAPosition + cursorOptions.verticalBPosition) / 2) - (textWidth/2);
            let Y = CANVAS.height * 0.80 - 10;
            ctx.fillText(text3, X, Y);
        }else{
            let X = (cursorOptions.verticalAPosition + cursorOptions.verticalBPosition) / 2;
            let Y = CANVAS.height * 0.80 - 10;
            ctx.fillText("Δ", X - 7, Y);
        }
        
        ctx.setLineDash([8, 4]);
        ctx.moveTo(Math.min(cursorOptions.verticalAPosition, cursorOptions.verticalBPosition), CANVAS.height * 0.80);
        ctx.lineTo(Math.max(cursorOptions.verticalAPosition, cursorOptions.verticalBPosition), CANVAS.height * 0.80);
        ctx.stroke();
    
        ctx.setLineDash([]);
    };

    if (cursorOptions.isHorizontalCursorOn == "true"){
        ctx.setLineDash([12, 8]);
        ctx.strokeStyle = 'orange';
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.6;
        ctx.font = "bold 18px Arial";
        ctx.fillStyle = 'orange';

        //draw first line
        ctx.beginPath();
        ctx.moveTo(0, cursorOptions.horizontalAPosition); // Move to the left edge of the canvas at a specific horizontal position
        ctx.lineTo(CANVAS.width, cursorOptions.horizontalAPosition); // Draw line to the right edge of the canvas
        if (cursorOptions.cursorsValueDisplay != "indisplay"){
            const MvCursorA = getMilliVoltForACursor(cursorOptions.horizontalAPosition);
            const text = `${MvCursorA.value} ${MvCursorA.scale}`;
            ctx.fillText(text, CANVAS.width - 100, cursorOptions.horizontalAPosition -10); // Adjust text position to follow the line
        }else{
            ctx.fillText("A", CANVAS.width - 20, cursorOptions.horizontalAPosition -10);
        }
        ctx.stroke();
    
        ctx.strokeStyle = 'darkorange';
        ctx.fillStyle = 'darkorange';

        //draw second line
        ctx.beginPath();
        ctx.moveTo(0, cursorOptions.horizontalBPosition); // Move to the left edge of the canvas at another specific horizontal position
        ctx.lineTo(CANVAS.width, cursorOptions.horizontalBPosition); // Draw line to the right edge of the canvas
        if (cursorOptions.cursorsValueDisplay != "indisplay"){
            const MvCursorB = getMilliVoltForACursor(cursorOptions.horizontalBPosition);
            const text2 = `${MvCursorB.value} ${MvCursorB.scale}`;
            ctx.fillText(text2, CANVAS.width - 100, cursorOptions.horizontalBPosition + 22); // Adjust text position to follow the line, slightly offset vertically
        }else{
            ctx.fillText("B", CANVAS.width - 20, cursorOptions.horizontalBPosition + 22);
        }
        ctx.stroke();


        // Draw perpendicular line
        ctx.beginPath();
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.5;

        if (config.theme == "dark"){
            ctx.fillStyle = 'white';
            ctx.strokeStyle = 'white';
        }else{
            ctx.fillStyle = 'black';
            ctx.strokeStyle = 'black';
        }

        if (cursorOptions.cursorsValueDisplay != "indisplay"){
            let pixelsBetweenCursors;
            if (cursorOptions.horizontalAPosition > cursorOptions.horizontalBPosition){
                pixelsBetweenCursors = cursorOptions.horizontalAPosition - cursorOptions.horizontalBPosition;
            }else{
                pixelsBetweenCursors = cursorOptions.horizontalBPosition - cursorOptions.horizontalAPosition;
            }
    
            const milliVoltsBetweenCursors = getMillivoltsBetweenCursors(pixelsBetweenCursors);
    
            const text3 = `Δ ${milliVoltsBetweenCursors.value} ${milliVoltsBetweenCursors.scale}`;
            let Y = (cursorOptions.horizontalAPosition + cursorOptions.horizontalBPosition) / 2;
            let X = CANVAS.width * 0.10 + 10;
            ctx.fillText(text3, X, Y);
        }else{
            let Y = (cursorOptions.horizontalAPosition + cursorOptions.horizontalBPosition) / 2;
            let X = CANVAS.width * 0.10 + 10;
            ctx.fillText("Δ", X, Y);  
        }

        ctx.setLineDash([8, 4]);
        ctx.moveTo(CANVAS.width * 0.10, Math.min(cursorOptions.horizontalAPosition, cursorOptions.horizontalBPosition));
        ctx.lineTo(CANVAS.width * 0.10, Math.max(cursorOptions.horizontalAPosition, cursorOptions.horizontalBPosition));
        ctx.stroke();

        ctx.setLineDash([]);
    };

    if (cursorOptions.cursorsValueDisplay == "indisplay"){
        ctx.setLineDash([]);
        ctx.strokeStyle = 'yellow';
        ctx.fillStyle = 'lightgoldenrodyellow';
        ctx.lineWidth = 5;
        ctx.globalAlpha = 0.8;
    
        ctx.beginPath();
    
        let rectWidth, rectHeight, y

        if (canvasWidth < 1100){
            rectWidth = 150;
            rectHeight = 80;
            y = 5;
            ctx.font = "12px Arial";
        }else if (canvasWidth < 700){
            rectWidth = 150;
            rectHeight = 80;
            y = 2;
            ctx.font = "10px Arial";
        }else{
            rectWidth = 220;
            rectHeight = 120;
            y = 10
            ctx.font = "16px Arial";
        }

    
        let x = CANVAS.width - rectWidth;
    
        ctx.rect(x - 10, y, rectWidth, rectHeight);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = 'black';
        ctx.globalAlpha = 1.0;

        const cursorATime = getTimeForACursor(cursorOptions.verticalAPosition)
        const cursorBTime = getTimeForACursor(cursorOptions.verticalBPosition)
        let pixelsBetweenCursors;
        if (cursorOptions.verticalAPosition > cursorOptions.verticalBPosition){
            pixelsBetweenCursors = cursorOptions.verticalAPosition - cursorOptions.verticalBPosition;
        }else{
            pixelsBetweenCursors = cursorOptions.verticalBPosition - cursorOptions.verticalAPosition;
        }
        const timeBetweenCursors = getTimeBetweenCursors(pixelsBetweenCursors);

        let textA_us = `A: ${cursorATime.value} ${cursorATime.scale}`;
        let textB_us = `B: ${cursorBTime.value} ${cursorBTime.scale}`;
        let textD_us = `Δ: ${timeBetweenCursors.value} ${timeBetweenCursors.scale}`;

        const MvCursorA = getMilliVoltForACursor(cursorOptions.horizontalAPosition);    
        const MvCursorB = getMilliVoltForACursor(cursorOptions.horizontalBPosition);
        let pixelsBetweenCursorsHorizontal;
        if (cursorOptions.horizontalAPosition > cursorOptions.horizontalBPosition){
            pixelsBetweenCursorsHorizontal = cursorOptions.horizontalAPosition - cursorOptions.horizontalBPosition;
        }else{
            pixelsBetweenCursorsHorizontal = cursorOptions.horizontalBPosition - cursorOptions.horizontalAPosition;
        }
        const milliVoltsBetweenCursors = getMillivoltsBetweenCursors(pixelsBetweenCursorsHorizontal);

        let textA_mV = `A: ${MvCursorA.value} ${MvCursorA.scale}`;
        let textB_mV = `B: ${MvCursorB.value} ${MvCursorB.scale}`;
        let textD_mV = `Δ: ${milliVoltsBetweenCursors.value} ${milliVoltsBetweenCursors.scale}`;

        let padding, textY1, textY2, textY3, textY4

        if (canvasWidth < 1100){
            padding = 1;
            textY1 = y + padding + 15;
            textY2 = textY1 + 15;
            textY3 = y + rectHeight / 2 + padding + 15;
            textY4 = textY3 + 15;
        }else{
            padding = 10;
            textY1 = y + padding + 20;
            textY2 = textY1 + 20;
            textY3 = y + rectHeight / 2 + padding + 20;
            textY4 = textY3 + 20;
        }


        let spaceBetween = rectWidth / 2;

        ctx.fillText(textA_us, x, textY1);
        ctx.fillText(textB_us, x + spaceBetween, textY1);
        ctx.fillText(textD_us, x + rectWidth / 4, textY2);

        ctx.fillText(textA_mV, x, textY3);
        if (MvCursorA.value != "No channel"){
            ctx.fillText(textB_mV, x + spaceBetween, textY3);
            ctx.fillText(textD_mV, x + rectWidth / 4, textY4);
        }

    };
};

function drawSignal(channelKey){
    const channel = channelData[channelKey];
    const points = channel.points;
    const ctx = CANVAS.getContext('2d');
    const width = CANVAS.width;
    const height = CANVAS.height;

    const maxSignalValue = config.maxSampleValue;  // Max value of the signal

    // Calculate the scaling factors
    const verticalScale = height / maxSignalValue * channel.verticalScale;
    const horizontalScaleFactor = width / points.length * (horizontalScale / 50);

    const baselineY = height / 2  

    // Start drawing the waveform
    ctx.beginPath();

    // Draw each point on the canvas
    points.forEach((point, index) => {
        const x = (index * horizontalScaleFactor) + horizontalOffset;
        const y = baselineY - ((point - maxSignalValue / 2) * verticalScale) + channel.verticalOffset;

        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });

    if (config.theme == "dark"){
        ctx.strokeStyle = channel.colorDark;  // Color of the waveform
    }else{
        ctx.strokeStyle = channel.colorLight;
    }
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.8;
    ctx.stroke();

    if (zoomConfig.isZoomed){
        // Calculate rectangle dimensions
        const rectangleWidth = zoomConfig.finalX - zoomConfig.initX;
        const rectangleHeight = zoomConfig.finalY - zoomConfig.initY;

        const text = `${rectangleWidth}px * ${rectangleHeight}px`;
        ctx.fillText(text, zoomConfig.initX + 5, zoomConfig.initY + 5);
    }

};

function drawFFT(channelKey) {
    const channel = channelData[channelKey];
    const points = channel.points;
    const ctx = CANVAS.getContext('2d');
    const width = CANVAS.width;
    const height = CANVAS.height;
    
    //Enable access for the user to the RATE variable so they can choose the rate themselves.
    const RATE = 1; // how many points to skip when drawing the FFT (min=1)

    const validPoints = points.filter(p => p.magnitude !== null);

    if (validPoints.length > 10) {
        const maxFrequency = validPoints[validPoints.length / 2 - 1].frequency;
        const maxMagnitude = Math.max(...validPoints.map(p => p.magnitude));

        const verticalOffset = channel.verticalOffset;
        const verticalScale = channel.verticalScale;

        ctx.beginPath();
        if (config.theme == "dark"){
            ctx.strokeStyle = channel.colorDark;  // Color of the waveform
            ctx.fillStyle = channel.colorDark;
        }else{
            ctx.strokeStyle = channel.colorLight;
            ctx.fillStyle = channel.colorLight;
        }
        ctx.lineWidth = 1;
        ctx.font = "bold 18px Arial";
        ctx.textBaseline = 'middle';
        ctx.globalAlpha = 1.0;

        let previousX = 0; // Initial value to compare against

        validPoints.slice(0, validPoints.length / 2).forEach((point, index) => {
            if (index % RATE === 0) { // draw only every RATE-th point
                const x = (point.frequency / maxFrequency) * width + horizontalOffset ;
                const y = height * (1 - Math.log10(point.magnitude + 1) / (Math.log10(maxMagnitude + 1) * verticalScale)) + verticalOffset;

                if (index === 0) {
                    ctx.moveTo(0, 500); // Move to initial x, y (possibly needs adjustment)
                } else {
                    ctx.lineTo(x, y);
                }

                if (x >= previousX + 200) {
                    previousX = x;
                    const text = formatFrequency(point.frequency);
                    ctx.fillText(text, x, y - 60);
                }
            }
        });
        ctx.stroke();
    } else {
        console.log("Not enough valid data to display.");
    }
};

// Function to draw a grid composed of full squares on the canvas
function drawGrid(gridColor, thickerLineWidth) {
    if (config.gridDisplay == 0){return;}
    
    let ctx = CANVAS.getContext('2d');
    ctx.globalAlpha = config.gridOpacity;

    const gridSizeVertical = CANVAS.width / config.horizontalDivisions;
    const gridSizeHorizontal = CANVAS.height / config.verticalDivisions;
    const centerVertical = CANVAS.width / 2;
    const centerHorizontal = CANVAS.height / 2;
    //We need the tolerance for a little wiggle room when detecting the two central lines.
    //Otherwise we might not get a perfect == when checking the position of the drawer compared to CANVAS.width/2 or CANVAS.height/2.
    const tolerance = 0.5;

    // Draw vertical grid lines
    for (let x = gridSizeVertical; x < CANVAS.width; x += gridSizeVertical) {
        if (Math.abs(x - centerVertical) <= tolerance) {
            // Make the central vertical line thicker
            ctx.strokeStyle = gridColor;
            ctx.lineWidth = thickerLineWidth;
        } else {
            // Reset the line width to the default value
            ctx.strokeStyle = gridColor;
            ctx.lineWidth = 1;
        }
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, CANVAS.height);
        ctx.stroke();
    }

    // Draw horizontal grid lines
    for (let y = gridSizeHorizontal; y < CANVAS.height; y += gridSizeHorizontal) {
        if (Math.abs(y - centerHorizontal) <= tolerance) {
            // Make the central horizontal line thicker
            ctx.strokeStyle = gridColor;
            ctx.lineWidth = thickerLineWidth;
        } else {
            // Reset the line width to the default value
            ctx.strokeStyle = gridColor;
            ctx.lineWidth = 1;
        }
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(CANVAS.width, y);
        ctx.stroke();
    }
};

function removeSpikes(points, thresholdRatio) {
    const pointsAverage = points.reduce((a, b) => a + b, 0) / points.length;

    function isSpike(point, index) {
        let prev = points[index - 1] || pointsAverage;
        let next = points[index + 1] || pointsAverage;
        let localAverage = (prev + next) / 2;
        let deviationFromLocalAverage = Math.abs(point - localAverage);
        return deviationFromLocalAverage > thresholdRatio * Math.abs(localAverage - pointsAverage);
    }

    // Replace spikes with the average of their neighboring points
    for (let i = 0; i < points.length; i++) {
        if (isSpike(points[i], i)) {
            let prev = points[i - 1] || pointsAverage;
            let next = points[i + 1] || pointsAverage;
            points[i] = (prev + next) / 2;
        }
    }

    return points;
};

function drawZoomRectangle(){
    const ctx = CANVAS.getContext('2d');
    ctx.globalAlpha = 0.4;
    if (config.theme == "dark"){
        ctx.strokeStyle = 'white';
        ctx.fillStyle = 'white';
    }else{
        ctx.strokeStyle = 'black';
        ctx.fillStyle = 'black';
    }

    // Calculate rectangle dimensions
    const width = zoomConfig.finalX - zoomConfig.initX;
    const height = zoomConfig.finalY - zoomConfig.initY;

    ctx.beginPath();
    ctx.rect(zoomConfig.initX, zoomConfig.initY, zoomConfig.finalX - zoomConfig.initX, zoomConfig.finalY - zoomConfig.initY);
    ctx.fill();
    ctx.stroke();

    ctx.globalAlpha = 1;
    ctx.font = '12px Arial';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';

    // Draw the dimensions at the top left corner of the rectangle
    const text = `${width}px x ${height}px`;
    ctx.fillText(text, zoomConfig.initX + 5, zoomConfig.initY + 5);

};

function resetZoom(){
    const ctx = CANVAS.getContext('2d');
    ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset transform to identity
    zoomConfig.isZoomed = false;
};

function drawTriggerCursor(){
    const ctx = CANVAS.getContext('2d');

    const triggerScroller = document.getElementById("trigger-cursor");

    ctx.setLineDash([]);
    ctx.strokeStyle = 'blue';
    ctx.fillStyle = 'blue';
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.8;

    const Y = parseInt(triggerScroller.style.top, 10) + 10;

    ctx.beginPath();
    ctx.moveTo(0, Y);
    ctx.lineTo(CANVAS.width, Y);
    ctx.stroke();
};