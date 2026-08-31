from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from openpyxl import Workbook
from backend.blister import BlisterSettings, calculate_blister
import os


app = FastAPI(
    title="SMARTMED Blister Simulator",
    version="2.0"
)


# -----------------------------
# CORS
# -----------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


# -----------------------------
# PATHS
# -----------------------------

BASE_DIR = os.path.dirname(
    os.path.dirname(
        os.path.abspath(__file__)
    )
)

FRONTEND_DIR = os.path.join(
    BASE_DIR,
    "frontend"
)

GENERATED_DIR = os.path.join(
    BASE_DIR,
    "generated"
)

os.makedirs(
    GENERATED_DIR,
    exist_ok=True
)


# -----------------------------
# FRONTEND
# -----------------------------

app.mount(
    "/frontend",
    StaticFiles(
        directory=FRONTEND_DIR
    ),
    name="frontend"
)


@app.get("/")
def home():

    return FileResponse(
        os.path.join(
            FRONTEND_DIR,
            "index.html"
        )
    )


# -----------------------------
# REQUEST MODEL
# -----------------------------

class BlisterRequest(BaseModel):

    rows: int

    columns: int

    blister_width: float

    blister_height: float

    pocket_width: float

    pocket_height: float

    horizontal_gap: float

    vertical_gap: float

    expiry_date: str


# -----------------------------
# CREATE SETTINGS
# -----------------------------

def create_settings(request):

    return BlisterSettings(

        rows=request.rows,

        columns=request.columns,

        blister_width=request.blister_width,

        blister_height=request.blister_height,

        pocket_width=request.pocket_width,

        pocket_height=request.pocket_height,

        horizontal_gap=request.horizontal_gap,

        vertical_gap=request.vertical_gap,

        expiry_date=request.expiry_date

    )


# -----------------------------
# STATUS
# -----------------------------

@app.get("/api/status")
def status():

    return {

        "system": "SMARTMED",

        "status": "ONLINE",

        "mode": "SIMULATION",

        "blister_engine": "READY",

        "laser_printer": "SIMULATED",

        "cutter": "SIMULATED",

        "verification": "READY"

    }


# -----------------------------
# GENERATE BLISTER
# -----------------------------

@app.post("/api/generate")
def generate_blister(
    request: BlisterRequest
):

    try:

        settings = create_settings(
            request
        )

        result = calculate_blister(
            settings
        )

        return {

            "success": True,

            "message":
                "Blister generated successfully.",

            "blister":
                result

        }

    except ValueError as error:

        raise HTTPException(
            status_code=400,
            detail=str(error)
        )


# -----------------------------
# LASER PRINT SIMULATION
# -----------------------------

@app.post("/api/laser-print")
def laser_print(
    request: BlisterRequest
):

    try:

        settings = create_settings(
            request
        )

        blister = calculate_blister(
            settings
        )

        for pocket in blister["pockets"]:

            pocket["print_status"] = "PRINTED"

            pocket["printed_text"] = (
                "EXP: "
                + request.expiry_date
            )

        return {

            "success": True,

            "message":
                "Laser print simulation complete.",

            "printed_content":
                "EXP: "
                + request.expiry_date,

            "total_doses":
                blister["total_doses"],

            "pockets":
                blister["pockets"]

        }

    except ValueError as error:

        raise HTTPException(
            status_code=400,
            detail=str(error)
        )


# -----------------------------
# CUT SIMULATION
# -----------------------------

@app.post("/api/cut")
def cut_blister(
    request: BlisterRequest
):

    try:

        settings = create_settings(
            request
        )

        blister = calculate_blister(
            settings
        )

        for pocket in blister["pockets"]:

            pocket["print_status"] = "PRINTED"

            pocket["printed_text"] = (
                "EXP: "
                + request.expiry_date
            )

            pocket["cut_status"] = "CUT"

        return {

            "success": True,

            "message":
                "Cut simulation complete.",

            "total_individual_doses":
                blister["total_doses"],

            "pockets":
                blister["pockets"]

        }

    except ValueError as error:

        raise HTTPException(
            status_code=400,
            detail=str(error)
        )


# -----------------------------
# EXCEL EXPORT
# -----------------------------

@app.post("/api/export-excel")
def export_excel(
    request: BlisterRequest
):

    try:

        settings = create_settings(
            request
        )

        blister = calculate_blister(
            settings
        )

        workbook = Workbook()

        sheet = workbook.active

        sheet.title = "Blister Layout"


        sheet.append([
            "SMARTMED BLISTER SIMULATION"
        ])

        sheet.append([])

        sheet.append([
            "Rows",
            blister["rows"]
        ])

        sheet.append([
            "Columns",
            blister["columns"]
        ])

        sheet.append([
            "Total Doses",
            blister["total_doses"]
        ])

        sheet.append([
            "Blister Width (mm)",
            blister["blister_width"]
        ])

        sheet.append([
            "Blister Height (mm)",
            blister["blister_height"]
        ])

        sheet.append([
            "Pocket Width (mm)",
            blister["pocket_width"]
        ])

        sheet.append([
            "Pocket Height (mm)",
            blister["pocket_height"]
        ])

        sheet.append([
            "Horizontal Gap (mm)",
            blister["horizontal_gap"]
        ])

        sheet.append([
            "Vertical Gap (mm)",
            blister["vertical_gap"]
        ])

        sheet.append([
            "Expiry Date",
            blister["expiry_date"]
        ])

        sheet.append([])


        sheet.append([

            "Dose",

            "Row",

            "Column",

            "X Position (mm)",

            "Y Position (mm)",

            "Pocket Width (mm)",

            "Pocket Height (mm)",

            "Expiry Date",

            "Print Status",

            "Cut Status"

        ])


        for pocket in blister["pockets"]:

            sheet.append([

                pocket["dose_number"],

                pocket["row"],

                pocket["column"],

                pocket["x"],

                pocket["y"],

                pocket["pocket_width"],

                pocket["pocket_height"],

                pocket["expiry_date"],

                pocket["print_status"],

                pocket["cut_status"]

            ])


        output_file = os.path.join(
            GENERATED_DIR,
            "smartmed_blister_layout.xlsx"
        )


        workbook.save(
            output_file
        )


        return {

            "success": True,

            "message":
                "Excel file generated.",

            "filename":
                "smartmed_blister_layout.xlsx"

        }


    except ValueError as error:

        raise HTTPException(
            status_code=400,
            detail=str(error)
        )