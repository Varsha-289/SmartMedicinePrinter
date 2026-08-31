import cv2
import numpy as np


def detect_object(image_bytes):
    """
    Basic computer-vision demonstration.

    Finds the largest object in an uploaded image
    and estimates its dimensions.

    This is a simulation component, not a production
    medicine-identification system.
    """

    # Convert uploaded image bytes to a NumPy array
    image_array = np.frombuffer(
        image_bytes,
        dtype=np.uint8
    )

    # Decode the image
    image = cv2.imdecode(
        image_array,
        cv2.IMREAD_COLOR
    )

    if image is None:
        return {
            "detected": False,
            "message": "Unable to read image."
        }

    # Convert to grayscale
    gray = cv2.cvtColor(
        image,
        cv2.COLOR_BGR2GRAY
    )

    # Reduce noise
    blurred = cv2.GaussianBlur(
        gray,
        (5, 5),
        0
    )

    # Detect light objects against a darker background
    _, threshold = cv2.threshold(
        blurred,
        120,
        255,
        cv2.THRESH_BINARY
    )

    # Find contours
    contours, _ = cv2.findContours(
        threshold,
        cv2.RETR_EXTERNAL,
        cv2.CHAIN_APPROX_SIMPLE
    )

    if not contours:
        return {
            "detected": False,
            "message": "No object detected."
        }

    # Find the largest object
    contour = max(
        contours,
        key=cv2.contourArea
    )

    area_pixels = cv2.contourArea(
        contour
    )

    # Ignore tiny objects
    if area_pixels < 100:
        return {
            "detected": False,
            "message": "Object is too small."
        }

    # Bounding box
    x, y, width, height = cv2.boundingRect(
        contour
    )

    # Demo camera calibration
    pixels_per_mm = 10

    width_mm = round(
        width / pixels_per_mm,
        2
    )

    height_mm = round(
        height / pixels_per_mm,
        2
    )

    return {
        "detected": True,

        "x": x,
        "y": y,

        "pixel_width": width,
        "pixel_height": height,

        "width_mm": width_mm,
        "height_mm": height_mm,

        "area_pixels": round(
            area_pixels,
            2
        )
    }