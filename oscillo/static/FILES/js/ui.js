/*
╔══════════════════════════════════════════════════════╗
║                UI INTERACTIONS HANDLERS              ║
╚══════════════════════════════════════════════════════╝
*/

function changeChannelButtonStatus(channelKey) {
    let button = document.getElementById(channelKey);

    // Here we make sure only one button can be focused
    Object.keys(channelData).forEach(key => {
        let otherButton = document.getElementById(key);
        otherButton.classList.remove('button-focused');
        
        if (key !== channelKey) {
            channelData[key].focused = false;
        }
    });


    try {//in case the channel clicked is not active (= not in the channelData dictionnary)
        if (!channelData[channelKey].focused) {//if channel is not focused, then
            // console.log("Focusing on channel:", channelKey);
            button.classList.add('button-focused');
            channelData[channelKey].focused = true;

            //Here we also set the correct values for the vertical scaling of this channel to the knob of the html page
            document.getElementById('vertical-scaling').value = channelData[channelKey].verticalScale;
            //here we update the z-index of that cursor to make it easy for the user to interact with.
            Object.keys(channelData).forEach(key => {
                if (key == channelKey){
                    document.getElementById('scroller-' + channelKey).style.zIndex = 50000;
                }else{
                    document.getElementById('scroller-' + key).style.zIndex = 10000;
                }
            })
            
            // If channel is not displayed, display it
            if (!channelData[channelKey].display) {
                // console.log("Displaying channel:", channelKey);
                button.classList.remove("channel-not-displayed");
                button.classList.add("channel-displayed");
                button.classList.add(channelData[channelKey].colorDark);
                channelData[channelKey].display = true;
                document.getElementById('scroller-' + channelKey).style.display = 'block';
                document.getElementById('scroller-' + channelKey).style.top = channelData[channelKey].verticalOffsetRelativeCursorPosition;
            }
        } else {
            if (channelData[channelKey].display) {//if channel is focused, then
                // console.log("Hiding channel:", channelKey);
                button.classList.remove("channel-displayed");
                button.classList.add("channel-not-displayed");
                button.classList.remove(channelData[channelKey].colorDark);
                channelData[channelKey].display = false;

                document.getElementById('scroller-' + channelKey).style.display = 'none';
            }
            // remove the focus since the button was clicked a second time
            button.classList.remove('button-focused');
            channelData[channelKey].focused = false;
        }
    } catch (error) {
        if (error instanceof TypeError) {//Button not linked to an active channel
            console.error(error)
            showToast("This channel is not active.", "toast-error");

        } else {
            alert("An unknown error occured, please look at the console.")
            console.error(error);
        }
    }
    

    // console.log(channelData);
};

let isVerticalMouseDownListenerSet = false;
let isHorizontalMouseDownListenerSet = false;

