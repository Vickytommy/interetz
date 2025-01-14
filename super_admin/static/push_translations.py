import pandas as pd
import psycopg2
from datetime import datetime
def read_excel_to_db(file_path):
    # Read Excel file
    df = pd.read_excel(file_path)

    # Connect to PostgreSQL database
    conn = psycopg2.connect(
        dbname='postgres',
        user='postgres',
        password='postgres',
        host='localhost',
        port='5432'
    )
    cursor = conn.cursor()

    # Insert data into database
    for index, row in df.iterrows():
        created_at = datetime.now()
        # Assuming 'your_table_name' is the name of your PostgreSQL table
        insert_query = "INSERT INTO super_admin_translations (translation_page_name, translation_english_verion,translation_hebrew_verion, created_at, updated_at) VALUES (%s, %s, %s, %s, %s)"
        values = (row['page'].strip(), row['english text'],row['hebrew text'], created_at, created_at)  # Adjust column names accordingly
        cursor.execute(insert_query, values)
    
    # Commit changes and close connection
    conn.commit()
    cursor.close()
    conn.close()

if __name__ == "__main__":
    excel_file_path = "elitenova_translations.xlsx"
    read_excel_to_db(excel_file_path)
 

#===============================================
# Kutiyana Memon hospital, Bangal godaaam, Khaaradar

# , Shams iqbal road
# 0302 - 8270786

# Korangi -->> tower ki trraf -->  


# Kutiyana Memon Hospital, Nawab Mahabat Khanji Rd, Kharadar Ghulam Hussain Kasim Quarters, Karachi, Karachi City, Sindh