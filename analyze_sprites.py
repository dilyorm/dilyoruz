from PIL import Image
import os

def analyze_image(path):
    try:
        img = Image.open(path)
        print(f"Image: {path}")
        print(f"Format: {img.format}")
        print(f"Size: {img.size}")
        print(f"Mode: {img.mode}")
    except Exception as e:
        print(f"Error analyzing {path}: {e}")

analyze_image('moving.png')
analyze_image('waving.png')
