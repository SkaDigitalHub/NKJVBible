# save as download_bible.py
import requests
import json

books = ["Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy", 
         "Joshua", "Judges", "Ruth", "1 Samuel", "2 Samuel", "1 Kings", 
         "2 Kings", "1 Chronicles", "2 Chronicles", "Ezra", "Nehemiah", 
         "Esther", "Job", "Psalms", "Proverbs", "Ecclesiastes", 
         "Song of Solomon", "Isaiah", "Jeremiah", "Lamentations", 
         "Ezekiel", "Daniel", "Hosea", "Joel", "Amos", "Obadiah", 
         "Jonah", "Micah", "Nahum", "Habakkuk", "Zephaniah", "Haggai", 
         "Zechariah", "Malachi", "Matthew", "Mark", "Luke", "John", 
         "Acts", "Romans", "1 Corinthians", "2 Corinthians", "Galatians", 
         "Ephesians", "Philippians", "Colossians", "1 Thessalonians", 
         "2 Thessalonians", "1 Timothy", "2 Timothy", "Titus", "Philemon", 
         "Hebrews", "James", "1 Peter", "2 Peter", "1 John", "2 John", 
         "3 John", "Jude", "Revelation"]

bible_data = []

for book in books:
    for chapter in range(1, 151):  # Max 150 chapters (Psalms has 150)
        try:
            url = f"https://bible-api.com/{book} {chapter}?translation=kjv"
            response = requests.get(url, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                for verse in data.get('verses', []):
                    bible_data.append({
                        "book": verse['book_name'],
                        "chapter": verse['chapter'],
                        "verse": verse['verse'],
                        "text": verse['text']
                    })
                print(f"Downloaded {book} {chapter}")
            else:
                break  # No more chapters in this book
                
        except Exception as e:
            print(f"Error {book} {chapter}: {e}")
            break

# Save to file
with open('bible-kjv.json', 'w') as f:
    json.dump(bible_data, f)

print(f"Downloaded {len(bible_data)} verses!")
