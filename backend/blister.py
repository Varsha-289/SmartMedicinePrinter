from dataclasses import dataclass
from typing import List


@dataclass
class BlisterSettings:
    rows: int
    columns: int

    blister_width: float
    blister_height: float

    pocket_width: float
    pocket_height: float

    horizontal_gap: float
    vertical_gap: float

    expiry_date: str


def validate_settings(settings: BlisterSettings):
    """
    Validate blister dimensions before generating
    the simulated layout.
    """

    if settings.rows < 1:
        raise ValueError(
            "Rows must be at least 1."
        )

    if settings.columns < 1:
        raise ValueError(
            "Columns must be at least 1."
        )

    if settings.blister_width <= 0:
        raise ValueError(
            "Blister width must be greater than 0."
        )

    if settings.blister_height <= 0:
        raise ValueError(
            "Blister height must be greater than 0."
        )

    if settings.pocket_width <= 0:
        raise ValueError(
            "Pocket width must be greater than 0."
        )

    if settings.pocket_height <= 0:
        raise ValueError(
            "Pocket height must be greater than 0."
        )

    if settings.horizontal_gap < 0:
        raise ValueError(
            "Horizontal gap cannot be negative."
        )

    if settings.vertical_gap < 0:
        raise ValueError(
            "Vertical gap cannot be negative."
        )


def calculate_blister(settings: BlisterSettings):
    """
    Calculate the simulated blister layout.

    Each pocket receives the same expiry date.
    """

    validate_settings(settings)

    pockets = []

    for row in range(settings.rows):

        for column in range(settings.columns):

            x = (
                column
                * (
                    settings.pocket_width
                    + settings.horizontal_gap
                )
            )

            y = (
                row
                * (
                    settings.pocket_height
                    + settings.vertical_gap
                )
            )

            pockets.append({

                "dose_number":
                    len(pockets) + 1,

                "row":
                    row + 1,

                "column":
                    column + 1,

                "x":
                    round(x, 2),

                "y":
                    round(y, 2),

                "pocket_width":
                    settings.pocket_width,

                "pocket_height":
                    settings.pocket_height,

                "expiry_date":
                    settings.expiry_date,

                "print_status":
                    "NOT_PRINTED",

                "cut_status":
                    "NOT_CUT"

            })


    total_doses = (
        settings.rows
        * settings.columns
    )


    return {

        "rows":
            settings.rows,

        "columns":
            settings.columns,

        "total_doses":
            total_doses,

        "blister_width":
            settings.blister_width,

        "blister_height":
            settings.blister_height,

        "pocket_width":
            settings.pocket_width,

        "pocket_height":
            settings.pocket_height,

        "horizontal_gap":
            settings.horizontal_gap,

        "vertical_gap":
            settings.vertical_gap,

        "expiry_date":
            settings.expiry_date,

        "pockets":
            pockets

    }