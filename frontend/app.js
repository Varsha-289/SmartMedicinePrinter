const API = "https://smartmedicineprinter.onrender.com";
let blisterData = null;
let animationRunning = false;
let printed = false;
let cut = false;


// ==================================================
// ELEMENTS
// ==================================================

const generateButton =
    document.getElementById("generateButton");

const resetButton =
    document.getElementById("resetButton");

const printButton =

    document.getElementById("printButton");

const cutButton =
    document.getElementById("cutButton");

const excelButton =
    document.getElementById("excelButton");

const blisterSvg =
    document.getElementById("blisterSvg");

const blisterSheet =
    document.getElementById("blisterSheet");

const laserHead =
    document.getElementById("laserHead");

const laserBeam =
    document.getElementById("laserBeam");

const laserAssembly =
    document.getElementById("laserAssembly");

const cutLine =
    document.getElementById("cutLine");

const machineState =
    document.getElementById("machineState");

const parameterStatus =
    document.getElementById("parameterStatus");

const printStatus =
    document.getElementById("printStatus");

const cutStatus =
    document.getElementById("cutStatus");

const printPreview =
    document.getElementById("printPreview");

const cutDisplay =
    document.getElementById("cutDisplay");

const doseGrid =
    document.getElementById("doseGrid");

const doseCount =
    document.getElementById("doseCount");

const laserProgress =
    document.getElementById("laserProgress");

const emptyMachine =
    document.getElementById("emptyMachine");


// ==================================================
// SVG HELPER
// ==================================================

const SVG_NS =
    "http://www.w3.org/2000/svg";


function svgElement(type, attributes = {}) {

    const element =
        document.createElementNS(
            SVG_NS,
            type
        );

    Object.entries(attributes).forEach(
        ([key, value]) => {

            element.setAttribute(
                key,
                value
            );

        }
    );

    return element;
}


// ==================================================
// INPUT SETTINGS
// ==================================================

function getSettings() {

    return {

        rows:
            Number(
                document.getElementById("rows").value
            ),

        columns:
            Number(
                document.getElementById("columns").value
            ),

        blister_width:
            Number(
                document.getElementById("blisterWidth").value
            ),

        blister_height:
            Number(
                document.getElementById("blisterHeight").value
            ),

        pocket_width:
            Number(
                document.getElementById("pocketWidth").value
            ),

        pocket_height:
            Number(
                document.getElementById("pocketHeight").value
            ),

        horizontal_gap:
            Number(
                document.getElementById("horizontalGap").value
            ),

        vertical_gap:
            Number(
                document.getElementById("verticalGap").value
            ),

       expiry_date:
    document.getElementById("expiryDate").value,

tablet_shape:
    document.getElementById("tabletShape").value
    };

}


// ==================================================
// VALIDATION
// ==================================================

function validateSettings(settings) {

    if (
        !Number.isFinite(settings.rows) ||
        settings.rows < 1 ||
        settings.rows > 10
    ) {

        return "Rows must be between 1 and 10.";

    }


    if (
        !Number.isFinite(settings.columns) ||
        settings.columns < 1 ||
        settings.columns > 12
    ) {

        return "Columns must be between 1 and 12.";

    }


    if (
        !Number.isFinite(settings.blister_width) ||
        settings.blister_width <= 0
    ) {

        return "Blister width must be greater than zero.";

    }


    if (
        !Number.isFinite(settings.blister_height) ||
        settings.blister_height <= 0
    ) {

        return "Blister height must be greater than zero.";

    }


    if (
        !Number.isFinite(settings.pocket_width) ||
        settings.pocket_width <= 0
    ) {

        return "Pocket width must be greater than zero.";

    }


    if (
        !Number.isFinite(settings.pocket_height) ||
        settings.pocket_height <= 0
    ) {

        return "Pocket height must be greater than zero.";

    }


    if (
        settings.horizontal_gap < 0 ||
        settings.vertical_gap < 0
    ) {

        return "Gaps cannot be negative.";

    }


    if (!settings.expiry_date) {

        return "Please select an expiry date.";

    }


    return null;

}


// ==================================================
// MACHINE STATUS
// ==================================================

function setMachineState(
    text,
    active = false
) {

    if (!machineState) {
        return;
    }

    machineState.innerText =
        text;

    machineState.classList.toggle(
        "active",
        active
    );

}


// ==================================================
// PROCESS STEPS
// ==================================================

