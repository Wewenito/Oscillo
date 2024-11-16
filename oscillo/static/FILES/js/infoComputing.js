/*
╔══════════════════════════════════════════════════════╗
║           INFORMATION COMPUTING & DISPLAY            ║
╚══════════════════════════════════════════════════════╝
*/

function getTimeScale(timeInSeconds){
    let scale;
    let value;

    //convert timeInSeconds to ms as a base unit to simplify the logic of the function
    const microseconds = timeInSeconds * 1e6;

    if (microseconds < 1) {// nanoseconds
        scale = 'ns'; 
        value = (microseconds * 1000).toFixed(2); // convert to nanoseconds
    } else if (microseconds < 1000) {// microseconds
        scale = 'µs'; 
        value = microseconds.toFixed(2);
    } else if (microseconds < 1e6) {// Milliseconds
        scale = 'ms'; 
        value = (microseconds / 1000).toFixed(2); // convert microseconds to milliseconds
    } else { // Seconds
        scale = 's';
        value = (microseconds / 1e6).toFixed(2); // convert microseconds to seconds
    }

    return { value: parseFloat(value), scale: scale };
};

function getTimePerDiv() { 
    const totalSamplingTime = config.samplesPerFrame * 1e-8;
    const timePerDivision = (totalSamplingTime / config.horizontalDivisions) * (horizontalScale / 50);//we have to divide by 50 because the default value of the input is 50 which corresponds to 1 : no scaling
    
    const resultScaled = getTimeScale(timePerDivision);
    return resultScaled;
};

//converts a voltage to the equivalent absolute raw value of a 14-bit ADC
function mapVoltageToRaw(voltage) {
    return (voltage + (config.voltage / 2)) / config.voltage * config.maxSampleValue;
};

//converts a raw value to the equivalent value in volts.
function mapRawToVoltage(rawValue) {
    return (rawValue / config.maxSampleValue * config.voltage) - (config.voltage / 2);
}

function getTimeBetweenCursors(pixelsBetweenCursors){
    const totalSamplingTime = config.samplesPerFrame * 1e-8;
    const sizeOfOneDivisionInPixels = CANVAS.width / config.horizontalDivisions;
    const DivisionsBetweenCursors = pixelsBetweenCursors / sizeOfOneDivisionInPixels;
    
    const TimeBetweenCursors = totalSamplingTime * (DivisionsBetweenCursors / config.horizontalDivisions) * (horizontalScale / 50);

    const resultScaled = getTimeScale(TimeBetweenCursors);
    return resultScaled;
};

function getMillivoltsBetweenCursors(pixelsBetweenCursors){
    //If a channel is focused then we get the mv/div of this one.
    let result = {value: "No channel", scale: "selected"};

    Object.keys(channelData).forEach(key => {
        if(channelData[key].focused){
            const sizeOfOneDivisionInPixels = CANVAS.height / config.verticalDivisions;
            const milliVoltsPerDivision = getMilliVoltsPerDiv(channelData[key].verticalScale);
            const milliVoltsBetweenCursors = (pixelsBetweenCursors / sizeOfOneDivisionInPixels) * milliVoltsPerDivision;
            result =  {value: milliVoltsBetweenCursors.toFixed(1), scale: "mV"};
        }
    });
    //If not, we just return "NA" until the user selects a certain channel. 
    return result;
};

function getMilliVoltForACursor(cursorPosition){
    let result = {value: "No channel", scale: "selected"};

    Object.keys(channelData).forEach(key => {
        if(channelData[key].focused){
            const sizeOfOneDivisionInPixels = CANVAS.height / config.verticalDivisions;
            const milliVoltsPerDivision = getMilliVoltsPerDiv(channelData[key].verticalScale);
            if (cursorPosition == (CANVAS.height / 2)){
                result = {value: "0", scale: "mV"};
            }else if (cursorPosition > (CANVAS.height / 2)){//negative values
                const cursorValue = ((cursorPosition - (CANVAS.height / 2)) / sizeOfOneDivisionInPixels) * milliVoltsPerDivision;
                result = {value: -cursorValue.toFixed(1), scale: "mV"}
            }else if (cursorPosition < (CANVAS.height / 2)){//positive values
                const cursorValue = (((CANVAS.height / 2) - cursorPosition) / sizeOfOneDivisionInPixels) * milliVoltsPerDivision;
                result = {value: cursorValue.toFixed(1), scale: "mV"}
            }
        }
    });

    return result;
};

