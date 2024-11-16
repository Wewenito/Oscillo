
/*
╔══════════════════════════════════════════════════════╗
║                    TRIGGER FUNCTION                  ║
╚══════════════════════════════════════════════════════╝
*/

function triggerCheck(channelPoints){
    let isTriggerValueReached = false;
    let triggerValueIndex = 0;//in case isTriggerValueReadched is true, we store the index of the value that triggered the oscilloscope
    let currentSlope = null; //falling | rising | both

    //Here we transform the trigger level(s) from mV to raw values
    let trigLevelEdge = mapVoltageToRaw((triggerOptions.triggerLevel / 1000));//divide by 1000 to convert mV to V
    let trigLevelWindowMin = mapVoltageToRaw((triggerOptions.windowLevelMin / 1000));
    let trigLevelWindowMax = mapVoltageToRaw((triggerOptions.windowLevelMax / 1000));

    //First we check wether or not any of the points exceed the trigger value(s) set up by the user
    if (triggerOptions.triggerMode == "edge"){
        for (let i = 0; i < channelPoints.length - 1; i++){
            if (triggerOptions.triggerLevel >= 0){ //if the trigLevel is positive
                if (channelPoints[i] > trigLevelEdge){
                    //console.log("Point Value exceeds trigger level ! ");
                    isTriggerValueReached = true;
                    triggerValueIndex = i;
                    break
                };
            }else{ //if the trigLevel is negative
                if (channelPoints[i] < trigLevelEdge){
                    //console.log("Point Value exceeds trigger level ! ");
                    isTriggerValueReached = true;
                    triggerValueIndex = i;
                    break
                };
            };
        };
    }else{
        console.log(`Checking for values between ${trigLevelWindowMin} and ${trigLevelWindowMax}`);
        for (let i = 0; i < channelPoints.length - 1; i++){
            if (trigLevelWindowMin < trigLevelWindowMax){
                if (channelPoints[i] > trigLevelWindowMin && channelPoints[i] < trigLevelWindowMax){
                    //console.log("Point value is within the trigger window !");
                    isTriggerValueReached = true;
                    triggerValueIndex = i;
                    break
                }
            }else{
                if (channelPoints[i] < trigLevelWindowMin && channelPoints[i] > trigLevelWindowMax){
                    //console.log("Point value is within the trigger window !");
                    isTriggerValueReached = true;
                    triggerValueIndex = i;
                    break
                }
            }
        };
    };

    //Now if the triggerLevel has been exceeded, we check if the slope is in accord with what the user selected.
    if (!isTriggerValueReached){//no need to check the slope type if the value hasn't been exceeded.
        return false;
    }
    
    function getHundredItemsBeforeAfter(array, index) {
        let before = [];
        let after = [];
        for (let j = index - 1; j >= Math.max(0, index - 100); j--) {
            before.push(array[j]);
        }
        for (let j = index + 1; j <= Math.min(array.length - 1, index + 100); j++) {
            after.push(array[j]);
        }
        return { before, after };
    }

    let medians = getHundredItemsBeforeAfter(channelPoints, triggerValueIndex);
    let medianBeforeTriggerPoint = getMedian(medians['before']);
    let medianAfterTriggerPoint = getMedian(medians['after']);

    if (triggerOptions.triggerSlope != "both"){
        if (medianBeforeTriggerPoint > medianAfterTriggerPoint){
            currentSlope = "falling"
        }else if (medianBeforeTriggerPoint < medianAfterTriggerPoint){
            currentSlope = "rising"
        }
    }else{
        currentSlope = "both"
    }

    //finally we return the boolean to state wether or not to stop the image according to the checks we did.
    if (isTriggerValueReached && currentSlope == triggerOptions.triggerSlope){
        return true;
    }else{
        return false;
    }
};

/*
╔══════════════════════════════════════════════════════╗
║                    AUTOSET FUNCTION                  ║
╚══════════════════════════════════════════════════════╝
*/