function toggleDisplayForVerticalCursorScrollers(){
    //console.log(`Current value for 'cursorOptions.isVerticalCursorOn' : ${cursorOptions.isVerticalCursorOn} | Type : ${typeof cursorOptions.isVerticalCursorOn}`);

    const scrollerA = document.getElementById("vertical-scroller-A");
    const scrollerB = document.getElementById("vertical-scroller-B");
    const scrollBar = document.getElementById("scrollbar-horizontal");
    let isDragging = false;
    let currentMoveListener = null;
    let currentUpListener = null;

    function onMouseMoveScrollerVertical(scroller, startX, whichCursor){
        return function(event) {
            let newX = event.clientX - startX;
            newX = Math.max(newX, 0);
            newX = Math.min(newX, scrollBar.clientWidth - scroller.clientWidth);
            scroller.style.left = newX + 'px';
            if (whichCursor == "A"){
                cursorOptions.verticalAPosition = newX + ((parseInt(window.getComputedStyle(scrollerA).width)) / 2);
            }else{
                cursorOptions.verticalBPosition = newX + ((parseInt(window.getComputedStyle(scrollerB).width)) / 2);
            }
        };
    }

    function onMouseUpScrollerVertical(){
        if (!isDragging) return;
        isDragging = false;

        document.removeEventListener('mousemove', currentMoveListener);
        document.removeEventListener('mouseup', currentUpListener);
        currentMoveListener = null;
        currentUpListener = null;
    }

    function setupDragListeners(scroller, whichCursor) {
        scroller.addEventListener('mousedown', function(event) {
            if (isDragging) return; // Prevents adding multiple listeners during an active drag
            // console.log("Mouse click on scroller", scroller.id);
            isDragging = true;
            let startX = event.clientX - scroller.getBoundingClientRect().left + scrollBar.getBoundingClientRect().left;

            currentMoveListener = onMouseMoveScrollerVertical(scroller, startX, whichCursor);
            currentUpListener = onMouseUpScrollerVertical;

            document.addEventListener('mousemove', currentMoveListener);
            document.addEventListener('mouseup', currentUpListener);
        });
    }

    if (cursorOptions.isVerticalCursorOn === "true"){
        scrollerA.style.display = "block";
        scrollerA.style.left = (cursorOptions.verticalAPosition - (parseInt(window.getComputedStyle(scrollerA).width)) / 2) + "px";
    
        scrollerB.style.display = "block";
        scrollerB.style.left = (cursorOptions.verticalBPosition - (parseInt(window.getComputedStyle(scrollerB).width)) / 2) + "px";

        if (!isVerticalMouseDownListenerSet){
            setupDragListeners(scrollerA, "A");
            setupDragListeners(scrollerB, "B");
        }

        isVerticalMouseDownListenerSet = true;
    } else {
        // Hide scrollers (A & B)
        scrollerA.style.display = "none";
        scrollerB.style.display = "none";
    }
};

function toggleDisplayForHorizontalCursorScrollers(){
    //console.log(`Current value for 'cursorOptions.isHorizontalCursorOn' : ${cursorOptions.isHorizontalCursorOn} | Type : ${typeof cursorOptions.isHorizontalCursorOn}`);

    const scrollerA = document.getElementById("scroller-horizontal-A");
    const scrollerB = document.getElementById("scroller-horizontal-B");
    const scrollBar = document.getElementById("scroll-bar-horizontal-cursors");
    let isDragging = false;
    let currentMoveListener = null;
    let currentUpListener = null;

    function onMouseMoveScrollerHorizontal(scroller, startY, whichCursor){
        return function(event) {
            let newY = event.clientY - startY;
            newY = Math.max(newY, 0);
            newY = Math.min(newY, scrollBar.clientHeight - scroller.clientHeight);
            scroller.style.top = newY + 'px';
            if (whichCursor == "A"){
                cursorOptions.horizontalAPosition = newY + ((parseInt(window.getComputedStyle(scrollerA).height)) / 2);
            }else{
                cursorOptions.horizontalBPosition = newY + ((parseInt(window.getComputedStyle(scrollerA).height)) / 2);
            }
        };
    };

    function onMouseUpScrollerHorizontal(){
        if (!isDragging) return;
        isDragging = false;

        document.removeEventListener('mousemove', currentMoveListener);
        document.removeEventListener('mouseup', currentUpListener);
        currentMoveListener = null;
        currentUpListener = null;
    };

    function setupDragListeners(scroller, whichCursor) {
        scroller.addEventListener('mousedown', function(event) {
            if (isDragging) return; // Prevents adding multiple listeners during an active drag
            isDragging = true;
            let startY = event.clientY - scroller.getBoundingClientRect().top + scrollBar.getBoundingClientRect().top;

            currentMoveListener = onMouseMoveScrollerHorizontal(scroller, startY, whichCursor);
            currentUpListener = onMouseUpScrollerHorizontal;

            document.addEventListener('mousemove', currentMoveListener);
            document.addEventListener('mouseup', currentUpListener);
        });
    }

    if (cursorOptions.isHorizontalCursorOn === "true"){
        scrollerA.style.display = "block";
        scrollerA.style.top = (cursorOptions.horizontalAPosition - (parseInt(window.getComputedStyle(scrollerA).height)) / 2) + "px";
    
        scrollerB.style.display = "block";
        scrollerB.style.top = (cursorOptions.horizontalBPosition - (parseInt(window.getComputedStyle(scrollerB).height)) / 2) + "px";

        if (!isHorizontalMouseDownListenerSet){
            setupDragListeners(scrollerA, "A");
            setupDragListeners(scrollerB, "B");
        }

        isHorizontalMouseDownListenerSet = true;
    } else {
        // Hide scrollers (A & B)
        scrollerA.style.display = "none";
        scrollerB.style.display = "none";
    }
};

