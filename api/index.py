import os
import sys

# Add the root directory to the sys.path so it can find the app module
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import app
