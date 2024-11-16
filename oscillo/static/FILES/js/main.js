/*
╔══════════════════════════════════════════════════════╗
║            GLOBAL VARIABLES DECLARATIONS             ║
╚══════════════════════════════════════════════════════╝
*/

let config = {//Used to handle the configuration of the server, in case it changes we can update it here
    numChannels: null,  // How many channels are expected. update if server configuration changes
    frequency: null,
    samplesPerFrame: null,
    voltage: null,
    bitsPerSample: null,
    verticalDivisions: 16,
    horizontalDivisions: 20,
    mode: null,
    maxSampleValue: null,
    gridDisplay: 1,
    gridOpacity: 0.5,
    theme: "dark",
};

let triggerOptions = {
    isTriggerOn: "off",
    triggerMode: "edge", //edge trigger / window trigger
    triggerChannel: "CH1", //CH1, CH2, CH3, CH4, etc
    triggerLevel: "500", //value in millivolts from -1 to +1, that map to the values 0-16383 (if triggerMode = edgetrigger)
    windowLevelMin: "500", //value in millivolts from -1 to +1, that map to the values 0-16383 (if triggerMode = windowtrigger)
    windowLevelMax: "500",//value in millivolts from -1 to +1, that map to the values 0-16383 (if triggerMode = windowtrigger) + must be higher than windowLevelMin
    triggerSlope: "both", //rising, falling, both
    holdOff: "3600", //default: stop for 1h | value : time in seconds
};

let cursorOptions = {
    isVerticalCursorOn: "false",
    isHorizontalCursorOn: "false",
    cursorsValueDisplay: "oncursor", // oncursor (default) / indisplay
    horizontalAPosition: 266,//value in pixels
    horizontalBPosition: 533,//value in pixels
    verticalAPosition: 400,//value in pixels
    verticalBPosition: 800,//value in pixels
};

let zoomConfig = {
    isZoomed: false,
    isDrawing: false,
    initX: 0,
    initY: 0,
    finalX: 0,
    finalY: 0,
    zoomX: 0,
    zoomY: 0,
}

let autoMeasureOptions = {
    //each option has a boolean associated representing whether or not the measure is to be made depending on the user selection
    associatedChannel: "CH1", //null / CH1 (default) / CH2 / CH3, etc etc..
    min: {set: false}, //Min value in channel (mV)
    max: {set: false}, //Max value in channel (mV)
    vpp: {set: false}, //Value from highest to lowest point (mV)
    mean: {set: false}, //Average of all values (mV)
    rms: {set: false}, //Root Mean Square (mV)
    freq: {set: false}, //Avg frequency throughout signal (Hz)
    highFreq: {set: false}, //Highest freq throughout signal (Hz)
    lowFreq: {set: false}, //Lowest freq throughout signal (Hz)
    mid: {set: false},// middle Value of the signal (mV)
};

let LOOP;

let channelData = {}; //This dictionnary holds the data for each channel including points, status, color, etc..

let horizontalOffset = 0;
let horizontalScale = 50;

let loopDelay = 100//ms
let isRunning = false;
let triggered = false;  
let triggerClock = 0;
let failedAttempt = 0;

//these lines below only serve in the case of a file mode.
let currentFilePosition = 0;
let fileName = "NA";
let firstLoop = true;

const autoMeasures = calculateAutoMeasures();

const CANVAS = document.getElementById('oscilloscope_screen');
const MODAL = document.getElementById('modal');

const RUNSTOP = document.getElementById('run-stop');
const CURSORS = document.getElementById('cursors');
const DISPLAY = document.getElementById('display');
const TRIGGER = document.getElementById('trigger');
const SAVE = document.getElementById('save');
const AUTOSET = document.getElementById('autoset');
const MEASURE = document.getElementById('measure');
const PRINT = document.getElementById('print');
const SETUP = document.getElementById('setup');
const SIZE = document.getElementById('size');

/*
╔══════════════════════════════════════════════════════╗
║              DATA FETCHING & SETTINGS                ║
╚══════════════════════════════════════════════════════╝
*/

