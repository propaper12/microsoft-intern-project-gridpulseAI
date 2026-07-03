import sqlite3

conn = sqlite3.connect('sales.db')
cursor = conn.cursor()

cursor.execute('''
CREATE TABLE IF NOT EXISTS sales (
    id INTEGER PRIMARY KEY,
    product TEXT,
    Category TEXT,
    Sales REAL
)
''')

conn.commit()
conn.close()