import bs4
import requests
import json
import os
import time
import random

TARGET_ROOT = "https://cparchives.miraheze.org"
TARGET_URL = "https://cparchives.miraheze.org/wiki/Clothing"
CDN_ROOT = "https://media.cplegacy.com/client/dist/assets/media/clothing"

def get_categories_links():
  print(f"Getting categories from {TARGET_URL}...")
  response = requests.get(TARGET_URL)
  soup = bs4.BeautifulSoup(response.text, "html.parser")
  anchors = soup.find("div", class_="mw-parser-output").find_all('a', href=True)
  categories = []
  for anchor in anchors:
    href = anchor['href']
    categories.append(TARGET_ROOT + href)
  return categories

def get_clothing_items(category_url):
  print(f"Getting clothing items from {category_url}...")
  response = requests.get(category_url)
  soup = bs4.BeautifulSoup(response.text, "html.parser")
  entries = soup.find('div', class_='mw-parser-output').find_all('tr')
  # Remove the first row
  entries = entries[1:]
  
  clothing_items = []
  for entry in entries:
    item = {}
    tds = entry.find_all('td')
    if len(tds) < 2:
      continue
    print(f"Parsing cloth {tds[1].text}[{tds[0].text}]..")
    item['id'] = int(tds[0].text)
    item['name'] = tds[1].text
    item["props"] = {}
    item["props"]["icon"] = tds[2].text != "N/A" and tds[2].class_ != "new"
    item["props"]["paper"] = tds[3].text != "N/A" and tds[3].class_ != "new"
    item["props"]["sprites"] = tds[4].text != "N/A" and tds[4].class_ != "new"
    if (not item["props"]["icon"]):
      print(f"Item {item['name']}[{item['id']}] does not have an icon. Skipping...")
      continue
    # make an HEAD request to check if the item exists
    item["props"]["in_cdn"] = requests.head(CDN_ROOT + "/icon/" + str(item['id']) + ".webp").status_code
    if item["props"]["in_cdn"] != 200:
      print(f"Item {item['name']}[{item['id']}] responded with {item['props']['in_cdn']}. Save? (y/n)")
      if input() != "y":
        continue
      else:
        print(f"Saving item manually {item['name']}[{item['id']}] to clothing-items.json")
    clothing_items.append(item)

  return clothing_items
      
      
def main():
  categories = get_categories_links()
  items = []
  for category in categories:
    items += get_clothing_items(category)
    time.sleep(random.randint(1, 3))
  with open("clothing-items.json", "w") as f:
    json.dump(items, f, indent=2)
  print("All clothing items exported to clothing-items.json")

if __name__ == "__main__":
  main()