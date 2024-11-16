/*
╔══════════════════════════════════════════════════════╗
║              MODAL GENERATION & FILLING              ║
╚══════════════════════════════════════════════════════╝
*/

function createSelect(options){
    const selectElement = document.createElement("select");
    options.forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = option.value;
        optionElement.textContent = option.text;
        selectElement.appendChild(optionElement)
    });
    selectElement.classList.add("modal-select-trigger");
    return selectElement;
};

function displayBaseModal(){
    MODAL.style.display = "block";

    let modalClose = document.getElementsByClassName("close")[0];


    modalClose.onclick = function() {
        hideModal();
    };

    window.onclick = function(event) {
        if (event.target == MODAL) {
            hideModal();
        }
    };
};

function hideModal() {
    MODAL.style.display = "none"; // Hide the modal by setting display to 'none'
    clearModal();

    DocFileName = "module-MAIN-PAGE.html";
};

function clearModal(){
    let modalContentDiv = document.getElementById("modal-generated-content");

    //Here instead of just removing the children of this element, we clone it and replace it with the clone
    //This ensures that the event listeners are also removed.
    let modalClone = modalContentDiv.cloneNode(false);
    modalContentDiv.parentNode.replaceChild(modalClone, modalContentDiv);
};

function populateModalForMeasure_AUTO(){
    let modalContentDiv = document.getElementById("modal-generated-content");

    const channelOptions = [];
    Object.keys(channelData).forEach(key => {
        let channelNumber = parseInt(key.substring(2), 10)
        channelOptions.push({value: key, text: "Channel " + channelNumber});
    });

    const measureOptions = [
        {text: "Min", varKey: "min", id: "minButton", onClick: () => { toggleMeasurement('min', "minButton"); }},
        {text: "Max", varKey: "max", id: "maxButton", onClick: () => { toggleMeasurement('max', "maxButton") }},
        {text: "Vpp", varKey: "vpp", id: "vppButton", onClick: () => { toggleMeasurement('vpp', "vppButton") }},
        {text: "Avg", varKey: "mean", id: "avgButton", onClick: () => { toggleMeasurement('mean', "avgButton") }},
        {text: "RMS", varKey: "rms", id: "rmsButton", onClick: () => { toggleMeasurement('rms', "rmsButton") }},
        {text: "F Avg", varKey: "freq", id: "freqButton", onClick: () => { toggleMeasurement('freq', "freqButton") }},
        {text: "High", varKey: "highFreq", id: "highButton", onClick: () => { toggleMeasurement('highFreq', "highButton") }},
        {text: "Low", varKey: "lowFreq", id: "lowButton", onClick: () => { toggleMeasurement('lowFreq', "lowButton") }},
        {text: "Mid", varKey: "mid", id: "midButton", onClick: () => { toggleMeasurement('mid', "midButton") }},
    ];

    const title = document.createElement("h5");
    title.innerHTML = "Auto Measurements";
    modalContentDiv.appendChild(title);

    const container1 = document.createElement("span");

    const label1 = document.createElement("label");
    label1.textContent = "Channel : ";
    container1.appendChild(label1);

    const selectChannel = createSelect(channelOptions);
    selectChannel.id = "selectChannel";
    selectChannel.value = autoMeasureOptions.associatedChannel;
    container1.appendChild(selectChannel);

    selectChannel.addEventListener("change", function(){
        autoMeasureOptions.associatedChannel = selectChannel.value;
    });

    modalContentDiv.appendChild(container1);

    const buttonContainer = document.createElement("span");
    buttonContainer.id = "buttonContainer";

    measureOptions.forEach(option => {
        const button = document.createElement("button");
        button.textContent = option.text;
        button.id = option.id;
        button.classList.add("modal-measure-button");
        button.addEventListener("click", option.onClick);
        buttonContainer.appendChild(button);

        //set the buttons green if this measure is set
        if (autoMeasureOptions[option.varKey].set) {
            button.className = 'modal-measure-button active-measure-button';
        }else{
            button.className = 'modal-measure-button inactive-measure-button';
        }
    });

    modalContentDiv.appendChild(buttonContainer);

    const resetButton = document.createElement("button");
    resetButton.textContent = "RESET";
    resetButton.id = "resetButton";
    resetButton.classList.add("modal-measure-button");

    resetButton.addEventListener("click", function(){
        resetMeasurements();
    });

    const autoSwitchButton = document.createElement("button");
    autoSwitchButton.textContent = "← Math Functions";
    autoSwitchButton.id = "autoSwitchButton";
    autoSwitchButton.classList.add("modal-measure-button");

    autoSwitchButton.addEventListener("click", function(){
        clearModal();
        populateModalForMeasure_MATHS();
    });

    modalContentDiv.appendChild(resetButton);
    modalContentDiv.appendChild(autoSwitchButton);
};