function changeScreenSize(size){
    //console.log(`Change screen size to : ${size}`);

    const width = parseInt(size.split("|")[0]);
    const height = parseInt(size.split("|")[1]);

    CANVAS.width = width;
    CANVAS.height = height;

    const horizontalScrollBar = document.getElementById("scrollbar-horizontal");
    const leftVerticalScrollBar = document.getElementById("scroll-bar");
    const rightVerticalScrollBar = document.getElementById("scroll-bar-horizontal-cursors");
    const scrollerHorizontal = document.getElementById("scroller-Horizontal");
    const scrollers = document.querySelectorAll(".scrollers")
    const channelButtons = document.querySelectorAll(".ch-button");
    const channelButtonsContainer = document.getElementById("channel-select-div");
    const functionButtons = document.querySelectorAll(".function-buttons");
    const measurementsHolder = document.getElementById("info-display-oscilloscope");

    horizontalScrollBar.style.width = width + "px";
    leftVerticalScrollBar.style.height = height + "px";
    rightVerticalScrollBar.style.height = height + "px";
    scrollerHorizontal.style.left = (width / 2) - 10 + "px";
    scrollers.forEach(scroller => {
        scroller.style.top = (height / 2) - 5 + "px";
    });

    if (cursorOptions.isHorizontalCursorOn && size != "TD"){
        cursorOptions.horizontalAPosition = CANVAS.height / 3;
        cursorOptions.horizontalBPosition = (CANVAS.height / 3) * 2;
        document.getElementById("scroller-horizontal-A").style.top = (cursorOptions.horizontalAPosition - 5) + 'px';
        document.getElementById("scroller-horizontal-B").style.top = (cursorOptions.horizontalBPosition - 5) + 'px';
    }

    if (cursorOptions.isVerticalCursorOn && size != "TD"){
        cursorOptions.verticalAPosition = CANVAS.width / 3;
        cursorOptions.verticalBPosition = (CANVAS.width / 3) * 2;
        document.getElementById("vertical-scroller-A").style.left = (cursorOptions.verticalAPosition - 5) + 'px';
        document.getElementById("vertical-scroller-B").style.left = (cursorOptions.verticalBPosition - 5) + 'px';
    }
    
    function setTinyScreenSize(){
        channelButtons.forEach(button => {
            button.style.width = "20px";
            button.style.height = "10px";
            button.style.fontSize = "10px";
            button.style.lineHeight = "3px";
            button.firstElementChild.style.position = "absolute";
            button.firstElementChild.style.left = "8px";
        });

        functionButtons.forEach(button => {
            button.style.width = "105px";
            button.style.height = "20";
            button.style.fontSize = "13px";
            button.style.lineHeight = "5px";
        });

        channelButtonsContainer.style.margin = "1em auto";

        measurementsHolder.style.flexDirection = "column";

        document.getElementById("vpdiv-mesurements").style.width = "fit-content";
        document.getElementById("vpdiv-mesurements").style.margin = "0px";

        document.querySelectorAll(".chanmeasures").forEach(p => {
            p.style.width = "fit-content";
        });

        document.getElementById("mathres-measurements").style.display = "none";
    };

    function setSmallScreenSize(){
        channelButtons.forEach(button => {
            button.style.width = "40px";
            button.style.height = "15px";
            button.style.fontSize = "15px";
            button.style.lineHeight = "3px";
            button.firstElementChild.style.position = "absolute";
            button.firstElementChild.style.left = "13px";
        });

        functionButtons.forEach(button => {
            button.style.width = "150px";
            button.style.height = "40px";
            button.style.fontSize = "18px";
            button.style.lineHeight = "5px";
        });

        channelButtonsContainer.style.margin = "1em auto";

        measurementsHolder.style.flexDirection = "column";

        document.getElementById("vpdiv-mesurements").style.width = "fit-content";
        document.getElementById("vpdiv-mesurements").style.margin = "0px";

        document.querySelectorAll(".chanmeasures").forEach(p => {
            p.style.width = "fit-content";
        });

        document.getElementById("mathres-measurements").style.display = "none";
        document.getElementById("tpdiv-measurement").width = "fit-content";
        document.getElementById("tpdiv-measurement").margin = "0px";

    };

    function setStandardScreenSize(){
        channelButtons.forEach(button => {
            button.style.width = "";
            button.style.height = "";
            button.style.fontSize = "";
            button.style.lineHeight = "";
            button.firstElementChild.style.position = "";
            button.firstElementChild.style.left = "";
        });

        functionButtons.forEach(button => {
            button.style.width = "";
            button.style.height = "";
            button.style.fontSize = "";
            button.style.lineHeight = "";
        });

        channelButtonsContainer.style.margin = "";

        measurementsHolder.style.flexDirection = "row";

        document.getElementById("vpdiv-mesurements").style.width = "";
        document.getElementById("vpdiv-mesurements").style.margin = "";

        document.querySelectorAll(".chanmeasures").forEach(p => {
            p.style.width = "";
        });

        document.getElementById("mathres-measurements").style.display = "flex";
        document.getElementById("tpdiv-measurement").width = "";
        document.getElementById("tpdiv-measurement").margin = "";
    };

    function setLargeScreenSize(){
        document.querySelectorAll("#channel-select-div span").forEach(span => {
            span.style.flexWrap = "wrap";
            span.style.justifyContent = "space-evenly";
        });

        channelButtons.forEach(button => {
            button.style.width = "";
            button.style.height = "";
            button.style.fontSize = "";
            button.style.lineHeight = "";
            button.firstElementChild.style.position = "";
            button.firstElementChild.style.left = "";
            button.style.margin = "0px 0.2em 1em 0.2em"
        });

        functionButtons.forEach(button => {
            button.style.width = "";
            button.style.height = "";
            button.style.fontSize = "";
            button.style.lineHeight = "";
        });

        channelButtonsContainer.style.margin = "";

        measurementsHolder.style.flexDirection = "row";

        document.getElementById("vpdiv-mesurements").style.width = "";
        document.getElementById("vpdiv-mesurements").style.margin = "";

        document.querySelectorAll(".chanmeasures").forEach(p => {
            p.style.width = "";
        });

        document.getElementById("mathres-measurements").style.display = "flex";
        document.getElementById("tpdiv-measurement").width = "";
        document.getElementById("tpdiv-measurement").margin = "";
    };

    function exitFullScreen(event){
        if (event.key === "Escape"){
            console.log("EXITING FULL SCREEN !");

            CANVAS.width = 1200;
            CANVAS.height = 800;

            document.getElementById("aside").style.display = "flex";

            horizontalScrollBar.style.width = CANVAS.width + "px";
            leftVerticalScrollBar.style.height = CANVAS.height + "px";
            rightVerticalScrollBar.style.height = CANVAS.height + "px";
            scrollerHorizontal.style.left = (CANVAS.width / 2) - 10 + "px";
            scrollers.forEach(scroller => {
                scroller.style.top = (CANVAS.height / 2) - 5 + "px";
            })

            document.getElementById("info-display-oscilloscope").style.display = "flex";
            document.getElementById("auto-measures-display").style.display = "flex";

            setStandardScreenSize();

            document.removeEventListener("keydown", exitFullScreen);
            showToast("Back to standard screen size.", "toast-info");

            clearCanvas();
            drawGrid('rgba(128, 128, 128, 0.5)', 3);
        }
    }

    function setMaximizedScreenSize(){
        const bodyWidth = document.body.clientWidth;
        const bodyHeight = document.body.clientHeight;

        CANVAS.width = bodyWidth - 40;
        CANVAS.height = bodyHeight - 20;

        document.getElementById("aside").style.display = "none";
        document.getElementById("middle-line").style.marginLeft = "0px";

        horizontalScrollBar.style.width = CANVAS.width + "px";
        leftVerticalScrollBar.style.height = CANVAS.height + "px";
        rightVerticalScrollBar.style.height = CANVAS.height + "px";
        scrollerHorizontal.style.left = (CANVAS.width / 2) - 10 + "px";
        scrollers.forEach(scroller => {
            scroller.style.top = (CANVAS.height / 2) - 5 + "px";
        });

        if (cursorOptions.isHorizontalCursorOn){
            cursorOptions.horizontalAPosition = CANVAS.height / 3;
            cursorOptions.horizontalBPosition = (CANVAS.height / 3) * 2;
            document.getElementById("scroller-horizontal-A").style.top = (cursorOptions.horizontalAPosition - 5) + 'px';
            document.getElementById("scroller-horizontal-B").style.top = (cursorOptions.horizontalBPosition - 5) + 'px';
        }
        if (cursorOptions.isVerticalCursorOn){
            cursorOptions.verticalAPosition = CANVAS.width / 3;
            cursorOptions.verticalBPosition = (CANVAS.width / 3) * 2;
            document.getElementById("vertical-scroller-A").style.left = (cursorOptions.verticalAPosition - 5) + 'px';
            document.getElementById("vertical-scroller-B").style.left = (cursorOptions.verticalBPosition - 5) + 'px';
        }

        document.getElementById("info-display-oscilloscope").style.display = "none";
        document.getElementById("auto-measures-display").style.display = "none";

        showToast("To escape full-screen, press 'ESC'", "toast-info");

        document.addEventListener("keydown", exitFullScreen);
    };
    

    if (size == "400|267"){
        setTinyScreenSize();
    }else if (size == "800|533"){
        setSmallScreenSize();
    }else if (size == "1200|800"){
        setStandardScreenSize();
    }else if (size == "1400|900"){
        setLargeScreenSize();
    }else if (size == "TD"){
        setMaximizedScreenSize();
    }

    clearCanvas();
    drawGrid('rgba(128, 128, 128, 0.5)', 3);
};