function getCurrentSettings(){
    const Http = new XMLHttpRequest();
    Http.responseType = 'text';
    let frm = new FormData();

    frm.append("csrfmiddlewaretoken", document.getElementsByName("csrfmiddlewaretoken")[0].value);

    console.log("Getting current settings");

    Http.open("POST", '/oscillo/settings/');
    Http.send(frm);
    Http.onload = function() {
        console.log(Http.responseText);

        const settings = JSON.parse(Http.responseText);

        // update the numChannels in config
        config.mode = settings.mode
        config.numChannels = settings.channels;
        config.frequency = settings.freq;
        config.samplesPerFrame = settings.nb;
        config.voltage = parseFloat(settings.voltage);
        config.bitsPerSample = settings.bits;
        config.gridOpacity = settings.gridOpacity;

        if (settings.theme == "light"){
            config.theme = settings.theme;
            changeScreenLightMode("light");
        }

        if (config.mode == "FILE"){
            config.maxSampleValue = 16383;
            fileName = settings.file_path
            currentFilePosition = parseInt(settings.file_position, 10);
        }else if(config.mode == "REAL-TIME"){
            config.maxSampleValue = 65535;
        }

        console.log("Updated config:", config);
       
        let startOffset = -100

        // update the channelData object now that we know the number of channels
        for (let ch = 1; ch <= config.numChannels; ch++) {
            channelData['CH' + ch] = {
                points: [],
                display: true,
                type: 'baseData',
                focused: false,
                colorDark: channelsMetaData['CH' + ch].colorDark, //channelsMetaData is passed from the backend to here via the html page
                colorLight: channelsMetaData['CH' + ch].colorLight,
                verticalOffset: 0,
                verticalScale: 1, //default value
                verticalOffsetRelativeCursorPosition: 395,
            };

            channel_button = document.getElementById('CH' + ch);
            
            channel_button.classList.remove("channel-not-displayed");
            channel_button.classList.add("channel-displayed");
            channel_button.classList.add(channelData['CH' + ch].colorDark);

            //This part assigns each channel to its own scroller for the offset.
            setScrollersEvents(ch);

            //Here we add a small offset for the signals in order to not have them all clutered in the middle at the beginning.
            document.getElementById('scroller-CH'+ch).style.top = ((CANVAS.height / 2) + startOffset - 5) + 'px';
            channelData['CH' + ch].verticalOffset = startOffset - 30;
            startOffset += 50;
        }
    }
};

function fetchDataFromFile(){
    // console.log("fetchDataFromFile starts");
    const Http = new XMLHttpRequest();

    const fileNameOnly = fileName.split("/").pop();

    const url = `/oscillo/dataF/${currentFilePosition}/${fileNameOnly}/`;
    Http.open("GET", url, true);
    Http.responseType = 'json';

    Http.onload = function() {
        if (Http.status === 200) {
            // console.log("JSON data received : ");
            // console.log(Http.response);

            //Here we now populate the channel data arrays with the data received
            //We know .osc files take a max amount of 4 channels
            Object.keys(channelData).forEach(key => {
                let channelNumber = parseInt(key.substring(2), 10)
                channelData[key].points = Http.response[0][channelNumber + 1];
                currentFilePosition = parseInt(Http.response[1]);
            });

            clearCanvas();
            drawGrid('rgba(128, 128, 128, 0.5)', 3);
            if (cursorOptions.isVerticalCursorOn == "true" || cursorOptions.isHorizontalCursorOn == "true"){
                drawCursors();
            }

            //HERE WE CHECK IF THE USER IS CURRENTLY ZOOMING OR NOT
            if (zoomConfig.isDrawing == true){
                drawZoomRectangle();
            }

            //Here we check whether the trigger is active or not to add the trigger level cursor.
            if (triggerOptions.isTriggerOn == "on"){
                drawTriggerCursor();
            }else{
                document.getElementById("trigger-cursor").style.display = "none";
            };

            Object.keys(channelData).forEach(key => {
                //We start by checking wether or not the trigger is set and if so we check the trigger conditions to freeze or not this part of the signal.
                if (triggerOptions.isTriggerOn == "on"){
                    if (triggerOptions.triggerChannel == key){//we check the trigger options only for the channel specified in the settings.
                        triggered = triggerCheck(channelData[key].points);
                    };
                };

                //Here we generate the points array for the math signals
                if (channelData[key].type == "generatedData"){
                    generatePoints(key);
                }

                // Here we display the signal on the screen (if the button for this channel is active)
                if (channelData[key].display === true){
                    if (channelData[key].type == "generatedData" && channelData[key].operation == "fft"){
                        drawFFT(key);
                    } else {
                        drawSignal(key);
                    }
                }
                
                if (firstLoop){
                    if (channelData[key].points.length == 0){
                        document.getElementById(key).className = "channel-not-displayed ch-button";
                        document.getElementById("scroller-"+key).style.display = "none";
                        delete channelData[key];

                    }
                }
            });
            firstLoop = false;
        } else if (Http.status === 408){
            console.error("Backend Error" + Http.status)
        } else {
            console.error("Failed to load data, status: " + Http.status);
        }
    }

    Http.onerror = function() {
        console.error("There was a network error.");
    };
    Http.send();
};