function populateModalForSave(){
    let modalContentDiv = document.getElementById("modal-generated-content");

    title = document.createElement("h5");
    csvButton = document.createElement("button");
    pngButton = document.createElement("button");
    jpegButton = document.createElement("button");
    clipBoardButton = document.createElement("button");

    title.innerHTML = "Choose a saving option";

    csvButton.classList.add("modal-save-button");
    pngButton.classList.add("modal-save-button");
    jpegButton.classList.add("modal-save-button");
    clipBoardButton.classList.add("modal-save-button");

    csvButton.innerHTML = "Save as CSV";
    pngButton.innerHTML = "Save as PNG";
    jpegButton.innerHTML = "Save as JPEG";
    clipBoardButton.innerHTML = "Copy to clipboard";

    modalContentDiv.appendChild(title);
    modalContentDiv.appendChild(csvButton);
    modalContentDiv.appendChild(pngButton);
    modalContentDiv.appendChild(jpegButton);
    modalContentDiv.appendChild(clipBoardButton);


    csvButton.addEventListener("click", downloadDataToCsv);
    pngButton.addEventListener("click", function(){downloadCanvasAsImage("png")});
    jpegButton.addEventListener("click", function(){downloadCanvasAsImage("jpeg")});
    clipBoardButton.addEventListener("click", copyCanvasToClipboard);
};

