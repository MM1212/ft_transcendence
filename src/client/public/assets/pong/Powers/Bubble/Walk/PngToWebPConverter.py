import json
import sys
from PIL import Image
from pprint import pprint as pp

def convert_to_webp(input_path, output_path):
    try:
        img = Image.open(input_path)
        img.save(output_path, 'webp')
        print(f"Converted {input_path} to {output_path}")
    except Exception as e:
        print(f"Error converting {input_path}: {e}")

def convert_files(input_prefix, num_files):
    for i in range(num_files):
        input_path = f"{input_prefix}{i}.png"
        output_path = f"{input_prefix}{i}.webp"
        convert_to_webp(input_path, output_path)

def update_json_file(filename):
    json_file = f"{filename}.json"

    with open(json_file, 'r') as f:
        data = json.load(f)

    new_frames = {}
    for key, value in data['frames'].items():
        new_key = key.replace('.png', '.webp')
        new_frames[new_key] = value
    data['frames'] = new_frames

    if 'animations' in data:
    	for key in data['animations']:
        	for i in range(len(data['animations'][key])):
        	    data['animations'][key][i] = data['animations'][key][i].replace('.png', '.webp')

    with open(json_file, 'w') as f:
        json.dump(data, f, indent=4)

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python script.py <input_prefix> <num_files>")
        sys.exit(1)

    filename = sys.argv[1]
    num_files = int(sys.argv[2])

    convert_files(filename, num_files)
    update_json_file(filename)
    print(f"All files converted and JSON updated successfully.")
