#!/usr/bin/env bash
# Build script for Render / Railway deployment
set -o errexit

cd BACKEND

# Install Python dependencies
pip install -r requirements.txt

# Run Django migrations
python manage.py migrate

# Collect static files
python manage.py collectstatic --noinput