function populateModalForMeasure_MATHS(){
    let modalContentDiv = document.getElementById("modal-generated-content");

    const emptySlotOptions = [];
    for (let i = 1; i < 11; i++){
        if (channelData["CH" + i] == undefined){//this condition is to avoid overwriting a maths channel that is already in use
            emptySlotOptions.push({value: "CH" + i, text: "Channel " + i});
        }; 
    }

    const channelOptions = [];
    Object.keys(channelData).forEach(key => {
        channelOptions.push({value: key, text: key});
    });

    const operationOptions = [
        {value: "none", text: "None"},
        {value: "add", text: "+"},
        {value: "sub", text: "-"},
        {value: "mult", text: "*"},
        {value: "div", text: "/"},
        {value: "squared", text: "²"},
        {value: "deriv", text: "derivative"},
        {value: "integral", text: "integral"},
        {value: "fft", text: "FFT"},
    ];

    const title = document.createElement("h5");
    title.innerHTML = "Math functions";
    modalContentDiv.appendChild(title);

    const container1 = document.createElement("span");

    const label1 = document.createElement("label");
    label1.textContent = "Channel slot : ";
    container1.appendChild(label1);

    const selectSlotChannel = createSelect(emptySlotOptions);
    selectSlotChannel.id = "selectSlotChannel";
    container1.appendChild(selectSlotChannel);

    modalContentDiv.appendChild(container1);
    const container2 = document.createElement("span");

    const label2 = document.createElement("label");
    label2.textContent = "Channel : ";
    container2.appendChild(label2);

    const selectChannel = createSelect(channelOptions);
    selectChannel.id = "selectChannel";
    container2.appendChild(selectChannel);

    modalContentDiv.appendChild(container2);
    const container3 = document.createElement("span");

    const label3 = document.createElement("label");
    label3.textContent = "Operation : ";
    container3.appendChild(label3);

    const selectOperation = createSelect(operationOptions);
    selectOperation.id = "selectOperation";
    container3.appendChild(selectOperation);

    modalContentDiv.appendChild(container3);

    const container4 = document.createElement("span");

    const label4 = document.createElement("label");
    label4.textContent = "Channel 2 : ";
    container4.appendChild(label4);

    const selectSecondChannel = createSelect(channelOptions);
    selectSecondChannel.id = "selectSecondChannel";
    selectSecondChannel.value = "none";
    container4.style.display = "none";//hidden by default until user chooses an operation requiring a 2nd channel
    container4.appendChild(selectSecondChannel);

    modalContentDiv.appendChild(container4);

    selectOperation.addEventListener("change", function(){
        const value = selectOperation.value;
        if (value == "add" || value == "sub" || value == "mult" || value == "div"){
            container4.style.display = "block";
        }else{
            container4.style.display = "none";
        }
    });

    const saveButton = document.createElement("button");
    saveButton.textContent = "SAVE";
    saveButton.id = "saveButton";
    saveButton.classList.add("modal-measure-button");

    const autoSwitchButton = document.createElement("button");
    autoSwitchButton.textContent = "Auto-Measures →";
    autoSwitchButton.id = "autoSwitchButton";
    autoSwitchButton.classList.add("modal-measure-button");

    //function to check wether we can indeed generate the math signal
    //and then include it in a channel object
    saveButton.addEventListener("click", function(){
        let slotChannel = selectSlotChannel.value;
        let channel1 = selectChannel.value;
        let channel2 = selectSecondChannel.value;
        let operation = selectOperation.value;

        if (operation == "none"){
            showToast("Please select an operation", "toast-error");
        }else{
            if (channel1 == channel2){
                if (operation == "add" || operation == "sub" || operation == "mult" || operation == "div"){
                    showToast("Please select two different channels", "toast-error");
                }else{
                    updateGeneratedMathSignalsData(slotChannel, channel1, channel2, operation);
                    clearModal();
                    populateModalForMeasure_MATHS();
                }
            }else{
                updateGeneratedMathSignalsData(slotChannel, channel1, channel2, operation);
                clearModal();
                populateModalForMeasure_MATHS();
            }
        };
    });
    
    //this section is to display the currently generated math signals
    //and offer the opportunity to the user delete one if he wants to
    const generatedSignalsDiv = document.createElement("div");

    const generatedSignals = []
    Object.keys(channelData).forEach(key => {
        if (channelData[key].type == "generatedData"){
            generatedSignals.push(key);
        }
    });

    if (generatedSignals.length != 0){
        const generatedSignalsTitle = document.createElement("h6");
        generatedSignalsTitle.textContent = "Maths Channels in-use : ";
        generatedSignalsDiv.appendChild(generatedSignalsTitle);

        generatedSignals.forEach(signal => {
            const signalSpan = document.createElement("span");
            const signalText = document.createElement("p");
            const deleteButton = document.createElement("button");

            signalSpan.classList.add("generated-signal");
            signalText.textContent = signal + " → ";
            // deleteButton.textContent = "X";
            deleteButton.classList.add("delete-button");

            signalSpan.appendChild(signalText);
            signalSpan.appendChild(deleteButton);
            generatedSignalsDiv.appendChild(signalSpan);

            deleteButton.addEventListener("click", function(){
                delete channelData[signal];
                signalSpan.remove();

                channelButton = document.getElementById(signal);

                channelButton.className = "channel-not-displayed";
                config.numChannels -= 1;

                //Here we also get rid of the cursor associated to the signal.
                const scroller = document.getElementById("scroller-" + signal);
                scroller.style.display = "none";

                clearModal();
                populateModalForMeasure_MATHS();
            });
        });
    };

    autoSwitchButton.addEventListener("click", function(){
        console.log("switch to auto-measurements")
        clearModal();
        populateModalForMeasure_AUTO();
    });

    modalContentDiv.appendChild(saveButton);
    if (generatedSignals.length != 0){modalContentDiv.appendChild(generatedSignalsDiv);};
    modalContentDiv.appendChild(autoSwitchButton);
};

