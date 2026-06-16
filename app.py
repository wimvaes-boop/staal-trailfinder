from flask import Flask, send_from_directory
import os

# Start Flask server met de huidige map (.) als statische map
app = Flask(__name__, static_folder='.', static_url_path='')

@app.route("/")
def index():
    # Serveert de nieuwe index.html aan de root
    return send_from_directory('.', 'index.html')

if __name__ == "__main__":
    print("-----------------------------------------------------")
    print("Staal Trailfinder lokale ontwikkelserver opgestart!")
    print("Open http://127.0.0.1:5000 in je browser om te testen.")
    print("-----------------------------------------------------")
    app.run(debug=True, host="0.0.0.0", port=5000)