function activateProcess(number) {

    const steps = [

        document.querySelector(
            ".process-step:nth-child(1)"
        ),

        document.getElementById(
            "processPrint"
        ),

        document.getElementById(
            "processCut"
        ),

        document.getElementById(
            "processDose"
        )

    ];


    steps.forEach(
        (step, index) => {

            if (!step) {
                return;
            }


            step.classList.remove(
                "active"
            );

            step.classList.remove(
                "complete"
            );


            if (
                index <
                number - 1
            ) {

                step.classList.add(
                    "complete"
                );

            }


            if (
                index ===
                number - 1
            ) {

                step.classList.add(
                    "active"
                );

            }

        }
    );

}


// ==================================================
// GENERATE BLISTER
// ==================================================

generateButton.addEventListener(
    "click",
    generateBlister
);
if (resetButton) {
    resetButton.addEventListener(
        "click",
        resetSimulation
    );
}

async function generateBlister() {

    if (animationRunning) {
        return;
    }


    const settings =
        getSettings();


    const error =
        validateSettings(
            settings
        );


    if (error) {

        parameterStatus.innerText =
            error;

        return;

    }


    animationRunning =
        true;


    generateButton.disabled =
        true;


    printButton.disabled =
        true;


    cutButton.disabled =
        true;


    excelButton.disabled =
        true;


    parameterStatus.innerText =
        "GENERATING REALISTIC BLISTER...";


    setMachineState(
        "FORMING BLISTER",
        true
    );


    try {

        const response =
            await fetch(
                `${API}/api/generate`,
                {

                    method:
                        "POST",

                    headers:
                        {
                            "Content-Type":
                                "application/json"
                        },

                    body:
                        JSON.stringify(
                            settings
                        )

                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.detail ||
                "Blister generation failed."
            );

        }


        blisterData =
            data.blister;


        printed =
            false;

        cut =
            false;


        renderRealisticBlister(
            blisterData
        );


        printButton.disabled =
            false;


        cutButton.disabled =
            true;


        excelButton.disabled =
            false;


        printPreview.innerText =
            "EXP: " +
            formatDate(
                blisterData.expiry_date
            );


        cutDisplay.innerText =
            "CUTTER READY";


        printStatus.innerText =
            "READY TO PRINT";


        cutStatus.innerText =
            "WAITING FOR PRINT";


        parameterStatus.innerText =
            `${blisterData.total_doses} DOSES GENERATED`;


        setMachineState(
            "BLISTER READY",
            true
        );


        activateProcess(1);

    }
    catch (error) {

        console.error(error);


        parameterStatus.innerText =
            error.message;


        setMachineState(
            "ERROR"
        );

    }


    animationRunning =
        false;


    generateButton.disabled =
        false;

}


// ==================================================
// REALISTIC BLISTER
// ==================================================