function populateModalForTrigger(){
    // console.log("Trigger settings : ", triggerOptions);
    let modalContentDiv = document.getElementById("modal-generated-content");

    const triggerOnOffOptions = [
        {value: "off", text: "Off"},
        {value: "on", text: "On"},
    ]

    const triggerModeOptions = [
        {value: "edge", text: "Edge-Trigger"},
        {value: "window", text: "Window-Trigger"},
    ]

    const triggerChannelOptions = [];
    Object.keys(channelData).forEach(key => {
        let channelNumber = parseInt(key.substring(2), 10)
        triggerChannelOptions.push({value: key, text: "Channel " + channelNumber});
    });

    const triggerSlopeOptions = [
        {value: "both", text: "Both"},
        {value: "rising", text: "Rising"},
        {value: "falling", text: "Falling"},
    ]

    const title = document.createElement("h5");
    title.innerHTML = "Trigger options";
    modalContentDiv.appendChild(title);

    const label1 = document.createElement("label"); //Trigger on/off
    label1.textContent = "Trigger on/off";
    modalContentDiv.appendChild(label1);

    const selectOnOffStatus = createSelect(triggerOnOffOptions);
    selectOnOffStatus.id = "selectOnOffStatus";
    selectOnOffStatus.value = triggerOptions.isTriggerOn;
    modalContentDiv.appendChild(selectOnOffStatus);

    const label2 = document.createElement("label"); //Trigger mode
    label2.textContent = "Trigger mode";
    modalContentDiv.appendChild(label2);

    const selectTriggerMode = createSelect(triggerModeOptions);
    selectTriggerMode.id = "selectTriggerMode";
    selectTriggerMode.value = triggerOptions.triggerMode;
    modalContentDiv.appendChild(selectTriggerMode);

    const label3 = document.createElement("label"); //Trigger channel
    label3.textContent = "Trigger channel";
    modalContentDiv.appendChild(label3);

    const selectTriggerChannel = createSelect(triggerChannelOptions);
    selectTriggerChannel.id = "selectTriggerChannel";
    selectTriggerChannel.value = triggerOptions.triggerChannel;
    modalContentDiv.appendChild(selectTriggerChannel);

    const label4 = document.createElement("label"); //Trigger slope
    label4.textContent = "Trigger slope";
    modalContentDiv.appendChild(label4);

    const selectTriggerSlope = createSelect(triggerSlopeOptions);
    selectTriggerSlope.id = "selectTriggerSlope";
    selectTriggerSlope.value = triggerOptions.triggerSlope;
    modalContentDiv.appendChild(selectTriggerSlope);


    const label5 = document.createElement("label"); //Trigger level
    label5.textContent = "Trigger level (mV)";
    modalContentDiv.appendChild(label5);

    const TriggerLevelInput = document.createElement("input");
    TriggerLevelInput.type = "number";
    TriggerLevelInput.min = -(config.voltage / 2) * 1000;
    TriggerLevelInput.max = (config.voltage / 2) * 1000;
    TriggerLevelInput.value = triggerOptions.triggerLevel;
    TriggerLevelInput.classList.add("modal-select-trigger");
    TriggerLevelInput.id = "TriggerLevelInput";
    modalContentDiv.appendChild(TriggerLevelInput);

    const label6 = document.createElement("label"); //Window level min
    label6.textContent = "Window level min (mV)";
    modalContentDiv.appendChild(label6);

    const WindowLevelMinInput = document.createElement("input");
    WindowLevelMinInput.type = "number";
    WindowLevelMinInput.min = -(config.voltage / 2) * 1000;
    WindowLevelMinInput.max = (config.voltage / 2) * 1000;
    WindowLevelMinInput.value = triggerOptions.windowLevelMin;
    WindowLevelMinInput.classList.add("modal-select-trigger");
    WindowLevelMinInput.id = "WindowLevelMinInput";
    modalContentDiv.appendChild(WindowLevelMinInput);

    const label7 = document.createElement("label"); //Window level max
    label7.textContent = "Window level max (mV)";
    modalContentDiv.appendChild(label7);

    const WindowLevelMaxInput = document.createElement("input");
    WindowLevelMaxInput.type = "number";
    WindowLevelMaxInput.min = -(config.voltage / 2) * 1000;
    WindowLevelMaxInput.max = (config.voltage / 2) * 1000;
    WindowLevelMaxInput.value = triggerOptions.windowLevelMax;
    WindowLevelMaxInput.classList.add("modal-select-trigger");
    WindowLevelMaxInput.id = "WindowLevelMaxInput";
    modalContentDiv.appendChild(WindowLevelMaxInput);

    if (triggerOptions.triggerMode == "edge"){
        WindowLevelMinInput.disabled = true;
        WindowLevelMaxInput.disabled = true;
        TriggerLevelInput.disabled = false;
    }else{
        WindowLevelMinInput.disabled = false;
        WindowLevelMaxInput.disabled = false;
        TriggerLevelInput.disabled = true;
    }

    selectTriggerMode.addEventListener("change", function(){
        console.log("Trigger mode changed to : ", selectTriggerMode.value);
        if (selectTriggerMode.value === "edge"){
            WindowLevelMinInput.disabled = true;
            WindowLevelMaxInput.disabled = true;
            TriggerLevelInput.disabled = false;
        } else if (selectTriggerMode.value === "window"){
            WindowLevelMinInput.disabled = false;
            WindowLevelMaxInput.disabled = false;
            TriggerLevelInput.disabled = true;
        }
    });

    const label8 = document.createElement("label"); //Hold off
    label8.textContent = "Hold off (s)";
    modalContentDiv.appendChild(label8);

    const holdOffInput = document.createElement("input");
    holdOffInput.type = "number";
    holdOffInput.min = 0;
    holdOffInput.max = 3600;
    holdOffInput.value = triggerOptions.holdOff;
    holdOffInput.classList.add("modal-select-trigger");
    holdOffInput.id = "holdOffInput";
    modalContentDiv.appendChild(holdOffInput);

    const button = document.createElement("button");// SAVE CHANGES
    button.textContent = "Apply Trigger Settings";
    button.classList.add("modal-trigger-button");
    button.id = "triggerOptionsSaveButton";
    modalContentDiv.appendChild(button);

    button.addEventListener("click", function(){
        updateTriggerSettings(modalContentDiv);
        hideModal();
    });
};

