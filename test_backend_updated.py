import requests
import json

data = {
    "title": "Test Notation Updated",
    "taal_config": {
        "name": "Teental",
        "beats": 16,
        "bols": ["धा", "धिन्", "धिन्", "धा", "धा", "धिन्", "धिन्", "धा", "धा", "तिन्", "तिन्", "ता", "ता", "धिन्", "धिन्", "धा"],
        "markers": ["x", "", "", "", "2", "", "", "", "0", "", "", "", "3", "", "", ""]
    },
    "rows": [
        { "id": "1", "type": "header", "content": "Gat Section" },
        { "id": "2", "type": "notation", "cells": ["सा", "रे", "ग", "म", "प", "ध", "नि", "सा", "सा़", "रे़", "ग़", "म॑", "पं", "धं", "निं", "सां"] }
    ]
}

def test_export(format):
    print(f"Testing {format} export...")
    try:
        response = requests.post(f"http://localhost:5000/api/export/{format}", json=data)
        if response.status_code == 200:
            print(f"Success! {format} size: {len(response.content)} bytes")
            with open(f"test_output_updated.{format}", "wb") as f:
                f.write(response.content)
        else:
            print(f"Failed! Status code: {response.status_code}")
            print(response.text)
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_export("txt")
    test_export("docx")
    test_export("pdf")
