import streamlit as st
import sqlite3

conn = sqlite3.connect('sales.db')
cursor = conn.cursor()

cursor.execute("SELECT Category, SUM(Sales) AS TotalSales FROM sales GROUP BY Category")
categories = cursor.fetchall()

st.title("Kategori Bazlı Satışlar")
for category, total_sales in categories:
    st.write(f"{category}: {total_sales}")

conn.close()