function fetchRawData(){
    const Http = new XMLHttpRequest();
    Http.responseType = 'arraybuffer';

    Http.open("GET", '/oscillo/dataR/', true);

    Http.onload = function(event) {
        if (Http.status === 200) {
            const buffer = Http.response;
            const dataView = new DataView(buffer);
            const bytesPerSample = 2; // Each sample is 2 bytes (Uint16) altough this may change depending on the server's settings !!
            const totalSamples = dataView.byteLength / bytesPerSample; // Total samples in all channels
    
            // console.log(`THis data is made up of ${totalSamples} samples`);
            // console.log("Here below should be the dataView created from the received data : ");
            // console.log(dataView);

            clearCanvas();
            drawGrid('rgba(128, 128, 128, 0.5)', 3);
            if (cursorOptions.isVerticalCursorOn == "true" || cursorOptions.isHorizontalCursorOn == "true"){
                drawCursors();
            }

            //HERE WE CHECK IF THE USER IS CURRENTLY ZOOMING OR NOT
            if (zoomConfig.isDrawing == true){
                drawZoomRectangle();
            }

            //Here we check whether the trigger is active or not to add the trigger level cursor.
            if (triggerOptions.isTriggerOn == "on"){
                drawTriggerCursor();
            }else{
                document.getElementById("trigger-cursor").style.display = "none";
            };

            // Clear the channel data before parsing the new data
            Object.keys(channelData).forEach(key => {
                channelData[key].points = [];
            });

            let max
            if (config.numChannels > 4){
                max = 4;
            }else{
                max = config.numChannels;
            }
            // Parse buffer into channel data
            for (let i = 0; i < totalSamples; i++) {
                let channelNum = (i % max) + 1;
                let channelKey = 'CH' + channelNum;
                let pointIndex = i * bytesPerSample;
                let point = dataView.getUint16(pointIndex, true);
                channelData[channelKey].points.push(point);
            }

            Object.keys(channelData).forEach(key => {
                //we have to use some sort of a filter to remove the trigger points or whatever is causing these massive spikes.
                const thresholdRatio = 3;
                channelData[key].points = removeSpikes(channelData[key].points, thresholdRatio);

                //Here we generate the points array for the math signals
                if (channelData[key].type == "generatedData"){
                    generatePoints(key);
                }

                // Here we display the signal on the screen (if the button for this channel is active)
                if (channelData[key].display === true){
                    if (channelData[key].type == "generatedData" && channelData[key].operation == "fft"){
                        drawFFT(key);
                    } else {
                        drawSignal(key);
                    }
                }
            });
        } else {
            console.error("The request failed unexpectedly ->", Http.statusText);
            failedAttempt++;
            if (failedAttempt > 60){
                showToast("There seem to be a problem with the reception of the data.", "toast-error");
                failedAttempt = 0;
            }
        }
    }

    Http.onerror = function() {
        console.log("An error occured while fetching the data");
    }

    Http.send();
};