function renderRealisticBlister(data) {

    blisterSvg.classList.remove(
        "hidden"
    );


    if (emptyMachine) {

        emptyMachine.classList.add(
            "hidden"
        );

    }


    blisterSheet.innerHTML =
        "";


    // ----------------------------------------------
    // SVG DEFINITIONS
    // ----------------------------------------------

    const defs =
        svgElement(
            "defs"
        );


    const sheetGradient =
        svgElement(
            "linearGradient",
            {
                id:
                    "realSheetGradient",

                x1:
                    "0%",

                y1:
                    "0%",

                x2:
                    "100%",

                y2:
                    "100%"
            }
        );


    sheetGradient.appendChild(
        svgElement(
            "stop",
            {
                offset:
                    "0%",

                "stop-color":
                    "#f2f5f6"
            }
        )
    );


    sheetGradient.appendChild(
        svgElement(
            "stop",
            {
                offset:
                    "45%",

                "stop-color":
                    "#b4c0c5"
            }
        )
    );


    sheetGradient.appendChild(
        svgElement(
            "stop",
            {
                offset:
                    "100%",

                "stop-color":
                    "#718188"
            }
        )
    );


    const pocketGradient =
        svgElement(
            "radialGradient",
            {
                id:
                    "realPocketGradient",

                cx:
                    "32%",

                cy:
                    "25%",

                r:
                    "78%"
            }
        );


    pocketGradient.appendChild(
        svgElement(
            "stop",
            {
                offset:
                    "0%",

                "stop-color":
                    "#ffffff",

                "stop-opacity":
                    "0.95"
            }
        )
    );


    pocketGradient.appendChild(
        svgElement(
            "stop",
            {
                offset:
                    "45%",

                "stop-color":
                    "#dbe4e7",

                "stop-opacity":
                    "0.78"
            }
        )
    );


    pocketGradient.appendChild(
        svgElement(
            "stop",
            {
                offset:
                    "100%",

                "stop-color":
                    "#66777e",

                "stop-opacity":
                    "0.95"
            }
        )
    );


    const tabletGradient =
        svgElement(
            "radialGradient",
            {
                id:
                    "tabletGradient",

                cx:
                    "32%",

                cy:
                    "25%",

                r:
                    "75%"
            }
        );


    tabletGradient.appendChild(
        svgElement(
            "stop",
            {
                offset:
                    "0%",

                "stop-color":
                    "#fffef5"
            }
        )
    );


    tabletGradient.appendChild(
        svgElement(
            "stop",
            {
                offset:
                    "65%",

                "stop-color":
                    "#ddd8c4"
            }
        )
    );


    tabletGradient.appendChild(
        svgElement(
            "stop",
            {
                offset:
                    "100%",

                "stop-color":
                    "#99927d"
            }
        )
    );


    defs.appendChild(
        sheetGradient
    );

    defs.appendChild(
        pocketGradient
    );

    defs.appendChild(
        tabletGradient
    );


    blisterSvg.insertBefore(
        defs,
        blisterSvg.firstChild
    );


    // ----------------------------------------------
    // BLISTER SIZE
    // ----------------------------------------------

    const areaWidth =
        660;

    const areaHeight =
        300;


    const gapX =
        Math.max(
            10,
            data.horizontal_gap * 2.2
        );


    const gapY =
        Math.max(
            10,
            data.vertical_gap * 2.2
        );


    const pocketWidth =
        Math.min(
            96,
            (
                areaWidth /
                data.columns
            ) -
            gapX
        );


    const pocketHeight =
        Math.min(
            78,
            (
                areaHeight /
                data.rows
            ) -
            gapY
        );


    const totalWidth =
        (
            data.columns *
            pocketWidth
        )
        +
        (
            data.columns - 1
        ) *
        gapX;


    const totalHeight =
        (
            data.rows *
            pocketHeight
        )
        +
        (
            data.rows - 1
        ) *
        gapY;


    const startX =
        (
            800 -
            totalWidth
        ) / 2;


    const startY =
        (
            450 -
            totalHeight
        ) / 2;


    // ----------------------------------------------
    // FOIL SHEET
    // ----------------------------------------------

    const sheet =
        svgElement(
            "rect",
            {

                class:
                    "sheet",

                x:
                    startX - 32,

                y:
                    startY - 32,

                width:
                    totalWidth + 64,

                height:
                    totalHeight + 64,

                rx:
                    18

            }
        );


    blisterSheet.appendChild(
        sheet
    );


    // ----------------------------------------------
    // FOIL HIGHLIGHT
    // ----------------------------------------------

    const foilHighlight =
        svgElement(
            "rect",
            {

                x:
                    startX - 20,

                y:
                    startY - 20,

                width:
                    totalWidth + 40,

                height:
                    totalHeight + 40,

                rx:
                    14,

                fill:
                    "none",

                stroke:
                    "#ffffff",

                "stroke-opacity":
                    "0.3",

                "stroke-width":
                    "2"

            }
        );


    blisterSheet.appendChild(
        foilHighlight
    );


 // ----------------------------------------------
// CREATE EVERY POCKET
// ----------------------------------------------

const tabletShape =
    data.tablet_shape ||
    document.getElementById("tabletShape").value ||
    "round";


data.pockets.forEach(
    (pocket, index) => {

        const col =
            Number(
                pocket.column
            ) - 1;


        const row =
            Number(
                pocket.row
            ) - 1;


        const cx =
            startX +
            col *
            (
                pocketWidth +
                gapX
            )
            +
            pocketWidth / 2;


        const cy =
            startY +
            row *
            (
                pocketHeight +
                gapY
            )
            +
            pocketHeight / 2;


        // ------------------------------------------
        // SHAPE DIMENSIONS
        // ------------------------------------------

        let pocketRX;
        let pocketRY;

        let tabletRX;
        let tabletRY;


        if (
            tabletShape === "oval"
        ) {

            // Antibiotic / large oval tablet

            pocketRX =
                pocketWidth / 2;

            pocketRY =
                pocketHeight / 2;


            tabletRX =
                pocketWidth * 0.29;

            tabletRY =
                pocketHeight * 0.16;

        }
        else {

            // Round tablet

            const roundSize =
                Math.min(
                    pocketWidth,
                    pocketHeight
                );


            pocketRX =
                roundSize * 0.50;

            pocketRY =
                roundSize * 0.50;


            const tabletSize =
                roundSize * 0.25;


            tabletRX =
                tabletSize;

            tabletRY =
                tabletSize;

        }


        // ------------------------------------------
        // POCKET SHADOW
        // ------------------------------------------

        const shadow =
            svgElement(
                "ellipse",
                {

                    class:
                        "pocket-shadow",

                    cx:
                        cx + 3,

                    cy:
                        cy + 4,

                    rx:
                        pocketRX,

                    ry:
                        pocketRY,

                    fill:
                        "#26343a",

                    "fill-opacity":
                        "0.42"

                }
            );


        blisterSheet.appendChild(
            shadow
        );


        // ------------------------------------------
        // RAISED POCKET
        // ------------------------------------------

        const pocketElement =
            svgElement(
                "ellipse",
                {

                    class:
                        "pocket",

                    cx:
                        cx,

                    cy:
                        cy,

                    rx:
                        pocketRX,

                    ry:
                        pocketRY

                }
            );


        pocketElement.dataset.index =
            index;


        pocketElement.dataset.shape =
            tabletShape;


        blisterSheet.appendChild(
            pocketElement
        );


        // ------------------------------------------
        // TABLET
        // ------------------------------------------

        const tablet =
            svgElement(
                "ellipse",
                {

                    class:
                        "tablet",

                    cx:
                        cx,

                    cy:
                        cy,

                    rx:
                        tabletRX,

                    ry:
                        tabletRY

                }
            );


        tablet.dataset.index =
            index;


        tablet.dataset.shape =
            tabletShape;


        blisterSheet.appendChild(
            tablet
        );


        // ------------------------------------------
        // TABLET HIGHLIGHT
        // ------------------------------------------

        const tabletHighlight =
            svgElement(
                "ellipse",
                {

                    class:
                        "tablet-highlight",

                    cx:
                        cx -
                        tabletRX * 0.28,

                    cy:
                        cy -
                        tabletRY * 0.28,

                    rx:
                        tabletRX * 0.38,

                    ry:
                        tabletRY * 0.28

                }
            );


        blisterSheet.appendChild(
            tabletHighlight
        );


        // ------------------------------------------
        // EXPIRY PRINT
        // ------------------------------------------

        if (
            tabletShape === "round"
        ) {

            /*
             * ROUND TABLET
             *
             * Create an invisible curved path
             * above the tablet.
             *
             * The expiry follows that path.
             */

            const pathId =
                `expiryArc-${index}`;


            const arcRadius =
                Math.max(
                    tabletRX * 1.45,
                    22
                );


            const arc =
                svgElement(
                    "path",
                    {

                        id:
                            pathId,

                        d:
                            `
                            M
                            ${cx - arcRadius}
                            ${cy}
                            A
                            ${arcRadius}
                            ${arcRadius}
                            0
                            0
                            1
                            ${cx + arcRadius}
                            ${cy}
                            `,

                        fill:
                            "none",

                        stroke:
                            "none"

                    }
                );


            blisterSheet.appendChild(
                arc
            );


            const expiry =
                svgElement(
                    "text",
                    {

                        class:
                            "expiry",

                        "font-size":
                            "7",

                        "font-weight":
                            "900"

                    }
                );


            expiry.dataset.index =
                index;


            expiry.dataset.shape =
                "round";


            const textPath =
                svgElement(
                    "textPath",
                    {

                        href:
                            `#${pathId}`,

                        startOffset:
                            "50%",

                        "text-anchor":
                            "middle"

                    }
                );


            textPath.textContent =
                "EXP " +
                formatDate(
                    data.expiry_date
                );


            expiry.appendChild(
                textPath
            );


            blisterSheet.appendChild(
                expiry
            );

        }
        else {

            /*
             * OVAL / ANTIBIOTIC TABLET
             *
             * Expiry is printed directly
             * across the tablet.
             */

            const expiry =
                svgElement(
                    "text",
                    {

                        class:
                            "expiry",

                        x:
                            cx,

                        y:
                            cy + 2,

                        "font-size":
                            "6.5",

                        "font-weight":
                            "900",

                        "text-anchor":
                            "middle"

                    }
                );


            expiry.dataset.index =
                index;


            expiry.dataset.shape =
                "oval";


            expiry.textContent =
                "EXP " +
                formatDate(
                    data.expiry_date
                );


            blisterSheet.appendChild(
                expiry
            );

        }

    }
);


    // ----------------------------------------------
    // LASER HOME POSITION
    // ----------------------------------------------

    laserHead.setAttribute(
        "x",
        startX - 20
    );


    laserHead.setAttribute(
        "y",
        startY - 58
    );


    laserBeam.setAttribute(
        "x1",
        startX
    );


    laserBeam.setAttribute(
        "x2",
        startX
    );


    laserBeam.setAttribute(
        "y1",
        startY - 30
    );


    laserBeam.setAttribute(
        "y2",
        startY
    );


    laserProgress.style.width =
        "0%";


    cutLine.style.opacity =
        "0";

}