function populateModalForCursors(){
    let modalContentDiv = document.getElementById("modal-generated-content");

    const horizontalOptions = [
        {text: "On", value: "true"},
        {text: "Off", value: "false"}
    ];

    const verticalOptions = [
        {text: "On", value: "true"},
        {text: "Off", value: "false"}
    ];

    const valueOptions = [
        {text: "On cursor", value: "oncursor"},
        {text: "In display", value: "indisplay"}
    ];

    const title = document.createElement("h5");
    title.innerHTML = "Cursor Options";
    modalContentDiv.appendChild(title);

    const container1 = document.createElement("span");

    const label1 = document.createElement("label");
    label1.textContent = "Horizontal : ";
    container1.appendChild(label1);

    const selectHorizontal = createSelect(horizontalOptions);
    selectHorizontal.id = "selectHorizontal";
    selectHorizontal.value = cursorOptions.isHorizontalCursorOn;
    container1.appendChild(selectHorizontal);

    selectHorizontal.addEventListener("change", function(){
        cursorOptions.isHorizontalCursorOn = this.value;
        toggleDisplayForHorizontalCursorScrollers();
    });

    modalContentDiv.appendChild(container1);
    const container2 = document.createElement("span");

    const label2 = document.createElement("label");
    label2.textContent = "Vertical : ";
    container2.appendChild(label2);

    const selectVertical = createSelect(verticalOptions);
    selectVertical.id = "selectVertical";
    selectVertical.value = cursorOptions.isVerticalCursorOn;
    container2.appendChild(selectVertical);

    selectVertical.addEventListener("change", function(){
        cursorOptions.isVerticalCursorOn = this.value;
        toggleDisplayForVerticalCursorScrollers();
    });

    modalContentDiv.appendChild(container2);
    const container3 = document.createElement("span");

    const label3 = document.createElement("label");
    label3.textContent = "Value : ";
    container3.appendChild(label3);

    const selectValue = createSelect(valueOptions);
    selectValue.id = "selectValue";
    selectValue.value = cursorOptions.cursorsValueDisplay;
    container3.appendChild(selectValue);

    selectValue.addEventListener("change", function(){
        cursorOptions.cursorsValueDisplay = this.value;
    });

    modalContentDiv.appendChild(container3);

    const resetButton = document.createElement("button");
    resetButton.textContent = "Reset Cursors";
    resetButton.id = "resetButton";
    resetButton.classList.add("modal-measure-button");

    modalContentDiv.appendChild(resetButton);

    resetButton.addEventListener("click", function(){
        console.log("Reset the cursors.");
        cursorOptions.isVerticalCursorOn = "false";
        cursorOptions.isHorizontalCursorOn = "false";
        cursorOptions.cursorsValueDisplay = "oncursor";
        cursorOptions.horizontalAPosition = 266;
        cursorOptions.horizontalBPosition = 533;
        cursorOptions.verticalAPosition = 400;
        cursorOptions.verticalBPosition = 800;
        selectHorizontal.value = "false";
        selectVertical.value = "false";
        selectValue.value = "oncursor";
        document.getElementById("vertical-scroller-A").style.display = "none";
        document.getElementById("vertical-scroller-B").style.display = "none";
        document.getElementById("scroller-horizontal-A").style.display = "none";
        document.getElementById("scroller-horizontal-B").style.display = "none";
    });
};