function saveColorChoices(){
    const UID = userId;//We get this value from the html page "graph.html"

    console.log("Saving color choices for the user with id :", UID);

    //We start by gathering each values for the color inputs
    ColorChoicesDark = [];
    ColorChoicesLight = [];

    for (let i = 1; i < 11; i++){
        valueDark = document.getElementById("channelColorD-"+i).value;
        valueLight = document.getElementById("channelColorL-"+i).value;

        ColorChoicesDark.push(valueDark);
        ColorChoicesLight.push(valueLight);
    }

    gridOpacity = document.getElementById("gridOpacityInput").value;

    if (gridOpacity > 1){
        gridOpacity = 1;
    }else if (gridOpacity < 0){
        gridOpacity = 0;
    }

    //Now we send the data to the backend where we'll change the preferences.
    const Http = new XMLHttpRequest();
    const url = `/oscillo/setNewColors/${UID}/`;
    
    const csrfToken = document.querySelector('input[name="csrfmiddlewaretoken"]').value;

    Http.open("POST", url, true);
    Http.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    Http.setRequestHeader("X-CSRFToken", csrfToken);

    const data = JSON.stringify({
        ColorChoicesDark: ColorChoicesDark,
        ColorChoicesLight: ColorChoicesLight,
        gridOpacity: gridOpacity
    });

    Http.onreadystatechange = function() {
        if (Http.readyState === 4) {
            response = JSON.parse(Http.responseText);
            if (Http.status === 200) {
                console.log(response.message);
                showToast(response.message, "toast-success");
            } else {
                console.log("Error saving color choices: ", response.message);
                showToast(response.message, "toast-error");
                return;
            }
        }
    };

    Http.send(data);

    //Once we have confirmation the choices have been saved, we update each channel with their new colors.
    for (let i = 1; i < 11; i++){
        channelsMetaData["CH"+i].colorDark = ColorChoicesDark[i -1];
        channelsMetaData["CH"+i].colorLight = ColorChoicesLight[i -1];
        try {//In case we have channels not directly next to one another (eg. CH1, CH2, CH7, CH9)
            channelData["CH"+i].colorDark = ColorChoicesDark[i -1];
            channelData["CH"+i].colorLight = ColorChoicesLight[i -1];
        } catch (error) {}
    }
    config.gridOpacity = gridOpacity;

    //We finish off by changing the channel buttons' color & their offset cursor.
    Object.keys(channelData).forEach(key => {
        if (channelData[key].display == true){
            if (config.theme == "dark"){
                document.getElementById(key).className = "ch-button channel-displayed " + channelData[key].colorDark;
                document.getElementById("scroller-"+key).style.backgroundColor = channelData[key].colorDark
            }else{
                document.getElementById(key).className = "ch-button channel-displayed " + channelData[key].colorLight;
                document.getElementById("scroller-"+key).style.backgroundColor = channelData[key].colorLight
            }
        }
    });

    let timeDelay = parseInt(document.getElementById("timeDelayInput").value, 10);
    if (timeDelay > 1000){
        timeDelay = 1000;
    }else if(timeDelay < 30){
        timeDelay = 30;
    }
    loopDelay = timeDelay;
    clearInterval(LOOP);
    MAINLOOP();
};

/*
╔══════════════════════════════════════════════════════╗
║        CODE FLOW (START - LOOP - EVENTS)             ║
╚══════════════════════════════════════════════════════╝
*/