// ==================================================
// DATE FORMAT
// ==================================================

function formatDate(value) {

    if (!value) {
        return "--";
    }


    const parts =
        String(value).split("-");


    if (
        parts.length !== 3
    ) {

        return value;

    }


    return `${parts[2]}-${parts[1]}-${parts[0]}`;

}


// ==================================================
// LASER PRINT
// ==================================================

printButton.addEventListener(
    "click",
    startLaserPrint
);


async function startLaserPrint() {

    if (
        !blisterData ||
        animationRunning
    ) {

        return;

    }


    animationRunning =
        true;


    printButton.disabled =
        true;


    cutButton.disabled =
        true;


    generateButton.disabled =
        true;


    excelButton.disabled =
        true;


    activateProcess(2);


    setMachineState(
        "LASER PRINTING",
        true
    );


    printStatus.innerText =
        "LASER HEAD INITIALIZING";


    laserAssembly.classList.add(
        "laser-active"
    );


    const pockets =
        blisterData.pockets;


    const svgPockets =
        blisterSheet.querySelectorAll(
            ".pocket"
        );


    const expiryElements =
        blisterSheet.querySelectorAll(
            ".expiry"
        );


    /*
       IMPORTANT:
       We use the ACTUAL SVG pocket
       for every index.

       0 = pocket 1
       1 = pocket 2
       2 = pocket 3
       ...
    */

    for (
        let i = 0;
        i < pockets.length;
        i++
    ) {

        const actualPocket =
            svgPockets[i];


        if (!actualPocket) {

            console.error(
                "Pocket not found:",
                i
            );

            continue;

        }


        const targetX =
            Number(
                actualPocket.getAttribute(
                    "cx"
                )
            );


        const targetY =
            Number(
                actualPocket.getAttribute(
                    "cy"
                )
            );


        const targetRY =
            Number(
                actualPocket.getAttribute(
                    "ry"
                )
            );


        printStatus.innerText =
            `MOVING LASER TO DOSE ${i + 1} / ${pockets.length}`;


        // ------------------------------------------
        // MOVE LASER TO ACTUAL POCKET
        // ------------------------------------------

        await moveLaserDirectly(
            targetX,
            targetY,
            targetRY
        );


        printStatus.innerText =
            `LASER PRINTING DOSE ${i + 1} / ${pockets.length}`;


        // Laser holds position while printing

        await sleep(
            550
        );


        // ------------------------------------------
        // MAKE EXPIRY BLACK
        // ------------------------------------------

        if (expiryElements[i]) {

            expiryElements[i]
                .classList.add(
                    "visible"
                );

        }


        actualPocket.classList.add(
            "printed"
        );


        // ------------------------------------------
        // PROGRESS
        // ------------------------------------------

        laserProgress.style.width =
            `${
                (
                    (i + 1) /
                    pockets.length
                ) * 100
            }%`;


        await sleep(
            180
        );

    }


    laserAssembly.classList.remove(
        "laser-active"
    );
// ----------------------------------------------
// RETURN LASER TO HOME POSITION
// ----------------------------------------------

printStatus.innerText =
    "RETURNING LASER TO HOME POSITION...";


await moveLaserHome();

    printed =
        true;


    animationRunning =
        false;


    printStatus.innerText =
        `PRINT COMPLETE ✓ — ${pockets.length} DOSES`;


    setMachineState(
        "PRINT COMPLETE",
        true
    );


    cutButton.disabled =
        false;


    excelButton.disabled =
        false;


    activateProcess(3);

}