function populateModalForSize(){
    let modalContentDiv = document.getElementById("modal-generated-content");

    const sizeOptions = [
        {text: "Tiny", value: "400|267"},
        {text: "Small", value: "800|533"},
        {text: "Standard", value: "1200|800"},
        {text: "Large", value: "1400|900"},
        {text: "Maximized", value: "TD"},//determine current window size and apply canvas to that size
    ];

    const title = document.createElement("h5");
    title.innerHTML = "Screen size";
    modalContentDiv.appendChild(title);

    const selectSize = createSelect(sizeOptions);
    selectSize.id = "sizeSelectionInput";
    if (CANVAS.width == 400){
        selectSize.value = "400|267";
    }else if (CANVAS.width == 800){
        selectSize.value = "800|533";
    }else if (CANVAS.width == 1200){
        selectSize.value = "1200|800";
    }else if (CANVAS.width == 1400){
        selectSize.value = "1400|900";
    }else{
        selectSize.value = "TD";
    }
    modalContentDiv.appendChild(selectSize);

    selectSize.addEventListener("change", function(){
        changeScreenSize(selectSize.value);
    });
};

function populateModalForDisplay(){
    let modalContentDiv = document.getElementById("modal-generated-content");

    const title = document.createElement("h5");
    title.innerHTML = "Display options";
    modalContentDiv.appendChild(title);

    const unzoomButton = document.createElement("button");
    unzoomButton.textContent = "Unzoom";
    unzoomButton.id = "unzoomButton";
    unzoomButton.classList.add("modal-measure-button");

    unzoomButton.addEventListener("click", function(){
        if (zoomConfig.isZoomed){
            resetZoom();
            showToast("Zoom reset", "toast-info");
        }else{
            showToast("No zoom to reset", "toast-error");
        }
    });

    modalContentDiv.appendChild(unzoomButton);

    const gridOptions = [
        {text: "On", value: 1},
        {text: "Off", value: 0}, 
    ]

    const container1 = document.createElement("span");

    const label2 = document.createElement("label");
    label2.textContent = "Grid Display : ";
    container1.appendChild(label2);

    const selectGridDisplay = createSelect(gridOptions);
    selectGridDisplay.id = "selectGridDisplay";
    selectGridDisplay.value = config.gridDisplay;
    
    container1.appendChild(selectGridDisplay);
    modalContentDiv.appendChild(container1);

    selectGridDisplay.addEventListener("change", function(){
        if (selectGridDisplay.value == 1){
            config.gridDisplay = 1;
            showToast("Grid displayed", "toast-info");
            if (!isRunning){
                drawGrid('rgba(128, 128, 128, 0.5)', 3);
            };
        }else{
            config.gridDisplay = 0;
            showToast("Grid Removed", "toast-info");
            if (!isRunning){
                clearCanvas();
            };
        }
    });

    const lightModeOptions = [
        {text: "Light", value: "light"},
        {text: "Dark", value: "dark"},
    ];

    const container2 = document.createElement("span");

    const label3 = document.createElement("label");
    label3.textContent = "Theme : ";
    container2.appendChild(label3);

    const selectTheme = createSelect(lightModeOptions);
    selectTheme.id = "selectTheme";
    selectTheme.value = config.theme;

    container2.appendChild(selectTheme);
    modalContentDiv.appendChild(container2);

    selectTheme.addEventListener("change", function(){changeScreenLightMode(selectTheme.value)});
};