function environmentSetup(){//This function sets up anything necessary for interacting with the oscilloscope (EVentlisteners, etc)
    let isDragging = false;
    
    const verticalScalingKnob = document.getElementById("vertical-scaling");
    const horizontalScalingKnob = document.getElementById("horizontal-scaling");
    
    const scrollBarHorizontal = document.getElementById("scrollbar-horizontal");
    const scrollerHorizontal = document.getElementById("scroller-Horizontal");
    let startX;


    for (let i = 1; i < 11; i++) {//Setup listeners to change a button's aspect when clicked
        let channel = "CH" + i;
        document.getElementById(channel).addEventListener("click", function() {
            // console.log(`Channel ${channel} clicked!`);
            changeChannelButtonStatus(channel);
        });
    };

    //===================== HORIZONTAL OFFSET INTERACTIONS (MOUSE) =====================

    scrollerHorizontal.addEventListener('mousedown', function(event) {
        isDragging = true;
        startX = event.clientX - scrollerHorizontal.getBoundingClientRect().left + scrollBarHorizontal.getBoundingClientRect().left;
        document.addEventListener('mousemove', onMouseMoveHorizontal);
        document.addEventListener('mouseup', onMouseUpHorizontal);
    });

    function onMouseMoveHorizontal(event) {
        if (!isDragging) return;
        
        let newX = event.clientX - startX;
        newX = Math.max(newX, 0);
        newX = Math.min(newX, scrollBarHorizontal.clientWidth - scrollerHorizontal.clientWidth);

        scrollerHorizontal.style.left = newX + 'px';

        let percent = newX / (scrollBarHorizontal.clientWidth - scrollerHorizontal.clientWidth);
        horizontalOffset = (percent - 0.5) * 1000;
        horizontalOffset = Math.round(horizontalOffset);
    };

    function onMouseUpHorizontal(event) {
        isDragging = false;

        document.removeEventListener('mousemove', onMouseMoveHorizontal);
        document.removeEventListener('mouseup', onMouseUpHorizontal);
    };

    //===================== VERTICAL SCALING INTERACTIONS (KNOB) =====================
    verticalScalingKnob.addEventListener("input", function() {
        isDragging = true;
        Object.keys(channelData).forEach(key => {
            if (channelData[key].focused) {
                channelData[key].verticalScale = parseFloat(this.value);//convert from str to int (base10)
            }
        });
    });

    verticalScalingKnob.addEventListener("mousedown", function() {
        isDragging = false;
    });

    //Setup listener to detect a click on the knob and reinitialize the vertical scale to the default value.
    verticalScalingKnob.addEventListener("mouseup", function(){
        Object.keys(channelData).forEach(key => {
            if (channelData[key].focused && !isDragging) {
                verticalScalingKnob.value = 1;
                channelData[key].verticalScale = 1;//convert from str to int (base10)
            }
        });
        isDragging = false;
    });

    //===================== HORIZONTAL SCALING INTERACTIONS (KNOB) =====================

    horizontalScalingKnob.addEventListener("input", function(){
        isDragging = true;
        horizontalScale = parseInt(this.value);
    });

    horizontalScalingKnob.addEventListener("mousedown", function(){
        isDragging = false;
    });

    horizontalScalingKnob.addEventListener("mouseup", function(){
        if (!isDragging){
            horizontalScalingKnob.value = 50;
            horizontalScale = 50;
        }
        isDragging = false;
    });


    //===================== RUN/STOP BUTTON INTERACTIONS =====================

    RUNSTOP.addEventListener("click", function() {
        if (isRunning) {
            isRunning = false;
            RUNSTOP.innerHTML = "RUN";
            console.log("stopped the oscillo");
        } else {
            if (config.mode == null || config.mode == "NA"){
                showToast("Your settings are not set yet.\nClick on the 'Settings' button to set them up.", "toast-error");
            }else{
                //console.log("Starting the oscilloscope");
                isRunning = true;
                RUNSTOP.innerHTML = "STOP";
            }
        }
    });

    //===================== PRINT BUTTON INTERACTIONS =====================

    PRINT.addEventListener("click", function(){downloadCanvasAsImage("png")});

    //===================== SAVE BUTTON INTERACTIONS =====================
    
    SAVE.addEventListener("click", function(){
        populateModalForSave();
        displayBaseModal();

        DocFileName = "module-SAVE.html";
    });


    //===================== MEASURE BUTTON INTERACTIONS =====================

    MEASURE.addEventListener("click", function(){
        populateModalForMeasure_MATHS();
        displayBaseModal();

        DocFileName = "module-MEASURE.html";
    });


    //===================== TRIGGER BUTTON INTERACTIONS =====================

    TRIGGER.addEventListener("click", function(){
        if (triggered){
            triggered = false;
        }else{
            populateModalForTrigger();
            displayBaseModal();
        }
        DocFileName = "module-TRIGGER.html";
    });

    //===================== AUTOSET BUTTON INTERACTIONS =====================

    AUTOSET.addEventListener("click", function(){
        autoset();
        DocFileName = "module-AUTOSET.html";
    });

    //===================== CURSORS BUTTON INTERACTIONS =====================

    CURSORS.addEventListener("click", function(){
        populateModalForCursors();
        displayBaseModal();

        DocFileName = "module-CURSORS.html";
    });

    //===================== SIZE BUTTON INTERACTIONS =====================

    SIZE.addEventListener("click", function(){
        populateModalForSize();
        displayBaseModal();

        DocFileName = "module-SIZE.html";
    });


    //===================== SETUP CANVAS INTERACTIONS (ZOOM) =====================

    CANVAS.addEventListener('mousedown', (e) => {
        if (isRunning && zoomConfig.isZoomed == false){
            const rect = CANVAS.getBoundingClientRect();

            zoomConfig.initX = e.clientX - rect.left;
            zoomConfig.initY = e.clientY - rect.top;
            zoomConfig.isDrawing = true;
        }else{
            if (zoomConfig.isZoomed == true){
                showToast("The screen is already zoomed-in.", "toast-error");
            }else{
                showToast("Can't zoom while the oscilloscope is stopped", "toast-error");
            }
        }
    });

    CANVAS.addEventListener('mousemove', (e) => {
        if (!zoomConfig.isDrawing) return;

        const rect = CANVAS.getBoundingClientRect();
        
        zoomConfig.finalX = e.clientX - rect.left;
        zoomConfig.finalY = e.clientY - rect.top;
    });

    CANVAS.addEventListener('mouseup', () => {
        if (isRunning && zoomConfig.isDrawing && zoomConfig.isZoomed == false){
            zoomConfig.isDrawing = false;
            calculateZoomFactors();
            // console.log("Zoom config : ", zoomConfig);
    
            const ctx = CANVAS.getContext('2d');
            ctx.setTransform(zoomConfig.zoomX, 0, 0, zoomConfig.zoomY, -zoomConfig.initX * zoomConfig.zoomX, -zoomConfig.initY * zoomConfig.zoomY);
            ctx.restore();

            zoomConfig.isZoomed = true;
            showToast("Press Shift + X to exit zoomed mode", "toast-info");
        }
    });
    
    //===================== DISPLAY BUTTON INTERACTIONS =====================

    DISPLAY.addEventListener("click", function(){
        populateModalForDisplay();
        displayBaseModal();

        DocFileName = "module-DISPLAY.html";
    });

    //===================== GENERAL ZOOM RESET VIA KEY PRESS CTRL + X =====================

    document.addEventListener('keydown', function(e){
        if (e.key === "X" && e.shiftKey) {
            resetZoom();
        }
    });

    //===================== SETUP BUTTON INTERACTIONS =====================

    SETUP.addEventListener("click", function(){
        populateModalForSetup();
        displayBaseModal();

        DocFileName = "module-SETUP.html";
    });

    //====================== AVOID MODAL DUPLICATIONS =======================

    function preventSpaceTrigger(event) {
        if (event.key === " " || event.code === "Space") {
            event.preventDefault();
        }
    }

    const buttons = [RUNSTOP, CURSORS, DISPLAY, TRIGGER, SAVE, AUTOSET, MEASURE, PRINT, SETUP, SIZE]
    buttons.forEach(button => {
        button.addEventListener("keydown", preventSpaceTrigger);
    });

    setupTriggerCursor();

    //This part is not absolutely necessary, it justs show the grid of the screen before the oscillo has been started.
    drawGrid('rgba(128, 128, 128, 0.5)', 3);

    getCurrentSettings();
};

