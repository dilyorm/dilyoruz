from PIL import Image
import numpy as np
import os

def process_spritesheet(input_path, output_prefix, rows, cols, frame_width, frame_height):
    try:
        if not os.path.exists('public/sprites'):
            os.makedirs('public/sprites')
            
        sheet = Image.open(input_path).convert("RGBA")
        sheet_w, sheet_h = sheet.size
        print(f"Processing {input_path} ({sheet_w}x{sheet_h})")
        
        frame_idx = 0
        for r in range(rows):
            for c in range(cols):
                left = c * frame_width
                upper = r * frame_height
                right = left + frame_width
                lower = upper + frame_height
                
                # Crop frame
                frame = sheet.crop((left, upper, right, lower))
                
                # Check if frame is empty (optional optimization)
                if frame.getbbox() is None:
                    print(f"Frame {frame_idx} is empty, skipping")
                    continue
                
                # Remove background
                data = np.array(frame)
                red, green, blue, alpha = data.T
                # Refined threshold for white background
                white_areas = (red > 230) & (green > 230) & (blue > 230)
                data[..., 3][white_areas.T] = 0
                
                # Trim transparent edges (optional, but good for centering)
                # For now let's keep original size to maintain alignment
                
                final_frame = Image.fromarray(data)
                
                output_filename = f"public/sprites/{output_prefix}_{frame_idx}.png"
                final_frame.save(output_filename)
                print(f"Saved {output_filename}")
                frame_idx += 1
                
    except Exception as e:
        print(f"Error processing {input_path}: {e}")

# Assuming 2 cols, 3 rows, 416x416 based on 832x1248 size
# moving.png -> walk animation
process_spritesheet('moving.png', 'walk', 3, 2, 416, 416)

# waving.png -> wave animation
# Assuming same layout
process_spritesheet('waving.png', 'wave', 3, 2, 416, 416)