// ==================================================
// DIRECT LASER MOVEMENT
// ==================================================

function moveLaserDirectly(
    targetX,
    targetY,
    targetRY
) {

    return new Promise(
        resolve => {

            const startX =
                Number(
                    laserHead.getAttribute(
                        "x"
                    )
                );


            const startY =
                Number(
                    laserHead.getAttribute(
                        "y"
                    )
                );


            /*
               Laser head is 42px wide.
               Therefore its center is:
               x + 21
            */

            const finalX =
                targetX - 21;


            /*
               Put laser above the
               actual pocket.
            */

            const finalY =
                targetY -
                targetRY -
                46;


            const startTime =
                performance.now();


            const duration =
                500;


            function animate(
                currentTime
            ) {

                const progress =
                    Math.min(
                        1,
                        (
                            currentTime -
                            startTime
                        ) /
                        duration
                    );


                /*
                   Smooth acceleration/deceleration
                */

                const eased =
                    1 -
                    Math.pow(
                        1 - progress,
                        3
                    );


                const x =
                    startX +
                    (
                        finalX -
                        startX
                    ) *
                    eased;


                const y =
                    startY +
                    (
                        finalY -
                        startY
                    ) *
                    eased;


                // Move laser head

                laserHead.setAttribute(
                    "x",
                    x
                );


                laserHead.setAttribute(
                    "y",
                    y
                );


                // Move laser beam

                const beamX =
                    x + 21;


                laserBeam.setAttribute(
                    "x1",
                    beamX
                );


                laserBeam.setAttribute(
                    "x2",
                    beamX
                );


                laserBeam.setAttribute(
                    "y1",
                    y + 22
                );


                laserBeam.setAttribute(
                    "y2",
                    targetY
                );


                if (
                    progress < 1
                ) {

                    requestAnimationFrame(
                        animate
                    );

                }
                else {

                    resolve();

                }

            }


            requestAnimationFrame(
                animate
            );

        }
    );

}

