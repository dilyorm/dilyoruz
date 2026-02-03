from PIL import Image
import numpy as np

def remove_background(input_path, output_path):
    img = Image.open(input_path).convert("RGBA")
    data = np.array(img)
    
    # Define white threshold (e.g. 240-255)
    r, g, b, a = data.T
    white_areas = (r > 240) & (g > 240) & (b > 240)
    
    data[..., 3][white_areas.T] = 0
    
    new_img = Image.fromarray(data)
    new_img.save(output_path)
    print(f"Saved transparent image to {output_path}")

try:
    remove_background('public/lego-avatar.png', 'public/lego-avatar-transparent.png')
except Exception as e:
    print(f"Error: {e}")
