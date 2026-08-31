def generate_print_job(expiry_date):
    """
    Creates a simulated print instruction.

    The demo prints ONLY the expiry date.
    It does not control real hardware.
    """

    print_job = f"""
========================================
SMARTMED PRINT SIMULATION
========================================

PRINT CONTENT:
EXP: {expiry_date}

========================================
PRINT JOB START
========================================

PRINT_TEXT "EXP: {expiry_date}"

========================================
PRINT JOB COMPLETE
========================================
"""

    return print_job