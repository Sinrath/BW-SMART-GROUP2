FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN mkdir -p instance

# Import initial data
RUN python import_led_data.py && python import_electric_price_data.py

EXPOSE 5001

CMD ["python", "app.py"]