// ==================================================
// RETURN LASER TO HOME
// ==================================================

function moveLaserHome() {

    return new Promise(
        resolve => {

            const startX =
                Number(
                    laserHead.getAttribute(
                        "x"
                    )
                );

            const startY =
                Number(
                    laserHead.getAttribute(
                        "y"
                    )
                );


            // Home position is above the
            // left side of the blister.

            const finalX =
                120;

            const finalY =
                55;


            const startTime =
                performance.now();

            const duration =
                700;


            function animate(
                currentTime
            ) {

                const progress =
                    Math.min(
                        1,
                        (
                            currentTime -
                            startTime
                        ) / duration
                    );


                const eased =
                    1 -
                    Math.pow(
                        1 - progress,
                        3
                    );


                const x =
                    startX +
                    (
                        finalX -
                        startX
                    ) *
                    eased;


                const y =
                    startY +
                    (
                        finalY -
                        startY
                    ) *
                    eased;


                laserHead.setAttribute(
                    "x",
                    x
                );

                laserHead.setAttribute(
                    "y",
                    y
                );


                const beamX =
                    x + 21;


                laserBeam.setAttribute(
                    "x1",
                    beamX
                );

                laserBeam.setAttribute(
                    "x2",
                    beamX
                );

                laserBeam.setAttribute(
                    "y1",
                    y + 22
                );

                laserBeam.setAttribute(
                    "y2",
                    y + 22
                );


                if (
                    progress < 1
                ) {

                    requestAnimationFrame(
                        animate
                    );

                }
                else {

                    laserBeam.style.opacity =
                        "0";

                    resolve();

                }

            }


            requestAnimationFrame(
                animate
            );

        }
    );

}


// ==================================================
// CUTTING
// ==================================================

cutButton.addEventListener(
    "click",
    startCutting
);