function autoset(){
    function updateCursorPosition(channelKey) {
        let channel = channelData[channelKey]
        let totalHeight = document.getElementById("scroll-bar").clientHeight - document.getElementById("scroller-"+channelKey).clientHeight;
        let percent = (channel.verticalOffset / 1000) + 0.5; // reverse offset mapping
        let newY = percent * totalHeight;
    
        newY = Math.max(newY, 0);
        newY = Math.min(newY, totalHeight);
    
        document.getElementById("scroller-"+channelKey).style.top = newY + 'px';
        channel.verticalOffsetRelativeCursorPosition = newY;
    }

    //We start by making sure everything is horizontally aligned.
    if (horizontalOffset != 0){
        horizontalOffset = 0;
        document.getElementById("scroller-Horizontal").style.left = ((CANVAS.width / 2) - 10) + 'px';
    };
    if (horizontalScale != 50){
        horizontalScale = 50;
        document.getElementById("horizontal-scaling").value = 50;
    };

    //Now we check every single channel to see if it is fitted within the window or not.
    Object.keys(channelData).forEach(key => {
        if (channelData[key].display == true && channelData[key].operation != "fft"){
            const channel = channelData[key];
            const highestValuePoint = Math.max(...channel.points);
            const lowestValuePoint = Math.min(...channel.points);

            isSignalClipping = true;
            adjustementsCounter = 0;

            while (isSignalClipping && adjustementsCounter < 15) { //This gives a max of 5 offset adjustements and 10 scaling adjsutements. After which there's no point in trying to autoset.
                previewedYPositionHighestPoint = ((CANVAS.height / 2) - ((highestValuePoint - config.maxSampleValue / 2) * (CANVAS.height / config.maxSampleValue * channel.verticalScale))) + channel.verticalOffset;
                previewedYPositionLowestPoint = ((CANVAS.height / 2) - ((lowestValuePoint - config.maxSampleValue / 2) * (CANVAS.height / config.maxSampleValue * channel.verticalScale))) + channel.verticalOffset;

                //check wether the signal is clipping or not
                if (previewedYPositionHighestPoint < 0 || previewedYPositionLowestPoint > CANVAS.height){
                    //See if it is possible to simply adjust the offset to make the signal fit
                    if (previewedYPositionHighestPoint < 0 && previewedYPositionLowestPoint > CANVAS.height){
                        if (channel.verticalScale > 1){
                            channel.verticalScale = channel.verticalScale - 1;
                        }else{
                            channel.verticalScale = channel.verticalScale / 2;
                        }
                        if (channel.focused){
                            document.getElementById("vertical-scaling").value = channel.verticalScale;
                        }
                    //If the signal is clipping through the top of the screen
                    }else if (previewedYPositionHighestPoint < 0){
                        if (channel.verticalOffset != 0 && adjustementsCounter < 3){//CHANGE 3 TO 5 ONCE SCALING IS FUNCTIONNAL
                            //We first try to offset the signal to make it fit
                            // we add 100 px to the offset every loop max 5 times
                            channel.verticalOffset += 100;
                            updateCursorPosition(key);
                        }else {
                            //If the signal is already without any offset, we scale it back
                            if (channel.verticalScale > 1){
                                channel.verticalScale = channel.verticalScale - 1;
                            }else{
                                channel.verticalScale = channel.verticalScale / 2;
                            }
                            if (channel.focused){
                                document.getElementById("vertical-scaling").value = channel.verticalScale;
                            }
                        }
                    //If the signal is clipping through the bottom of the screen
                    }else if (previewedYPositionLowestPoint > CANVAS.height){
                        if (channel.verticalOffset != 0 && adjustementsCounter < 3){//CHANGE 3 TO 5 ONCE SCALING IS FUNCTIONNAL
                            //We first try to offset the signal to make it fit
                            // we remove 100 px to the offset every loop max 5 times
                            channel.verticalOffset -= 100;
                            updateCursorPosition(key);
                        }else {
                            //If the signal is already without any offset, we scale it back
                            if (channel.verticalScale > 1){
                                channel.verticalScale = channel.verticalScale - 1;
                            }else{
                                channel.verticalScale = channel.verticalScale / 2;
                            }
                            if (channel.focused){
                                document.getElementById("vertical-scaling").value = channel.verticalScale;
                            }
                        }
                    }
                }else{
                    // console.log("No clipping detected.")
                    isSignalClipping = false;
                    break;
                }
                adjustementsCounter += 1;
            }
        };
    });
};