function getMilliVoltsRelativeToTriggerCursor(Position){
    const triggerChannel = triggerOptions.triggerChannel;
    const sizeOfOneDivisionInPixels = CANVAS.height / config.verticalDivisions;
    const milliVoltsPerDivision = getMilliVoltsPerDiv(channelData[triggerChannel].verticalScale);
    let result;
    if (Position == (CANVAS.height / 2)){
        result = {value: "0", scale: "mV"};
    }else if (Position > (CANVAS.height / 2)){//negative values
        const cursorValue = ((Position - (CANVAS.height / 2)) / sizeOfOneDivisionInPixels) * milliVoltsPerDivision;
        result = {value: -cursorValue.toFixed(1), scale: "mV"}
    }else if (Position < (CANVAS.height / 2)){//positive values
        const cursorValue = (((CANVAS.height / 2) - Position) / sizeOfOneDivisionInPixels) * milliVoltsPerDivision;
        result = {value: cursorValue.toFixed(1), scale: "mV"}
    }

    return result;
};

function getTimeForACursor(cursorPosition){
    const totalSamplingTime = config.samplesPerFrame * 1e-8; // Total time for all divisions.
    const sizeOfOneDivisionInPixels = CANVAS.width / config.horizontalDivisions; // Pixel width of one division.

    // Calculate how many divisions the cursor is from the left of the canvas.
    const divisionsFromLeft = cursorPosition / sizeOfOneDivisionInPixels;

    // Calculate the time at the cursor position using the proportion of the total time.
    const timeAtCursor = totalSamplingTime * (divisionsFromLeft / config.horizontalDivisions) * (horizontalScale / 50);

    const resultScaled = getTimeScale(timeAtCursor);
    return resultScaled;
};