async function startCutting() {

    if (
        !printed ||
        animationRunning
    ) {

        return;

    }


    animationRunning =
        true;


    cutButton.disabled =
        true;


    printButton.disabled =
        true;


    generateButton.disabled =
        true;


    excelButton.disabled =
        true;


    activateProcess(3);


    setMachineState(
        "CUTTING",
        true
    );


    cutDisplay.innerText =
        "CUTTER ACTIVE";


    cutStatus.innerText =
        "CUTTING OUTER PROFILE...";


    const sheet =
        blisterSheet.querySelector(
            ".sheet"
        );


    if (!sheet) {

        animationRunning =
            false;

        return;

    }


    const x =
        Number(
            sheet.getAttribute(
                "x"
            )
        );


    const y =
        Number(
            sheet.getAttribute(
                "y"
            )
        );


    const width =
        Number(
            sheet.getAttribute(
                "width"
            )
        );


    const height =
        Number(
            sheet.getAttribute(
                "height"
            )
        );


    const points = [

        [x, y],

        [x + width, y],

        [x + width, y + height],

        [x, y + height],

        [x, y]

    ];


    cutLine.style.opacity =
        "1";


    // ----------------------------------------------
    // OUTER CUT
    // ----------------------------------------------

    for (
        let i = 0;
        i < points.length - 1;
        i++
    ) {

        await animateCutSegment(

            points[i][0],
            points[i][1],

            points[i + 1][0],
            points[i + 1][1],

            650

        );


        cutStatus.innerText =
            `CUTTING SECTION ${i + 1} / 4`;

    }


    // ----------------------------------------------
    // INDIVIDUAL DOSE SEPARATION
    // ----------------------------------------------

    cutStatus.innerText =
        "SEPARATING INDIVIDUAL DOSES...";


    await sleep(
        700
    );


    await separateDoseAnimation();


    cut =
        true;


    animationRunning =
        false;


    cutDisplay.innerText =
        "CUT COMPLETE ✓";


    cutStatus.innerText =
        `${blisterData.total_doses} INDIVIDUAL DOSES READY`;


    setMachineState(
        "PRODUCTION COMPLETE",
        true
    );


    activateProcess(4);


    excelButton.disabled =
        false;

}


// ==================================================
// CUT SEGMENT ANIMATION
// ==================================================

function animateCutSegment(
    x1,
    y1,
    x2,
    y2,
    duration
) {

    return new Promise(
        resolve => {

            const startTime =
                performance.now();


            function animate(
                currentTime
            ) {

                const progress =
                    Math.min(
                        1,
                        (
                            currentTime -
                            startTime
                        ) /
                        duration
                    );


                const eased =
                    1 -
                    Math.pow(
                        1 - progress,
                        3
                    );


                const x =
                    x1 +
                    (
                        x2 -
                        x1
                    ) *
                    eased;


                const y =
                    y1 +
                    (
                        y2 -
                        y1
                    ) *
                    eased;


                cutLine.setAttribute(
                    "x1",
                    x1
                );


                cutLine.setAttribute(
                    "y1",
                    y1
                );


                cutLine.setAttribute(
                    "x2",
                    x
                );


                cutLine.setAttribute(
                    "y2",
                    y
                );


                if (
                    progress < 1
                ) {

                    requestAnimationFrame(
                        animate
                    );

                }
                else {

                    resolve();

                }

            }


            requestAnimationFrame(
                animate
            );

        }
    );

}


// ==================================================
// DOSE SEPARATION
// ==================================================

async function separateDoseAnimation() {

    const visualPockets =
        blisterSheet.querySelectorAll(
            ".pocket"
        );


    const tablets =
        blisterSheet.querySelectorAll(
            ".tablet"
        );


    for (
        let i = 0;
        i < visualPockets.length;
        i++
    ) {

        visualPockets[i]
            .classList.add(
                "separated"
            );


        if (tablets[i]) {

            tablets[i]
                .classList.add(
                    "separated"
                );

        }


        await sleep(
            50
        );

    }


    renderIndividualDoses();

}


// ==================================================
// INDIVIDUAL DOSES
// ==================================================

function renderIndividualDoses() {

    doseGrid.innerHTML = "";

    doseCount.innerText =
        `${blisterData.total_doses} INDIVIDUAL DOSES`;

    const tabletShape =
        document.getElementById("tabletShape").value;


    blisterData.pockets.forEach(
        (pocket, index) => {

            const dose =
                document.createElement("div");

            dose.className =
                "individual-dose";


            dose.innerHTML = `

<div class="single-blister ${tabletShape}">
                    <div class="single-foil">

                        <div class="single-pocket">

                            <div class="single-pocket-shine"></div>

                            <div class="single-tablet">

                                <div class="tablet-shine"></div>

                            </div>

                            <div class="single-expiry">
                                EXP ${formatDate(
                                    pocket.expiry_date
                                )}
                            </div>

                        </div>

                    </div>

                    <div class="single-dose-edge"></div>

                </div>

                <div class="dose-info">

                    <strong>
                        DOSE ${pocket.dose_number}
                    </strong>

                    <span>
                        ROW ${pocket.row}
                        • COLUMN ${pocket.column}
                    </span>

                    <span>
                        ${pocket.pocket_width}
                        ×
                        ${pocket.pocket_height}
                        mm
                    </span>

                    <b>
                        EXP ${formatDate(
                            pocket.expiry_date
                        )}
                    </b>

                </div>

            `;


            doseGrid.appendChild(
                dose
            );


            dose.style.opacity =
                "0";

            dose.style.transform =
                "translateY(25px) scale(0.9)";


            setTimeout(
                () => {

                    dose.style.transition =
                        "all 0.55s ease";

                    dose.style.opacity =
                        "1";

                    dose.style.transform =
                        "translateY(0) scale(1)";

                },
                index * 90
            );

        }
    );

}


