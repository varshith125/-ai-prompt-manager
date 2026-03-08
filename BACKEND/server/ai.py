import os
from google import genai

API_KEY = "AIzaSyCrdpeWmcy5VS4bBp69Ss3X-dFsbu1PXkY"
client = genai.Client(api_key=API_KEY)

prompt = """ 
        Question: what is python, give response simply and categorise the question like education, food...., give formate 
        " Response:
          category:
        "
        
        """

# --- 3. Execute the API Call ---
MODEL_NAME = "gemini-2.5-flash"

print(f"Sending formatted prompt to model: {MODEL_NAME}...")

try:
    # Generate content using the defined model and prompt
    response = client.models.generate_content(
        model=MODEL_NAME,
        contents=prompt
    )

    # --- 4. Print the Clean Output ---
    print("\n--- Gemini's Poem Response (Clean Text) ---")
    # The .text property automatically handles the clean text output
    print(response.text)
    print("------------------------------------------")
    

except Exception as e:
    print(f"\nAn error occurred: {e}")
    print("Please ensure your API key is correct and valid.")
    print(" please refer the document")
    print

# The generated response will now be based on your detailed explanation,
# and the output will follow the model's standard clean text formatting.

# Requirements
# Django==3.2.25
# djangorestframework==3.14.0
# djangorestframework-simplejwt==5.3.2
# django-cors-headers==4.3.1
# web3==6.11.3
# google-generativeai==0.3.0