function setScreenInformation(){
    //insert time scale to the screen
    const timePerDiv = getTimePerDiv();
    document.getElementById('tpdiv-value').innerHTML = timePerDiv.value + ' ' + timePerDiv.scale + '/div';
    //console.log(`Time per division is : ${timePerDiv.value} ${timePerDiv.scale}`);

    Object.keys(channelData).forEach(key => {
        const voltsPerDiv = getMilliVoltsPerDiv(channelData[key].verticalScale);
        let channelNumber = parseInt(key.substring(2), 10);
        if (voltsPerDiv > 1000){
            document.getElementById('mes-CH' + channelNumber).innerHTML = (voltsPerDiv / 1000).toFixed(2) + ' V/dv';
        }else{
            document.getElementById('mes-CH' + channelNumber).innerHTML = voltsPerDiv + ' mv/dv';
        }
        document.getElementById('mes-CH' + channelNumber).style.color = channelData[key].colorDark;
    });

    if (triggerOptions.isTriggerOn == "on"){
        if (triggered){
            TRIGGER.style.color = "lightgreen"
        }else{
            TRIGGER.style.color = "chocolate"
        }
    }else{
        TRIGGER.style.color = "#e2e2e2"//white
    }

    //This section is about the auto-measures display.
    //These are put on screen below the voltages display.
    valuesToDisplay = []; // format inside : {text: "textToDisplay", color: "colorOfTheChannel", value: "valueToDisplay"}

    let min, max//we declare them here to reuse in case vpp and either min or max are set, it prevent another call to the function.
    
    
    if (autoMeasureOptions.vpp.set){// get min, max, vpp
        min = autoMeasures.getMinValue(channelData[autoMeasureOptions.associatedChannel].points);
        max = autoMeasures.getMaxValue(channelData[autoMeasureOptions.associatedChannel].points);
        let vpp = autoMeasures.getVppValue(channelData[autoMeasureOptions.associatedChannel].points);

        valuesToDisplay.push({
            text: "Vpp", 
            color: channelData[autoMeasureOptions.associatedChannel].colorDark, 
            value: vpp.toFixed(1) + "mV",
            id: "vpp-measure",
        });
    };

    if (autoMeasureOptions.min.set){// get only min
        if (min == undefined){
            min = autoMeasures.getMinValue(channelData[autoMeasureOptions.associatedChannel].points);
        }
        valuesToDisplay.push({
            text: "Min", 
            color: channelData[autoMeasureOptions.associatedChannel].colorDark, 
            value: min.toFixed(1) + "mV",
            id: "min-measure",
        });
    };

    if (autoMeasureOptions.max.set){// get only max
        if (max == undefined){
            max = autoMeasures.getMaxValue(channelData[autoMeasureOptions.associatedChannel].points);
        }
        valuesToDisplay.push({
            text: "Max", 
            color: channelData[autoMeasureOptions.associatedChannel].colorDark, 
            value: max.toFixed(1) + "mV",
            id: "max-measure",
        });
    };

    if (autoMeasureOptions.mean.set){// get avg value
        let mean = autoMeasures.getMeanValue(channelData[autoMeasureOptions.associatedChannel].points);
        valuesToDisplay.push({
            text: "Avg", 
            color: channelData[autoMeasureOptions.associatedChannel].colorDark, 
            value: mean.toFixed(1) + "mV",
            id: "avg-measure",
        });
    };

    if (autoMeasureOptions.mid.set){// get middle value
        let middle = autoMeasures.getMiddleValue(channelData[autoMeasureOptions.associatedChannel].points);
        valuesToDisplay.push({
            text: "Mid", 
            color: channelData[autoMeasureOptions.associatedChannel].colorDark, 
            value: middle.toFixed(1) + "mV",
            id: "mid-measure",
        });
    };

    if (autoMeasureOptions.rms.set){// get rms value
        let rms = autoMeasures.getRMS(channelData[autoMeasureOptions.associatedChannel].points);
        valuesToDisplay.push({
            text: "RMS", 
            color: channelData[autoMeasureOptions.associatedChannel].colorDark, 
            value: rms.toFixed(1) + "mV",
            id: "rms-measure",
        });
    };

    function formatFrequency(frequency) {
        if (frequency >= 1e9) {  // gte to 1 Gigahertz
            return (frequency / 1e9).toFixed(1) + " GHz";
        } else if (frequency >= 1e6) {  // gte to 1 Megahertz
            return (frequency / 1e6).toFixed(1) + " MHz";
        } else if (frequency >= 1e3) {  // gte to 1 Kilohertz
            return (frequency / 1e3).toFixed(1) + " kHz";
        } else {
            return frequency.toFixed(1) + " Hz";  // lt 1 Kilohertz, display in Hertz (Very very very unlikely but still, we never know)
        }
    }

    if (autoMeasureOptions.freq.set){// get avg frequency
        let freq = autoMeasures.getAverageFrequency(channelData[autoMeasureOptions.associatedChannel].points, config.frequency);
        valuesToDisplay.push({
            text: "Freq", 
            color: channelData[autoMeasureOptions.associatedChannel].colorDark, 
            value: formatFrequency(freq),
            id: "avg-freq-measure",
        });
    };

    if (autoMeasureOptions.highFreq.set || autoMeasureOptions.lowFreq.set){// get min and max frequencies
        let freqs = autoMeasures.getFrequenciesMaxMin(channelData[autoMeasureOptions.associatedChannel].points, config.frequency);
        if (autoMeasureOptions.highFreq.set){// high freq
            valuesToDisplay.push({
                text: "Max Freq", 
                color: channelData[autoMeasureOptions.associatedChannel].colorDark, 
                value: formatFrequency(freqs.highestFrequency),
                id: "max-freq-measure",
            });
        };

        if (autoMeasureOptions.lowFreq.set){//low freq
            valuesToDisplay.push({
                text: "Min Freq", 
                color: channelData[autoMeasureOptions.associatedChannel].colorDark, 
                value: formatFrequency(freqs.lowestFrequency),
                id: "min-freq-measure",
            });
        };
    };

    //now we inject the calculated values to the html page.
    const valuesContainer = document.getElementById('auto-measures-display');
    valuesContainer.querySelectorAll('p').forEach(p => p.style.display = 'none');
    for (let i = 0; i < valuesToDisplay.length; i++) {
        let paragraph = document.getElementById(valuesToDisplay[i].id);
        paragraph.style.display = 'block';
        paragraph.style.color = valuesToDisplay[i].color;
        paragraph.style.borderColor = valuesToDisplay[i].color;
        paragraph.textContent = valuesToDisplay[i].text + " : " + valuesToDisplay[i].value;
    };
};