// ==================================================
// EXCEL EXPORT
// ==================================================

excelButton.addEventListener(
    "click",
    exportExcel
);


async function exportExcel() {

    if (!blisterData) {
        return;
    }


    const settings =
        getSettings();


    excelButton.disabled =
        true;


    try {

        const response =
            await fetch(
                `${API}/api/export-excel`,
                {

                    method:
                        "POST",

                    headers:
                        {
                            "Content-Type":
                                "application/json"
                        },

                    body:
                        JSON.stringify(
                            settings
                        )

                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.detail ||
                "Excel export failed."
            );

        }


        parameterStatus.innerText =
            "EXCEL FILE GENERATED ✓";


        excelButton.innerText =
            "EXCEL GENERATED ✓";

    }
    catch (error) {

        console.error(error);


        parameterStatus.innerText =
            error.message;

    }


    excelButton.disabled =
        false;

}
// ==================================================
// RESET BUTTON
// ==================================================

function resetSimulation() {

    animationRunning = false;

    blisterData = null;

    printed = false;

    cut = false;


    // Clear generated blister
    if (blisterSheet) {
        blisterSheet.innerHTML = "";
    }

    if (blisterSvg) {
        blisterSvg.classList.add("hidden");
    }

    if (emptyMachine) {
        emptyMachine.classList.remove("hidden");
    }


    // Clear individual doses
    if (doseGrid) {

        doseGrid.innerHTML = `
            <div class="empty-dose">
                Individual doses will appear
                after the cutting simulation.
            </div>
        `;

    }


    if (doseCount) {
        doseCount.innerText = "0 DOSES";
    }


    // Reset buttons
    printButton.disabled = true;

    cutButton.disabled = true;

    excelButton.disabled = true;

    generateButton.disabled = false;


    // Reset production displays
    printPreview.innerText = "EXP: --";

    printStatus.innerText =
        "WAITING FOR BLISTER";

    cutDisplay.innerText =
        "CUTTER READY";

    cutStatus.innerText =
        "WAITING FOR PRINT";


    // Reset laser progress
    laserProgress.style.width = "0%";

    cutLine.style.opacity = "0";


    laserAssembly.classList.remove(
        "laser-active"
    );


    // Move laser back to home position
    laserHead.setAttribute(
        "x",
        "120"
    );

    laserHead.setAttribute(
        "y",
        "55"
    );

    laserBeam.setAttribute(
        "x1",
        "141"
    );

    laserBeam.setAttribute(
        "x2",
        "141"
    );

    laserBeam.setAttribute(
        "y1",
        "77"
    );

    laserBeam.setAttribute(
        "y2",
        "77"
    );


    parameterStatus.innerText =
        "READY — SELECT SHAPE AND GENERATE";


    activateProcess(1);

    setMachineState(
        "IDLE"
    );

}

// ==================================================
// PARAMETER CHANGE RESET
// ==================================================

const parameterIds = [
    "rows",
    "columns",
    "blisterWidth",
    "blisterHeight",
    "pocketWidth",
    "pocketHeight",
    "horizontalGap",
    "verticalGap",
    "expiryDate",
    "tabletShape"
];


parameterIds.forEach(
    id => {

        const element =
            document.getElementById(
                id
            );


        if (!element) {
            return;
        }


        element.addEventListener(
            "input",
            () => {

                parameterStatus.innerText =
                    "PARAMETERS MODIFIED — REGENERATE BLISTER";


                printButton.disabled =
                    true;


                cutButton.disabled =
                    true;


                excelButton.disabled =
                    true;


                printed =
                    false;


                cut =
                    false;

            }
        );

    }
);


// ==================================================
// UTILITY
// ==================================================

function sleep(
    milliseconds
) {

    return new Promise(
        resolve =>
            setTimeout(
                resolve,
                milliseconds
            )
    );

}


// ==================================================
// INITIAL STATE
// ==================================================

setMachineState(
    "IDLE"
);


printButton.disabled =
    true;


cutButton.disabled =
    true;


excelButton.disabled =
    true;


console.log(
    "SMARTMED realistic blister simulator loaded."
);