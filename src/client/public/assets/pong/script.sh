#!/bin/bash

# Navigate to the directory containing the PNG files
cd /path/to/your/folder

# Loop through each PNG file in the directory
for file in *.png; do
    # Get the filename without extension
    filename="${file%.*}"
    
    # Convert PNG to WebP
    cwebp -q 100 "$file" -o "$filename.webp"
done