function generatePoints(channelKey){
    const originChannel1 = channelData[channelKey].originChannel1;
    const originChannel2 = channelData[channelKey].originChannel2;
    const operation = channelData[channelKey].operation;

    if (operation == "squared"){
        const pointsSquared = channelData[originChannel1].points.map(point => {
            const voltage = autoMeasures.voltage_from_raw(point);
            const squaredVoltage = voltage * voltage;
            return parseInt(mapVoltageToRaw(squaredVoltage).toFixed(0));
        });

        channelData[channelKey].points = pointsSquared;
        return
    };

    if (operation == "deriv"){
        function getDerivative(points) {
            let derivative = [];
            for (let i = 0; i < points.length - 1; i++) {
                difference = points[i + 1] - points[i];
                //Since the derivative show the difference between two points on the graph we need to add the equivalent of 1/2 the height of the graph 
                //so that it doesn't start being drawn at the bottom of the screen.
                derivative[i] = parseInt((difference + (config.maxSampleValue / 2)).toFixed(0));
            }
            return derivative;
        };
        
        channelData[channelKey].points = getDerivative(channelData[originChannel1].points);
        return
    }

    if (operation == "integral"){
    
        function integrateSignal(points, deltaT) {
            const integratedSignal = [];
            let integralSum = 0;
            for (let i = 0; i < points.length; i++) {
                const pointV = mapRawToVoltage(points[i]);
                integralSum += pointV * deltaT;
                integratedSignal.push(mapVoltageToRaw(integralSum));
            }
            return integratedSignal;
        }
        channelData[channelKey].points = integrateSignal(channelData[originChannel1].points, 1);
        return
    };

    if (operation == "fft") {
        function fillArrayToNextPowerOfTwo(array) {
            // check if the length of the array is already a power of two
            function isPowerOfTwo(n) {
                return n && (n & (n - 1)) === 0;
            }
        
            let targetLength = array.length;
            if (!isPowerOfTwo(targetLength)) {
                // if not a power of two, find the next power of two
                targetLength = Math.pow(2, Math.ceil(Math.log2(targetLength)));
                // fill the array with zeros until it reaches the target length
                while (array.length < targetLength) {
                    array.push(0);
                }
            }
        
            return array;
        }

        function calculateFFT(points, sampleRate) {
            //===============================================================
            // FFT calculation - credit : https://github.com/indutny/fft.js/
            //===============================================================
            const fft = new FFT(points.length);
        
            const complexInput = fft.toComplexArray(points);
            const complexOutput = fft.createComplexArray();
        
            fft.realTransform(complexOutput, complexInput);
            fft.completeSpectrum(complexOutput);
        
            const magnitudes = complexOutput.map((value, index) => {
                if (index % 2 === 0) {
                    // even index, real part
                    const re = value;
                    // odd index, imaginary part (since the array is [re, im, re, im, ...]) => see fft.js doc
                    const im = complexOutput[index + 1];
                    return Math.sqrt(re * re + im * im);
                }
                return null;
            })

            const displayData = magnitudes.map((magnitude, index) => {
                const frequency = index * sampleRate / points.length;
                return { frequency: frequency, magnitude: magnitude };
            });
        
            const halfDisplayData = displayData.slice(0, displayData.length / 2);
            return halfDisplayData;
        }
        //we have to fill the gaps in the array until the next power of 2 (required by the library)
        let tempOriginChannel = channelData[originChannel1];
        channelData[channelKey].points = fillArrayToNextPowerOfTwo(tempOriginChannel.points);
        channelData[channelKey].points = calculateFFT(channelData[channelKey].points, config.frequency);

        channelData[channelKey].verticalScale = 2.5; // We set the vertical scale to 2.5 to make the fft thinner than other signals. This can still be modified by the user oc.
        return
    };

    if (operation == "add"){
        const points1 = channelData[originChannel1].points;
        const points2 = channelData[originChannel2].points;
        const pointsAdded = points1.map((point, index) => {
            point = autoMeasures.voltage_from_raw(point);
            let point2 = autoMeasures.voltage_from_raw(points2[index]);
            return parseInt(mapVoltageToRaw(point + point2).toFixed(0));
        });
        channelData[channelKey].points = pointsAdded;
    };

    if (operation == "mult"){
        const points1 = channelData[originChannel1].points;
        const points2 = channelData[originChannel2].points;
        const pointsMultiplied = points1.map((point, index) => {
            point = autoMeasures.voltage_from_raw(point);
            let point2 = autoMeasures.voltage_from_raw(points2[index]);
            return parseInt(mapVoltageToRaw(point * point2).toFixed(0));
        });
        channelData[channelKey].points = pointsMultiplied;
    };

    if (operation == "sub"){
        const points1 = channelData[originChannel1].points;
        const points2 = channelData[originChannel2].points;
        const pointsSubtracted = points1.map((point, index) => {
            point = autoMeasures.voltage_from_raw(point);
            let point2 = autoMeasures.voltage_from_raw(points2[index]);
            return parseInt(mapVoltageToRaw(point - point2).toFixed(0));
        });
        channelData[channelKey].points = pointsSubtracted;
    };

    if (operation == "div"){
        const points1 = channelData[originChannel1].points;
        const points2 = channelData[originChannel2].points;
        const pointsDivided = points1.map((point, index) => {
            point = autoMeasures.voltage_from_raw(point);
            let point2 = autoMeasures.voltage_from_raw(points2[index]);
            if (point2 === 0){
                return 8192;// = 0V 
            }else{
                return parseInt(mapVoltageToRaw(point / point2).toFixed(0));
            }
        });
        channelData[channelKey].points = pointsDivided;
    };
};

