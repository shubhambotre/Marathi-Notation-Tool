import sqlite3
import os

def inspect_users():
    db_path = os.path.join(os.path.dirname(__file__), 'instance', 'marathi_notations.db')
    if not os.path.exists(db_path):
        # Try without instance folder if not found (depends on where Flask creates it)
        db_path = os.path.join(os.path.dirname(__file__), 'marathi_notations.db')
        
    if not os.path.exists(db_path):
        print(f"Database not found at {db_path}")
        return

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    print("\n--- Registered Users ---")
    cursor.execute("SELECT id, username, password, secret_question, secret_answer FROM user")
    users = cursor.fetchall()
    
    if not users:
        print("No users found.")
    else:
        for user in users:
            print(f"ID: {user[0]}")
            print(f"Username: {user[1]}")
            print(f"Password (Hashed): {user[2][:20]}...") 
            print(f"Secret Question: {user[3]}")
            print(f"Secret Answer: {user[4]}")
            print("-" * 20)

    print("\n--- Saved Notations ---")
    cursor.execute("SELECT id, title, taal_key, user_id, updated_at FROM notation")
    notations = cursor.fetchall()
    for n in notations:
        print(f"ID: {n[0]} | Title: {n[1]} | Taal: {n[2]} | UserID: {n[3]} | Last Updated: {n[4]}")

    conn.close()

if __name__ == "__main__":
    inspect_users()