function changeScreenLightMode(mode){
    if (mode == "light"){
        CANVAS.classList.remove("canvas-dark");
        CANVAS.classList.add("canvas-light");
        document.querySelectorAll(".canvas-scrollbars-dark").forEach(scrollbar => {
            scrollbar.classList.remove("canvas-scrollbars-dark");
            scrollbar.classList.add("canvas-scrollbars-light");
        });
    }else{
        CANVAS.classList.remove("canvas-light");
        CANVAS.classList.add("canvas-dark");
        document.querySelectorAll(".canvas-scrollbars-light").forEach(scrollbar => {
            scrollbar.classList.remove("canvas-scrollbars-light");
            scrollbar.classList.add("canvas-scrollbars-dark");
        });
    };

    Object.keys(channelData).forEach(key => {
        if (mode == "light"){
            document.getElementById(key).classList.remove(channelData[key].colorDark);
            document.getElementById(key).classList.add(channelData[key].colorLight);
            document.getElementById("scroller-"+key).style.backgroundColor = channelData[key].colorLight;
        }else{
            document.getElementById(key).classList.remove(channelData[key].colorLight);
            document.getElementById(key).classList.add(channelData[key].colorDark);
            document.getElementById("scroller-"+key).style.backgroundColor = channelData[key].colorDark;
        }
    });

    config.theme = mode;

    //Now we save the new theme to the db for later on.
    const UID = userId;
    const Http = new XMLHttpRequest();
    const url = `/oscillo/setThemePreference/${UID}/`;
    const csrfToken = document.querySelector('input[name="csrfmiddlewaretoken"]').value;

    Http.open("POST", url, true);
    Http.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    Http.setRequestHeader("X-CSRFToken", csrfToken);

    const data = JSON.stringify({
        theme: mode,
    });

    Http.onreadystatechange = function() {
        if (Http.readyState === 4) {
            response = JSON.parse(Http.responseText);
            if (Http.status === 200) {
                console.log(response.message);
                showToast(response.message, "toast-success");
            } else {
                console.log("Error saving theme: ", response.message);
                showToast(response.message, "toast-error");
                return;
            }
        }
    };

    Http.send(data);
};