function calculateAutoMeasures(){
    //converts an absolute value (from 0 to 16383) to the corresponding voltage value (-1.1 to +1.1v or else if the config changes).
    function voltage_from_raw(raw_value, max_raw=config.maxSampleValue){
        let voltage_range = [-(config.voltage/2), config.voltage/2]
        let span = voltage_range[1] - voltage_range[0]
        normalized = raw_value / max_raw
        return voltage_range[0] + (normalized * span)
    };

    function getMinValue(points){
        let minAbsValue = Math.min(...points); // get smallest value from array
        minAbsValue = voltage_from_raw(minAbsValue); //convert abs value to V
        return minAbsValue * 1000;//convert V to mV
    }

    function getMaxValue(points){
        let maxAbsValue = Math.max(...points); // get biggest value from array
        maxAbsValue = voltage_from_raw(maxAbsValue); //convert abs value to V
        return maxAbsValue * 1000;//convert V to mV
    }

    function getVppValue(points){
        const maxVoltage = getMinValue(points);//mV
        const minVoltage = getMaxValue(points);//mV
        const vpp = maxVoltage - minVoltage;//mV
        return vpp;
    }

    function getMeanValue(points){
        const average = getMedian(points);//Get the average abs value of the array
        const averageInVolts = voltage_from_raw(average); //convert abs value to V
        return averageInVolts * 1000;//convert V to mV
    }

    function getMiddleValue(points){
        let middleAbs = Math.round(points.length / 2); //get the middle of the point array
        middleInVolts = voltage_from_raw(points[middleAbs]);//convert the value in volts
        return middleInVolts * 1000; //convert V to mV
    }

    function getRMS(points){
        let sum = 0;
        points.forEach(point => {//add each point squared to the total sum
            sum += point * point;
        });
        const rmsAbs = Math.sqrt(sum / points.length);//take the square root of the average of the points
        const rmsInVolts = voltage_from_raw(rmsAbs);//convert the value in volts
        return rmsInVolts * 1000;//convert final value to mV
    }

    function getAverageFrequency(points, sampleRate) {
        const threshold = calculateThreshold(points); // Define a suitable threshold
        let cycleCount = 0;
        let isInCycle = false;
    
        for (let i = 0; i < points.length; i++) {
            if (points[i] > threshold && !isInCycle) {
                cycleCount++;  // start of a new cycle
                isInCycle = true;
            } else if (points[i] < threshold && isInCycle) {
                isInCycle = false;  // end of a cycle
            }
        }
        const totalDuration = points.length / sampleRate;  // total duration in seconds (sample rate will be at 1e8 Hz since agata has a sampling period of 10ns)
        return cycleCount / totalDuration;  // average frequency in Hz
    }
    
    function calculateThreshold(points) {
        let mean = points.reduce((acc, val) => acc + val, 0) / points.length;
        let sumOfSquares = points.reduce((acc, val) => acc + (val - mean) ** 2, 0);
        let standardDeviation = Math.sqrt(sumOfSquares / points.length);
        return mean + standardDeviation;  // Threshold at mean + 1 SD
    }

    function getFrequenciesMaxMin(points, sampleRate) {
        const threshold = calculateThreshold(points);
        let cycleStart = null;
        let frequencies = [];
    
        for (let i = 0; i < points.length; i++) {
            if (points[i] > threshold && cycleStart === null) {
                cycleStart = i;  //new cycle
            } else if ((points[i] < threshold || i === points.length - 1) && cycleStart !== null) {
                const cycleEnd = i;
                const cycleDuration = (cycleEnd - cycleStart) / sampleRate;  // one cycle in seconds
                if (cycleDuration > 0) {  // avoid division by zero
                    const frequency = 1 / cycleDuration;
                    frequencies.push(frequency);
                }
                cycleStart = null;  // look for new cycle in the next loop
            }
        }
    
        if (frequencies.length === 0) {
            return {lowestFrequency: 0, highestFrequency: 0};  // no cycles found
        }
    
        const lowestFrequency = Math.min(...frequencies);
        const highestFrequency = Math.max(...frequencies);
    
        return {
            lowestFrequency: lowestFrequency,
            highestFrequency: highestFrequency
        };
    }

    return {getMinValue, getMaxValue, getVppValue, getMeanValue, getMiddleValue, getRMS, getAverageFrequency, getFrequenciesMaxMin, voltage_from_raw};
};

