FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN mkdir -p instance

# Import initial data and generate predictions
RUN python setup_data.py

EXPOSE 5001

CMD ["python", "app.py"]