function populateModalForSetup(){
    let modalContentDiv = document.getElementById("modal-generated-content");

    const colorOptionsLight = [
        //We have to display the color's name because some browsers (firefox) do not display the colors of "option" elements.
        {text: "Green", value: "green"},
        {text: "Red", value: "red"},
        {text: "Gray", value: "gray"},
        {text: "Olive", value: "olive"},
        {text: "Cyan", value: "cyan"},
        {text: "Orange", value: "orange"},
        {text: "Maroon", value: "maroon"},
        {text: "Blue", value: "blue"},
        {text: "Purple", value: "purple"},
        {text: "Black", value: "black"},
    ];

    const colorOptionsDark = [
        {text: "Lime", value: "lime"},
        {text: "Red", value: "red"},
        {text: "Cyan", value: "cyan"},
        {text: "Yellow", value: "yellow"},
        {text: "Green", value: "green"},
        {text: "Orange", value: "orange"},
        {text: "Pink", value: "pink"},
        {text: "Blue", value: "blue"},
        {text: "Fuchsia", value: "fuchsia"},
        {text: "White", value: "white"},
    ];

    const title = document.createElement("h4");
    title.textContent = "Setup Options";
    modalContentDiv.appendChild(title);

    const container1 = document.createElement("div");
    container1.id = "colorSelectionContainer";

    const container2 = document.createElement("div");
    container2.id = "DarkColorSelectionContainer";

    const container3 = document.createElement("div");
    container3.id = "LightColorSelectionContainer";

    const subTitle1 = document.createElement("h5");
    subTitle1.textContent = "Dark";
    const subTitle2 = document.createElement("h5");
    subTitle2.textContent = "Light";

    container1.appendChild(container2);
    container1.appendChild(container3)
    container2.appendChild(subTitle1);
    container3.appendChild(subTitle2);

    for (let i = 1; i < 11; i++){//Dark mode color options
        const individualChannelColorContainer = document.createElement("span");
        individualChannelColorContainer.classList.add("individualChannelColorContainer");
        const para = document.createElement("p");
        para.textContent = "CH" + i;
        const colorSelect = createSelect(colorOptionsDark);
        colorSelect.id = "channelColorD-"+i;

        colorSelect.style.backgroundColor = channelsMetaData["CH"+i].colorDark;
        colorSelect.value = channelsMetaData["CH"+i].colorDark;

        colorSelect.addEventListener("change", function(){
            colorSelect.style.backgroundColor = colorSelect.value;
        });

        //These 3 lines below display the color associated with each option element
        //It does not work on certain browser (firefox)
        colorSelect.childNodes.forEach((option, index) => {
            option.style.backgroundColor = colorOptionsDark[index].value;
        });

        individualChannelColorContainer.appendChild(para);
        individualChannelColorContainer.appendChild(colorSelect);
        container2.appendChild(individualChannelColorContainer);
    };

    for (let i = 1; i < 11; i++){//Light mode color options
        const individualChannelColorContainer = document.createElement("span");
        individualChannelColorContainer.classList.add("individualChannelColorContainer");
        const para = document.createElement("p");
        para.textContent = "CH" + i;
        const colorSelect = createSelect(colorOptionsLight);
        colorSelect.id = "channelColorL-"+i;

        colorSelect.style.backgroundColor = channelsMetaData["CH"+i].colorLight;
        colorSelect.value = channelsMetaData["CH"+i].colorLight;

        colorSelect.addEventListener("change", function(){
            colorSelect.style.backgroundColor = colorSelect.value;
        });

        //These 3 lines below display the color associated with each option element
        //It does not work on certain browser (firefox)
        colorSelect.childNodes.forEach((option, index) => {
            option.style.backgroundColor = colorOptionsLight[index].value;
        });

        individualChannelColorContainer.appendChild(para);
        individualChannelColorContainer.appendChild(colorSelect);
        container3.appendChild(individualChannelColorContainer);
    };

    modalContentDiv.appendChild(container1);

    const container4 = document.createElement("div");
    container4.id = "GridOpacityContainer";

    const label = document.createElement("label");
    label.textContent = "Grid Opacity (0-1) : ";
    const gridOpacityInput = document.createElement("input");
    gridOpacityInput.id = "gridOpacityInput";
    gridOpacityInput.type = "number"
    gridOpacityInput.min = 0;
    gridOpacityInput.max = 1;
    gridOpacityInput.step = 0.1;
    gridOpacityInput.value = config.gridOpacity;

    container4.appendChild(label);
    container4.appendChild(gridOpacityInput);

    modalContentDiv.appendChild(container4);

    const container5 = document.createElement("div");
    container5.id = "timeDelayContainer";

    const label2 = document.createElement("label");
    label2.textContent = "Time Delay (ms) : ";
    const timeDelayInput = document.createElement("input");
    timeDelayInput.id = "timeDelayInput";
    timeDelayInput.type = "number";
    timeDelayInput.min = 30;
    timeDelayInput.max = 1000;
    timeDelayInput.step = 1;
    timeDelayInput.value = loopDelay;

    container5.appendChild(label2);
    container5.appendChild(timeDelayInput);

    modalContentDiv.appendChild(container5);

    const saveButton = document.createElement("button");
    saveButton.textContent = "SAVE";
    saveButton.id = "setupModalSaveButton"
    saveButton.addEventListener("click", saveColorChoices);

    modalContentDiv.appendChild(saveButton);
};