function getMilliVoltsPerDiv(channelVerticalScale) {
    const totalVoltageRange = config.voltage; //voltage range we get from the settings (-V to +V)
    const verticalDivisions = config.verticalDivisions;

    const voltsPerDivision = totalVoltageRange / (verticalDivisions * channelVerticalScale); 

    return (voltsPerDivision * 1000).toFixed(1);
};

function updateGeneratedMathSignalsData(slotChannel, channel1, channel2, operation){
    //console.log(`Updating math signal in slot ${slotChannel} for the operation : ${operation} between ${channel1} and ${channel2}`);

    channelData[slotChannel] = {
        points: [],
        display: true,
        type: "generatedData",
        focused: false,
        colorDark: channelsMetaData[slotChannel].colorDark,
        colorLight: channelsMetaData[slotChannel].colorLight,
        verticalOffset: 0,
        verticalScale: 1,
        verticalOffsetRelativeCursorPosition: 395,
        //these attributes are specific to generated signals from a function
        originChannel1: channel1,
        originChannel2: channel2,//none if operation does not require 2 channels
        operation: operation,
    };

    //Here we set the button styles to make it show up as available
    channelButton = document.getElementById(slotChannel);

    channelButton.classList.remove("channel-not-displayed");
    channelButton.classList.add("channel-displayed");
    channelButton.classList.add(channelData[slotChannel].colorDark);

    //we update the global config to reflect the new channel
    config.numChannels += 1;

    //we add a cursor for this newly created channel
    const scroller = document.getElementById("scroller-" + slotChannel);
    scroller.style.display = "block";
    scroller.style.backgroundColor = channelData[slotChannel].colorDark;
    const channelID = slotChannel.split("CH")[1];
    setScrollersEvents(channelID);
};

function toggleMeasurement(measureKey, buttonId) {
    let measure = autoMeasureOptions[measureKey];
    if (measure) {
        measure.set = !measure.set; // Toggle the 'set' value
        //change button class depending on wether the measure is set or not
        document.getElementById(buttonId).className = measure.set ? 'modal-measure-button active-measure-button' : 'modal-measure-button inactive-measure-button';
        console.log(`${measureKey} set to ${measure.set}`);
    }
};