function setScrollersEvents(Channel_ID){
    let isDragging = false;
    const scrollBar = document.getElementById("scroll-bar");
    const scroller = document.getElementById("scroller-CH"+Channel_ID);
    let startY;

    scroller.style.display = "block";
    scroller.style.backgroundColor = channelData["CH" + Channel_ID].colorDark;

    scroller.addEventListener('mousedown', function(event) {
        isDragging = true;
        startY = event.clientY - scroller.getBoundingClientRect().top + scrollBar.getBoundingClientRect().top;
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    });

    function onMouseMove(event) {
        if (!isDragging) return;

        //this part handles the actual movement of the element on the screen
        let newY = event.clientY - startY;
        newY = Math.max(newY, 0);
        newY = Math.min(newY, scrollBar.clientHeight - scroller.clientHeight);

        scroller.style.top = newY + 'px';

        //this part maps the relative position of the scroller to the offset of the signal
        let percent = newY / (scrollBar.clientHeight - scroller.clientHeight);
        let verticalOffset = (percent - 0.5) * 1000;
        verticalOffset = Math.round(verticalOffset);

        //and now we actually update the vertical offset of the focused channel
        channelData["CH" + Channel_ID].verticalOffset = verticalOffset;
    };

    function onMouseUp(event) {
        isDragging = false;

        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);

        //Here below we save the cursor position for that channel to restore it when the user clicks on the channel again

        let newY = event.clientY - startY;
        newY = Math.max(newY, 0);
        newY = Math.min(newY, scrollBar.clientHeight - scroller.clientHeight);

        channelData["CH" + Channel_ID].verticalOffsetRelativeCursorPosition = newY;
    };
};

function setupTriggerCursor(){
    let  startY;
    let isDragging = false;

    const scrollBar = document.getElementById("scroll-bar-horizontal-cursors");
    const TriggerCursor = document.getElementById("trigger-cursor");

    TriggerCursor.addEventListener('mousedown', function(event) {
        isDragging = true;
        startY = event.clientY - TriggerCursor.getBoundingClientRect().top + scrollBar.getBoundingClientRect().top;
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    });

    function onMouseMove(event){
        if (!isDragging) return;

        let newY = event.clientY - startY;
        newY = Math.max(newY, 0);
        newY = Math.min(newY, scrollBar.clientHeight - TriggerCursor.clientHeight);

        TriggerCursor.style.top = newY + 'px';

        let cursorPosToMilliVolts = parseFloat(getMilliVoltsRelativeToTriggerCursor(newY).value);
        triggerOptions.triggerLevel = cursorPosToMilliVolts;
    }

    function onMouseUp(event){
        isDragging = false;

        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
    }
};