function MAINLOOP(){
    LOOP = setInterval(function() {
        if (config.mode != null){
            if (isRunning && !triggered){
                if (config.mode == "FILE"){
                    fetchDataFromFile();
                }else if (config.mode == "REAL-TIME"){
                    fetchRawData();
                }
                setScreenInformation();
            }else if(triggered || !isRunning){
                clearCanvas();
                drawGrid('rgba(128, 128, 128, 0.5)', 3);
                Object.keys(channelData).forEach(key => {
                    //We check here wether there could be a signal to generate from a math function that has been set during a trigger.
                    //In which case it wouldn't be drawn directly because the 'generatepoints' function is called when fetching data which we aren't when triggered.
                    if (channelData[key].type == "generatedData" && channelData[key].points.length == 0){
                        generatePoints(key);
                    };

                    if (channelData[key].display === true){
                        if (channelData[key].type == "generatedData" && channelData[key].operation == "fft"){
                            drawFFT(key);
                        }else{
                            drawSignal(key);
                            setScreenInformation();
                        }
                    };
                });
                if (cursorOptions.isVerticalCursorOn == "true" || cursorOptions.isHorizontalCursorOn == "true"){
                    drawCursors();
                }
                //Here we check whether the trigger is active or not to add the trigger level cursor.
                if (triggerOptions.isTriggerOn == "on"){
                    drawTriggerCursor();
                }else{
                    document.getElementById("trigger-cursor").style.display = "none";
                };
                if ((triggerClock / 1000) > triggerOptions.holdOff){
                    triggerClock = 0;
                    triggered = false;
                }else{
                    triggerClock = triggerClock + loopDelay;
                }
            }
        }else{
            console.log("Still waiting on settings retrieval");
        }
    }, loopDelay);
};

document.addEventListener('DOMContentLoaded', function() {
    environmentSetup();//we load all the necessary event listeners for the oscilloscope

    MAINLOOP();
});