function resetMeasurements(){
    try{
        autoMeasureOptions.associatedChannel = "CH1";
        Object.keys(autoMeasureOptions).forEach(key => {
            if (key !== "associatedChannel") {
                autoMeasureOptions[key].set = false;
                autoMeasureOptions[key].value = null;
                document.querySelectorAll('.modal-measure-button').forEach(button => {
                    button.className = 'modal-measure-button inactive-measure-button';
                });
            }
        });
        document.getElementById("selectChannel").value = "CH1";
    
        showToast("Auto Measurements values reset !", "toast-info");
    } catch (error) {
        console.error('Failed to reset measurements', error);
        showToast("Error while resetting the measurements..", "toast-error");
    }
};

function getPositionRelativeToTriggerCursor(milliVolts, channelKey) {
    const sizeOfOneDivisionInPixels = CANVAS.height / config.verticalDivisions;
    const milliVoltsPerDivision = getMilliVoltsPerDiv(channelData[channelKey].verticalScale);
    let position;
    if (milliVolts === 0) {
        position = CANVAS.height / 2;
    } else if (milliVolts < 0) {
        const cursorValue = Math.abs(milliVolts) / milliVoltsPerDivision;
        position = (CANVAS.height / 2) + (cursorValue * sizeOfOneDivisionInPixels);
    } else if (milliVolts > 0) {
        const cursorValue = milliVolts / milliVoltsPerDivision;
        position = (CANVAS.height / 2) - (cursorValue * sizeOfOneDivisionInPixels);
    }

    return position;
};

function updateTriggerSettings(modalElement){
    triggerOptions.isTriggerOn = modalElement.querySelector("#selectOnOffStatus").value;
    triggerOptions.triggerMode = modalElement.querySelector("#selectTriggerMode").value;
    triggerOptions.triggerChannel = modalElement.querySelector("#selectTriggerChannel").value;
    if (modalElement.querySelector("#TriggerLevelInput").value > 1100){
        triggerOptions.triggerLevel = 1100
    }else if(modalElement.querySelector("#TriggerLevelInput").value < -1100){
        triggerOptions.triggerLevel = -1100
    }else{
        triggerOptions.triggerLevel = modalElement.querySelector("#TriggerLevelInput").value;
    }
    if (modalElement.querySelector("#WindowLevelMinInput").value > 1100){
        triggerOptions.windowLevelMin = 1100
    }else if(modalElement.querySelector("#WindowLevelMinInput").value < -1100){
        triggerOptions.windowLevelMin = -1100
    }else{
        triggerOptions.windowLevelMin = modalElement.querySelector("#WindowLevelMinInput").value;
    }
    if (modalElement.querySelector("#WindowLevelMaxInput").value > 1100){
        triggerOptions.windowLevelMax = 1100
    }else if(modalElement.querySelector("#WindowLevelMaxInput").value < -1100){
        triggerOptions.windowLevelMax = -1100
    }else{
        triggerOptions.windowLevelMax = modalElement.querySelector("#WindowLevelMaxInput").value;
    }
    triggerOptions.triggerSlope = modalElement.querySelector("#selectTriggerSlope").value;
    if (modalElement.querySelector("#holdOffInput").value > 3600){
        triggerOptions.holdOff = 3600
    }else if(modalElement.querySelector("#holdOffInput").value < 0){
        triggerOptions.holdOff = 0
    }else{
        triggerOptions.holdOff = modalElement.querySelector("#holdOffInput").value;
    }

    showToast("Trigger settings updated !", "toast-info");

    if (triggerOptions.isTriggerOn == "on"){
        document.getElementById("trigger-cursor").style.display = "block";

        const newCursorPosition = getPositionRelativeToTriggerCursor(parseFloat(triggerOptions.triggerLevel), triggerOptions.triggerChannel);
        document.getElementById("trigger-cursor").style.top = newCursorPosition + 'px';
    }else{
        document.getElementById("trigger-cursor").style.display = "none";
    }
};

function calculateZoomFactors() {
    const selectedWidth = zoomConfig.finalX - zoomConfig.initX;
    const selectedHeight = zoomConfig.finalY - zoomConfig.initY;

    // Calculate scale factors to fit the selected area to the canvas size
    zoomConfig.zoomX = CANVAS.width / selectedWidth;
    zoomConfig.zoomY = CANVAS.height / selectedHeight;
};